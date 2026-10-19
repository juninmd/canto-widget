use super::*;

const FORECAST_BODY: &str = r#"{
  "latitude": -23.5, "longitude": -46.6, "timezone": "America/Sao_Paulo",
  "current": { "time": "2026-10-17T10:30", "temperature_2m": 22.4, "apparent_temperature": 24.1, "weather_code": 3,
    "relative_humidity_2m": 71.4, "wind_speed_10m": 12.6, "wind_direction_10m": 225.0, "is_day": 0 },
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
    "weather_code": [61, 1],
    "sunrise": ["2026-10-17T05:40", "2026-10-18T05:39"],
    "sunset": ["2026-10-17T18:12", null],
    "uv_index_max": [8.4, null]
  }
}"#;

#[test]
fn the_forecast_parses_with_the_rain_window() {
    let forecast = parse_forecast(FORECAST_BODY.as_bytes()).unwrap();
    assert_eq!(
        forecast.now,
        Now {
            temp: 22.4,
            feels: 24.1,
            condition: Condition::Cloudy,
            humidity: 71,
            wind: 12.6,
            wind_dir: 225,
            is_day: false
        }
    );
    assert_eq!(forecast.hours.len(), 4);
    assert_eq!(
        forecast.hours[2],
        Hour { at: "2026-10-17T12:00".into(), temp: 25.2, rain: 65, condition: Condition::Rain }
    );
    assert_eq!(forecast.days.len(), 2);
    assert_eq!(
        forecast.days[1],
        Day {
            date: "2026-10-18".into(),
            min: 16.4,
            max: 27.0,
            rain: 20,
            condition: Condition::Clear,
            sunrise: "2026-10-18T05:39".into(),
            sunset: String::new(),
            uv: 0.0
        }
    );
    assert_eq!(forecast.rain_from.as_deref(), Some("2026-10-17T12:00"));
    assert_eq!((forecast.days[0].sunset.as_str(), forecast.days[0].uv), ("2026-10-17T18:12", 8.4));
}

#[test]
fn a_reading_without_the_new_fields_still_parses_as_a_plain_day() {
    let body = FORECAST_BODY
        .replace(
            ",\n    \"relative_humidity_2m\": 71.4, \"wind_speed_10m\": 12.6, \"wind_direction_10m\": 225.0, \"is_day\": 0",
            "",
        )
        .replace(r#""sunrise": ["2026-10-17T05:40", "2026-10-18T05:39"],"#, "");
    let forecast = parse_forecast(body.as_bytes()).unwrap();
    assert_eq!((forecast.now.humidity, forecast.now.wind, forecast.now.wind_dir), (0, 0.0, 0));
    assert!(forecast.now.is_day, "an API that omits the flag reads as day");
    assert_eq!(forecast.days[0].sunrise, "");
}

#[test]
fn humidity_and_direction_stay_inside_their_ranges() {
    let body = FORECAST_BODY.replace("71.4", "140.0").replace("225.0", "-90.0");
    let now = parse_forecast(body.as_bytes()).unwrap().now;
    assert_eq!((now.humidity, now.wind_dir), (100, 270));
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
fn every_geocoding_match_comes_back_with_its_state() {
    let body = br#"{"results":[
      {"name":"Londres","latitude":-27.0,"longitude":-67.0,"admin1":"Catamarca","country":"Argentina"},
      {"name":"London","latitude":51.5,"longitude":-0.1,"admin1":"England","country":"United Kingdom"}]}"#;
    let places = parse_places(body);
    assert_eq!(places.len(), 2, "the second candidate is what lets the user pick the right city");
    assert_eq!(
        places[1],
        Place {
            city: "London".into(),
            admin1: "England".into(),
            country: "United Kingdom".into(),
            lat: 51.5,
            lon: -0.1
        }
    );
    assert_eq!(parse_places(br#"{"generationtime_ms":0.1}"#), Vec::new());
    assert_eq!(parse_places(b"nao json"), Vec::new());
}

#[test]
fn a_match_that_is_not_a_point_on_earth_is_dropped_before_it_reaches_the_ui() {
    let body = br#"{"results":[
      {"name":"Nowhere","latitude":95.0,"longitude":0.0,"country":"Brasil"},
      {"name":"Sao Paulo","latitude":-23.5,"longitude":-46.6,"country":"Brasil"}]}"#;
    let places = parse_places(body);
    assert_eq!(places.len(), 1);
    assert_eq!(places[0].city, "Sao Paulo");
}

#[test]
fn a_saved_place_is_validated_like_any_other_value_from_the_webview() {
    let ok = Place {
        city: " São Paulo ".into(),
        admin1: " São Paulo ".into(),
        country: " Brasil ".into(),
        lat: -23.5,
        lon: -46.6,
    };
    let clean = clean_place(ok.clone()).unwrap();
    assert_eq!(clean.city, "São Paulo");
    assert_eq!(clean.admin1, "São Paulo");
    assert_eq!(clean.country, "Brasil");

    let bad = |place: Place| assert_eq!(clean_place(place.clone()), None, "{place:?}");
    bad(Place { city: "".into(), ..ok.clone() });
    bad(Place { city: "a\u{1}b".into(), ..ok.clone() });
    bad(Place { city: "x".repeat(MAX_CITY + 1), ..ok.clone() });
    bad(Place { lat: 90.5, ..ok.clone() });
    bad(Place { lon: -180.5, ..ok.clone() });
    bad(Place { lat: f64::NAN, ..ok.clone() });
    // The API omits the state for plenty of cities, so an empty one is fine.
    assert_eq!(
        clean_place(Place { admin1: String::new(), country: String::new(), ..ok }).map(|p| (p.admin1, p.country)),
        Some((String::new(), String::new()))
    );
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
