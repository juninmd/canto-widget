use super::*;
use crate::health::Target;

fn ep(id: &str, every: u64) -> Endpoint {
    Endpoint {
        id: id.into(),
        name: "API".into(),
        target: Target::Tcp { host: "db.interno".into(), port: 5432 },
        every_secs: every,
        limit_ms: 500,
        alert_down: true,
        alert_slow: true,
        alert_cert: true,
    }
}

fn state_with(endpoints: Vec<Endpoint>) -> HealthState {
    let s = HealthState::default();
    s.0.lock().unwrap().endpoints = endpoints;
    s
}

fn reading(at: i64, ms: Option<u32>) -> Sample {
    Sample { at, ms, err: ms.is_none().then(|| "conexão recusada".to_string()), cert_days: None }
}

#[test]
fn a_new_endpoint_is_due_at_once_then_only_after_its_interval() {
    let s = state_with(vec![ep("a", 60)]);
    assert_eq!(s.due(1_000).len(), 1);
    assert!(s.due(1_001).is_empty(), "a probe is already running");
    s.record(&ep("a", 60), reading(1_000, Some(10)));
    assert!(s.due(60_999).is_empty());
    assert_eq!(s.due(61_000).len(), 1);
}

#[test]
fn two_failures_surface_one_alert_and_the_view_shows_the_state() {
    let e = ep("a", 30);
    let s = state_with(vec![e.clone()]);
    assert!(s.record(&e, reading(0, None)).is_empty());
    let alerts = s.record(&e, reading(30_000, None));
    assert_eq!(alerts.len(), 1);
    let views = s.views();
    assert_eq!((views[0].health, views[0].samples.len()), (Health::Down, 2));
}

#[test]
fn a_reading_for_a_removed_endpoint_is_dropped() {
    let e = ep("gone", 30);
    let s = state_with(vec![]);
    assert!(s.record(&e, reading(0, None)).is_empty());
    assert!(s.views().is_empty());
}

#[test]
fn the_alert_is_a_status_alert_naming_the_endpoint_and_the_cause() {
    let e = ep("a", 60);
    let down = alert_event(&e, &Alert { kind: AlertKind::Down, reason: "conexão recusada".into() });
    assert_eq!((down.id.as_str(), down.title.as_str(), down.tag.as_str()), ("status:health-a", "API", "major"));
    assert_eq!(down.description, "fora do ar: conexão recusada");
    assert_eq!(crate::notification::content(&down).0, "Serviço com problema");
    let slow = alert_event(&e, &Alert { kind: AlertKind::Slow, reason: "900 ms > 500 ms".into() });
    assert_eq!((slow.tag.as_str(), slow.description.as_str()), ("minor", "latência alta: 900 ms > 500 ms"));
    let cert = |d: &str| alert_event(&e, &Alert { kind: AlertKind::Cert, reason: d.into() }).description;
    assert_eq!(cert("5"), "certificado vence em 5 dias");
    assert_eq!(cert("-1"), "certificado expirado");
}
