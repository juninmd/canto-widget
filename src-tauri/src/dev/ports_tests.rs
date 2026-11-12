use super::*;

const NETSTAT: &str = "
Conexões ativas

  Proto  Endereço local         Endereço externo       Estado           PID
  TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       18432
  TCP    127.0.0.1:5173         0.0.0.0:0              OUVINDO         20116
  TCP    [::]:3000              [::]:0                 LISTENING       18432
  TCP    192.168.0.5:51432      52.1.2.3:443           ESTABLISHED     7788
  UDP    0.0.0.0:5353           *:*                                    2240
  UDP    [::1]:1900             *:*                                    6120
";

#[test]
fn netstat_keeps_listeners_in_any_language_and_drops_connections() {
    let all = parse_netstat(NETSTAT);
    assert_eq!(all.len(), 5);
    assert_eq!(all[1], Raw { proto: "TCP", addr: "127.0.0.1".into(), port: 5173, pid: 20116 });
    assert!(all.iter().all(|r| r.port != 51432));
    assert_eq!(all[3].proto, "UDP");
}

#[test]
fn lsof_pairs_each_socket_with_its_process() {
    let text = "p18432\nPTCP\nn*:3000\nPTCP\nn[::1]:9229\np2240\nPUDP\nn*:5353\nPUDP\nn10.0.0.2:1234->1.1.1.1:53\n";
    let all = parse_lsof(text);
    assert_eq!(all.len(), 3);
    assert_eq!(all[0], Raw { proto: "TCP", addr: "0.0.0.0".into(), port: 3000, pid: 18432 });
    assert_eq!(all[1].addr, "::1");
    assert_eq!(all[2], Raw { proto: "UDP", addr: "0.0.0.0".into(), port: 5353, pid: 2240 });
}

#[test]
fn ss_reads_the_pid_out_of_the_users_column() {
    let text = "tcp   LISTEN 0 511 0.0.0.0:3000 0.0.0.0:* users:((\"node\",pid=18432,fd=23))\n\
                udp   UNCONN 0 0 127.0.0.54:53 0.0.0.0:* users:((\"systemd-resolve\",pid=612,fd=14))\n\
                tcp   LISTEN 0 4096 [::1]:631 [::]:*\n";
    let all = parse_ss(text);
    assert_eq!(all.len(), 2, "a socket whose owner is hidden has no PID to show");
    assert_eq!((all[0].port, all[0].pid, all[0].proto), (3000, 18432, "TCP"));
    assert_eq!((all[1].addr.as_str(), all[1].proto), ("127.0.0.54", "UDP"));
}

#[test]
fn split_addr_handles_wildcards_and_brackets() {
    assert_eq!(split_addr("*:80"), Some(("0.0.0.0".into(), 80)));
    assert_eq!(split_addr("[::]:443"), Some(("::".into(), 443)));
    assert_eq!(split_addr("localhost:0"), None);
    assert_eq!(split_addr("sem-porta"), None);
}

#[test]
fn merge_counts_a_dual_stack_listener_once_and_flags_exposure() {
    let raw = vec![
        Raw { proto: "TCP", addr: "127.0.0.1".into(), port: 3000, pid: 7 },
        Raw { proto: "TCP", addr: "0.0.0.0".into(), port: 3000, pid: 7 },
        Raw { proto: "TCP", addr: "::1".into(), port: 5173, pid: 9 },
    ];
    let info = HashMap::from([(
        7,
        Info { name: "node".into(), cmd: "node x".into(), cwd: "/p/site".into(), ppid: 1, mem: 5 },
    )]);
    let all = merge(raw, &info);
    assert_eq!(all.len(), 2);
    assert!(all[0].exposed && all[0].addr == "0.0.0.0" && all[0].cwd == "/p/site");
    assert!(!all[1].exposed);
    assert_eq!(all[1].name, "PID 9", "a process we cannot read still shows its PID");
}

#[test]
fn killing_a_system_pid_or_the_app_is_refused() {
    assert!(kill(0, false).is_err());
    assert!(kill(4, true).is_err());
    assert!(kill(std::process::id(), false).is_err());
}
