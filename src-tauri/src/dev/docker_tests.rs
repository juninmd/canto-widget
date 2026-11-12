use super::*;

const PS: &str = r#"{"ID":"a1","Names":"api-gateway","Image":"eclipse-temurin:21","State":"running","Status":"Up 2 hours (healthy)","Ports":"0.0.0.0:8080->8080/tcp, :::8080->8080/tcp","Labels":"com.docker.compose.project=backend,x=y"}
{"ID":"b2","Names":"minio","Image":"minio/minio","State":"exited","Status":"Exited (0) 3 days ago","Ports":"","Labels":""}
{"ID":"c3","Names":"keycloak","Image":"quay.io/keycloak/keycloak:24","State":"running","Status":"Up 40 minutes (unhealthy)","Ports":"8080/tcp, 0.0.0.0:8180->8080/tcp","Labels":"com.docker.compose.project=backend"}
"#;
const STATS: &str = r#"{"Name":"api-gateway","CPUPerc":"12.34%","MemUsage":"412.3MiB / 7.664GiB"}
{"Name":"keycloak","CPUPerc":"38.00%","MemUsage":"760MiB / 7.664GiB"}
"#;

#[test]
fn containers_join_their_stats_and_compose_project() {
    let all = parse_containers(PS, STATS);
    assert_eq!(all.len(), 3);
    assert_eq!((all[0].project.as_str(), all[0].health.as_str(), all[0].ports.clone()), ("backend", "ok", vec![8080]));
    assert!((all[0].cpu - 12.34).abs() < 0.01 && all[0].mem == 432_327_884);
    assert_eq!((all[1].state.as_str(), all[1].mem, all[1].project.as_str()), ("exited", 0, ""));
    assert_eq!((all[2].health.as_str(), all[2].ports.clone()), ("bad", vec![8180]));
}

#[test]
fn sizes_read_decimal_and_binary_units() {
    assert_eq!(parse_size("412MB"), 412_000_000);
    assert_eq!(parse_size("1.5GiB"), 1_610_612_736);
    assert_eq!(parse_size("892kB"), 892_000);
    assert_eq!(parse_size("0B"), 0);
    assert_eq!(parse_size("lixo"), 0);
}

#[test]
fn only_published_ports_count() {
    assert!(host_ports("5432/tcp").is_empty());
    assert_eq!(host_ports("0.0.0.0:9000-9001->9000-9001/tcp"), Vec::<u16>::new());
    assert_eq!(host_ports("127.0.0.1:3306->3306/tcp, [::]:3306->3306/tcp"), vec![3306]);
}

#[test]
fn health_comes_from_the_status_text() {
    assert_eq!(health("Up 5 minutes (health: starting)"), "starting");
    assert_eq!(health("Up 5 minutes"), "");
}

#[test]
fn images_are_used_by_name_or_id_and_dangling_ones_are_not() {
    let text = r#"{"ID":"sha1","Repository":"postgres","Tag":"16","Size":"431MB","CreatedSince":"2 weeks ago"}
{"ID":"sha2","Repository":"<none>","Tag":"<none>","Size":"640MB","CreatedSince":"4 months ago"}
{"ID":"sha3","Repository":"node","Tag":"18-alpine","Size":"178MB","CreatedSince":"6 months ago"}
"#;
    let used: HashSet<String> = ["postgres:16".to_string()].into();
    let all = parse_images(text, &used);
    assert_eq!(all.iter().map(|i| i.used).collect::<Vec<_>>(), vec![true, false, false]);
    assert_eq!(all[1].name, "<none>");
    assert_eq!(all[0].size, 431_000_000);
}

#[test]
fn volumes_in_the_dangling_list_are_unused() {
    let text = "{\"Name\":\"pgdata\",\"Driver\":\"local\"}\n{\"Name\":\"old\",\"Driver\":\"local\"}\n";
    let unused: HashSet<String> = ["old".to_string()].into();
    let all = parse_named(text, "Name", "Driver", &unused);
    assert_eq!((all[0].used, all[1].used), (true, false));
}

#[test]
fn targets_that_look_like_flags_or_shell_are_refused() {
    for bad in ["", "-f", "--all", "a b", "a;rm", "$(x)", ".hidden", "a\nb"] {
        assert!(!valid_target(bad), "{bad:?}");
    }
    for good in ["api-gateway", "quay.io/keycloak/keycloak:24", "sha256:abc", "a_b.c"] {
        assert!(valid_target(good), "{good:?}");
    }
    assert!(action("rm", "-f").is_err() && action("exec", "ok").is_err());
    assert!(prune("system").is_err() && logs("a b").is_err());
}
