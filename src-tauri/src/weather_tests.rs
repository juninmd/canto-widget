use super::*;

const FORECAST_BODY: &str = r#"{
  "latitude": -23.5, "longitude": -46.6, "timezone": "America/Sao_Paulo",
  "current": { "time": "2026-10-17T10:30", "temperature_2m": 22.4, "apparent_temperature": 24.1, "weather_code": 3 },
  "hourly": {
    "time": ["2026-10-17T10:00", "2026-10-17T11:00", "2026-10-17T12:00", "2026-10-17T13:00"],
    "temperature_2m": [22.4, 23.9, 25.2, 24.8],
    "precipitation_probability": [10, 20, 65, 80],
    "weather_code": [3, 2, 61, 63]
  },
  "daily": {
    "time": ["2026-10-17", "2026-10-18"],
    "temperature_2m_max": [25.2, 27.0],
    "temperature_2m_min": [17.1, 16.4],
    "precipitation_probability_max": [80, 20],
    "weather_code": [61, 1]
  }
}"#;

#[test]
fn the_forecast_parses_with_the_rain_window() {
    let forecast = parse_forecast(FORECAST_BODY.as_bytes()).unwrap();
    assert_eq!(forecast.now, Now { temp: 22.4, feels: 24.1, condition: Condition::Cloudy });
    assert_eq!(forecast.hours.len(), 4);
    assert_eq!(
        forecast.hours[2],
        Hour { at: "2026-10-17T12:00".into(), temp: 25.2, rain: 65, condition: Condition::Rain }
    );
    assert_eq!(forecast.days.len(), 2);
    assert_eq!(
        forecast.days[1],
        Day { date: "2026-10-18".into(), min: 16.4, max: 27.0, rain: 20, condition: Condition::Clear }
    );
    assert_eq!(forecast.rain_from.as_deref(), Some("2026-10-17T12:00"));
}

#[test]
fn a_forecast_without_hours_or_current_is_dropped() {
    assert_eq!(
        parse_forecast(br#"{"current":{"temperature_2m":1.0,"apparent_temperature":1.0,"weather_code":0}}"#),
        None
    );
    assert_eq!(parse_forecast(br#"{"hourly":{"time":[],"temperature_2m":[]}}"#), None);
    assert_eq!(parse_forecast(b"<html>non json</html>"), None);
}

#[test]
fn missing_rain_probabilities_read_as_no_rain() {
    let body = FORECAST_BODY
        .replace(
            r#""precipitation_probability": [10, 20, 65, 80]"#,
            r#""precipitation_probability": [null, null, null, null]"#,
        )
        .replace(r#""precipitation_probability_max": [80, 20]"#, r#""precipitation_probability_max": []"#);
    let forecast = parse_forecast(body.as_bytes()).unwrap();
    assert!(forecast.hours.iter().all(|h| h.rain == 0));
    assert_eq!(forecast.rain_from, None);
    assert_eq!(forecast.days[0].rain, 0);
}

#[test]
fn every_wmo_group_lands_in_a_condition() {
    assert_eq!(condition(0), Condition::Clear);
    assert_eq!(condition(3), Condition::Cloudy);
    assert_eq!(condition(45), Condition::Fog);
    assert_eq!(condition(53), Condition::Drizzle);
    assert_eq!(condition(65), Condition::Rain);
    assert_eq!(condition(75), Condition::Snow);
    assert_eq!(condition(99), Condition::Storm);
}

#[test]
fn the_first_geocoding_result_wins() {
    let body = br#"{"results":[{"name":"Sao Paulo","latitude":-23.5,"longitude":-46.6,"country":"Brasil"},
      {"name":"Sao Paulo do Potengi","latitude":-5.9,"longitude":-35.7,"country":"Brasil"}]}"#;
    let place = parse_place(body).unwrap();
    assert_eq!(place, Place { city: "Sao Paulo".into(), country: "Brasil".into(), lat: -23.5, lon: -46.6 });
    assert_eq!(parse_place(br#"{"generationtime_ms":0.1}"#), None);
    assert_eq!(parse_place(b"nao json"), None);
}

#[test]
fn a_city_name_is_trimmed_and_bounded_before_it_becomes_a_request() {
    assert_eq!(clean_city("  São Paulo ").as_deref(), Some("São Paulo"));
    assert_eq!(clean_city(""), None);
    assert_eq!(clean_city("   "), None);
    assert_eq!(clean_city("a\tb"), None, "controle");
    assert_eq!(clean_city("--"), None, "sem letra nem número");
    assert_eq!(clean_city(&"a".repeat(MAX_CITY)).map(|c| c.len()), Some(MAX_CITY));
    assert_eq!(clean_city(&"a".repeat(MAX_CITY + 1)), None);
}
