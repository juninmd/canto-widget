use super::*;

fn ep(target: Target) -> Endpoint {
    Endpoint {
        id: "e1".into(),
        name: "API".into(),
        target,
        every_secs: 60,
        limit_ms: 500,
        alert_down: true,
        alert_slow: true,
        alert_cert: true,
    }
}

fn http() -> Endpoint {
    ep(Target::Http { url: "https://api.exemplo.dev/health".into() })
}

fn s(ms: Option<u32>, cert_days: Option<i64>) -> Sample {
    Sample { at: 0, ms, err: ms.is_none().then(|| "recusou a conexão".to_string()), cert_days }
}

fn feed(t: &mut Tracker, e: &Endpoint, h: &mut VecDeque<Sample>, readings: &[Option<u32>]) -> Vec<Vec<Alert>> {
    readings
        .iter()
        .map(|ms| {
            push(h, s(*ms, None));
            t.observe(e, h)
        })
        .collect()
}

#[test]
fn a_reading_is_up_slow_or_down_against_the_limit() {
    let e = http();
    assert_eq!(classify(&e, &s(Some(500), None)), Health::Up);
    assert_eq!(classify(&e, &s(Some(501), None)), Health::Slow);
    assert_eq!(classify(&e, &s(None, None)), Health::Down);
    assert_eq!(health(&e, &VecDeque::new()), Health::Unknown);
}

#[test]
fn down_alerts_only_after_two_failures_and_only_once() {
    let (e, mut t, mut h) = (http(), Tracker::default(), VecDeque::new());
    let out = feed(&mut t, &e, &mut h, &[Some(100), None, None, None]);
    assert!(out[1].is_empty(), "one failure is not an outage");
    assert_eq!(out[2], [Alert { kind: AlertKind::Down, reason: "recusou a conexão".into() }]);
    assert!(out[3].is_empty(), "no repeat while it stays down");
}

#[test]
fn recovering_rearms_the_alert() {
    let (e, mut t, mut h) = (http(), Tracker::default(), VecDeque::new());
    let out = feed(&mut t, &e, &mut h, &[None, None, Some(90), None, None]);
    assert_eq!(out[1].len(), 1);
    assert_eq!(out[4].len(), 1, "down again after an up reading");
}

#[test]
fn high_latency_needs_two_slow_readings_and_a_blip_is_ignored() {
    let (e, mut t, mut h) = (http(), Tracker::default(), VecDeque::new());
    let out = feed(&mut t, &e, &mut h, &[Some(900), Some(100), Some(900), Some(950)]);
    assert!(out[0].is_empty() && out[2].is_empty());
    assert_eq!(out[3], [Alert { kind: AlertKind::Slow, reason: "950 ms > 500 ms".into() }]);
}

#[test]
fn improving_from_down_to_slow_does_not_alert_again() {
    let (e, mut t, mut h) = (http(), Tracker::default(), VecDeque::new());
    let out = feed(&mut t, &e, &mut h, &[None, None, Some(900), Some(900)]);
    assert!(out[3].is_empty());
}

#[test]
fn switches_turn_each_alert_off() {
    let mut e = http();
    e.alert_down = false;
    let (mut t, mut h) = (Tracker::default(), VecDeque::new());
    assert!(feed(&mut t, &e, &mut h, &[None, None]).iter().all(Vec::is_empty));
}

#[test]
fn the_certificate_warns_once_inside_the_window_and_rearms_after_renewal() {
    let e = ep(Target::Dns { host: "exemplo.dev".into(), port: 443 });
    let (mut t, mut h) = (Tracker::default(), VecDeque::new());
    let mut run = |days| {
        push(&mut h, s(Some(20), Some(days)));
        t.observe(&e, &h)
    };
    assert!(run(40).is_empty());
    assert_eq!(run(14), [Alert { kind: AlertKind::Cert, reason: "14".into() }]);
    assert!(run(13).is_empty(), "already announced");
    assert!(run(80).is_empty(), "renewed");
    assert_eq!(run(10).len(), 1, "expiring again");
}

#[test]
fn history_is_bounded() {
    let mut h = VecDeque::new();
    for i in 0..HISTORY + 30 {
        push(&mut h, Sample { at: i as i64, ms: Some(1), err: None, cert_days: None });
    }
    assert_eq!((h.len(), h.front().unwrap().at), (HISTORY, 30));
}

#[test]
fn validation_cleans_and_rejects_what_the_webview_sends() {
    let mut e = http();
    e.name = "  API  ".into();
    assert_eq!(validate(e.clone()).unwrap().name, "API");
    for bad in ["ftp://x.dev", "javascript:alert(1)", "não é url", "https://"] {
        e.target = Target::Http { url: bad.into() };
        assert!(validate(e.clone()).is_err(), "{bad}");
    }
    let tcp = |host: &str, port| ep(Target::Tcp { host: host.into(), port });
    assert!(validate(tcp("db.interno", 5432)).is_ok());
    assert!(validate(tcp("db interno", 5432)).is_err());
    assert!(validate(tcp("db.interno", 0)).is_err());
    assert!(validate(Endpoint { every_secs: 7, ..http() }).is_err());
    assert!(validate(Endpoint { limit_ms: 10, ..http() }).is_err());
    assert!(validate(Endpoint { name: " ".into(), ..http() }).is_err());
}

#[test]
fn the_wire_format_is_flat_with_a_kind_tag() {
    let json = serde_json::to_value(ep(Target::Tcp { host: "db".into(), port: 5432 })).unwrap();
    assert_eq!(
        (json["kind"].as_str(), json["host"].as_str(), json["port"].as_u64()),
        (Some("tcp"), Some("db"), Some(5432))
    );
    let dns: Endpoint = serde_json::from_str(
        r#"{"name":"x","kind":"dns","host":"exemplo.dev","every_secs":60,"limit_ms":500,"alert_down":true,"alert_slow":false}"#,
    )
    .unwrap();
    assert_eq!(dns.target, Target::Dns { host: "exemplo.dev".into(), port: 443 });
    assert!(!dns.alert_cert);
}
