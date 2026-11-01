use super::*;
use crate::weather::{Day, Now};

fn hour(at: &str, temp: f64) -> Hour {
    Hour {
        at: format!("2026-11-01T{at}"),
        temp,
        rain: 0,
        condition: Condition::Clear,
        feels: temp,
        wind: 5.0,
        wind_dir: 0,
        precip: 0.0,
    }
}

fn day(max: f64, uv: f64) -> Day {
    Day {
        date: "2026-11-01".into(),
        min: max - 8.0,
        max,
        rain: 0,
        condition: Condition::Clear,
        sunrise: String::new(),
        sunset: String::new(),
        uv,
    }
}

/// A mild, dry morning in the city: no hint at all.
fn calm() -> Forecast {
    Forecast {
        now: Now {
            temp: 22.0,
            feels: 22.0,
            condition: Condition::Clear,
            humidity: 60,
            wind: 8.0,
            wind_dir: 0,
            is_day: true,
            gusts: Some(15.0),
            pressure: None,
            visibility: Some(20.0),
            dew_point: None,
        },
        hours: (8..20).map(|h| hour(&format!("{h:02}:00"), 22.0)).collect(),
        days: vec![day(25.0, 5.0), day(26.0, 5.0)],
        rain_from: None,
        next_rain: Vec::new(),
        air: Some(30),
    }
}

fn kinds(f: &Forecast) -> Vec<&'static str> {
    hints(f).iter().map(|h| h.kind).collect()
}

#[test]
fn a_calm_day_gives_no_hint() {
    assert!(hints(&calm()).is_empty());
    assert_eq!(local_hour(&calm()), 8);
    assert_eq!(local_date(&calm()), "2026-11-01");
}

#[test]
fn rain_soon_asks_for_an_umbrella_with_the_hour() {
    let mut f = calm();
    f.hours[3].rain = 70;
    let h = &hints(&f)[0];
    assert_eq!((h.kind, h.severe), ("rain", false));
    assert_eq!(h.title, "Leve guarda-chuva");
    assert_eq!(h.body, "Chuva por volta das 11:00 (70%).");
    f.hours[3].precip = 15.0;
    assert!(hints(&f)[0].severe, "a downpour");
    let mut f = calm();
    f.hours[8].rain = 90;
    assert!(hints(&f).is_empty(), "too far ahead to carry an umbrella now");
}

#[test]
fn the_nowcast_rings_before_the_hourly_chance() {
    let mut f = calm();
    f.next_rain = vec![0.0, 0.2, 0.3, 0.0];
    assert_eq!(hints(&f)[0].body, "Chuva na próxima hora.");
}

#[test]
fn a_storm_says_stay_in_and_replaces_the_rain_hint() {
    let mut f = calm();
    f.hours[2].rain = 80;
    f.hours[4].condition = Condition::Storm;
    let all = hints(&f);
    assert_eq!(all.iter().map(|h| h.kind).collect::<Vec<_>>(), ["storm"]);
    assert!(all[0].severe && all[0].body.contains("12:00") && all[0].body.contains("Evite sair"));
}

#[test]
fn heat_asks_for_water_and_extreme_heat_to_stay_in() {
    let mut f = calm();
    f.hours[5].feels = 34.4;
    let h = &hints(&f)[0];
    assert_eq!((h.kind, h.severe, h.title.as_str()), ("heat", false, "Beba água"));
    assert!(h.body.contains("34°"));
    f.hours[5].feels = 41.0;
    let h = &hints(&f)[0];
    assert_eq!((h.severe, h.title.as_str()), (true, "Calor extremo"));
}

#[test]
fn cold_names_the_coldest_hour() {
    let mut f = calm();
    f.hours[10].feels = 7.0;
    assert_eq!(hints(&f)[0].body, "Sensação de 7° (18:00).");
    f.now.feels = -2.0;
    let h = &hints(&f)[0];
    assert!(h.severe && h.body.starts_with("Sensação de -2° (agora)"));
}

#[test]
fn wind_uses_the_gusts_and_the_next_hours() {
    let mut f = calm();
    f.now.gusts = Some(62.0);
    assert_eq!(kinds(&f), ["wind"]);
    f.hours[1].wind = 85.0;
    let h = &hints(&f)[0];
    assert!(h.severe && h.body.contains("85 km/h"));
}

#[test]
fn uv_only_while_the_peak_is_ahead() {
    let mut f = calm();
    f.days[0].uv = 9.0;
    assert_eq!(kinds(&f), ["uv"]);
    f.days[0].uv = 11.0;
    assert!(hints(&f)[0].severe);
    f.hours[0].at = "2026-11-01T16:00".into();
    assert!(hints(&f).is_empty(), "past the peak");
}

#[test]
fn bad_air_fog_and_dry_air() {
    let mut f = calm();
    f.air = Some(120);
    assert_eq!(kinds(&f), ["air"]);
    f.air = Some(160);
    assert!(hints(&f)[0].severe);
    let mut f = calm();
    f.now.visibility = Some(0.4);
    assert_eq!(hints(&f)[0].body, "Visibilidade de 0.4 km. Dirija com cuidado e use farol baixo.");
    let mut f = calm();
    f.now.humidity = 25;
    assert_eq!((hints(&f)[0].kind, hints(&f)[0].severe), ("dry", false));
    f.now.humidity = 18;
    assert!(hints(&f)[0].severe);
    f.now.humidity = 0;
    assert!(hints(&f).is_empty(), "0 means the API sent nothing");
}

#[test]
fn snow_and_a_front_tomorrow() {
    let mut f = calm();
    f.hours[6].condition = Condition::Snow;
    assert_eq!(kinds(&f), ["snow"]);
    let mut f = calm();
    f.days[1].max = 15.0;
    let h = &hints(&f)[0];
    assert_eq!(
        (h.title.as_str(), h.body.as_str()),
        ("Frente fria amanhã", "A máxima cai de 25° para 15°. Separe um agasalho.")
    );
    f.days[1].max = 34.0;
    assert_eq!(hints(&f)[0].title, "Calor amanhã");
}

#[test]
fn severe_hints_come_first() {
    let mut f = calm();
    f.now.humidity = 25;
    f.hours[5].feels = 42.0;
    assert_eq!(kinds(&f), ["heat", "dry"]);
}
