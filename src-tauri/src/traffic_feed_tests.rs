use super::*;
use crate::traffic::IncidentKind;

#[test]
fn flow_reads_both_speeds_and_a_closed_road_is_zero() {
    let body = br#"{"flowSegmentData":{"frc":"FRC2","currentSpeed":23,"freeFlowSpeed":48,"roadClosure":false}}"#;
    assert_eq!(parse_flow(body), Some((23.0, 48.0)));
    let closed = br#"{"flowSegmentData":{"currentSpeed":40,"freeFlowSpeed":48,"roadClosure":true}}"#;
    assert_eq!(parse_flow(closed), Some((0.0, 48.0)));
    assert_eq!(parse_flow(b"{}"), None);
}

#[test]
fn incidents_are_placed_named_and_sorted_by_distance() {
    let body = r#"{"incidents":[
      {"type":"Feature","geometry":{"type":"LineString","coordinates":[[-46.60,-23.53],[-46.61,-23.53]]},
       "properties":{"iconCategory":6,"magnitudeOfDelay":2,"events":[{"description":"Trânsito lento"}],"from":"Av. Aurora","to":"Rua Fictícia","delay":360}},
      {"type":"Feature","geometry":{"type":"Point","coordinates":[-46.6,-23.501]},
       "properties":{"iconCategory":1,"magnitudeOfDelay":3,"events":[{"description":"Acidente"}],"from":"Av. Aurora","to":"Av. Aurora"}},
      {"type":"Feature","geometry":{"type":"Point","coordinates":[10.0,50.0]},"properties":{"iconCategory":9}}
    ]}"#;
    let list = parse_incidents(body.as_bytes(), (-23.5, -46.6));
    assert_eq!(list.len(), 2, "the far one is dropped");
    assert_eq!(list[0].kind, IncidentKind::Accident);
    assert_eq!(list[0].road, "Av. Aurora", "a stretch from and to the same road names it once");
    assert_eq!(list[1].road, "Av. Aurora → Rua Fictícia");
    assert_eq!(list[1].delay_s, 360);
    assert_eq!(list[1].text, "Trânsito lento");
    assert!(parse_incidents(b"not json", (0.0, 0.0)).is_empty());
}

#[test]
fn a_route_gives_minutes_with_and_without_traffic_and_its_line() {
    let body = br#"{"routes":[{"summary":{"lengthInMeters":12400,"travelTimeInSeconds":1440,"trafficDelayInSeconds":540,"noTrafficTravelTimeInSeconds":900},
      "legs":[{"points":[{"latitude":-23.5,"longitude":-46.6},{"latitude":-23.45,"longitude":-46.55}]}]}]}"#;
    let r = parse_route(body).unwrap();
    assert_eq!((r.minutes, r.free_minutes, r.km), (24, 15, 12.4));
    assert_eq!(r.points, vec![[-23.5, -46.6], [-23.45, -46.55]]);
    let summary_only =
        br#"{"routes":[{"summary":{"lengthInMeters":1000,"travelTimeInSeconds":600,"trafficDelayInSeconds":120}}]}"#;
    assert_eq!(parse_route(summary_only).unwrap().free_minutes, 8, "free time falls back to time minus delay");
}
