//! What the forecast means for someone about to leave home: an umbrella, water, a jacket, staying in. Pure, so
//! every threshold is tested; `weather/alert.rs` decides when each hint rings.
use crate::lang::tr;
use crate::weather::{Condition, Forecast, Hour};

/// Every kind the Clima tab can switch on, in the order the switches are shown.
pub const KINDS: [&str; 11] = ["storm", "rain", "heat", "cold", "wind", "uv", "air", "fog", "dry", "snow", "swing"];

/// How far ahead each kind looks, in hours.
const SOON: usize = 6;
const TODAY: usize = 12;
const RAIN_CHANCE: u8 = 60;
/// mm in one hour from which the rain is heavy (a downpour, not a drizzle).
const HEAVY_MM: f64 = 10.0;
/// mm over the next hour of the 15-minute nowcast that is worth an umbrella.
const NOWCAST_MM: f64 = 0.3;
const HOT: f64 = 32.0;
const EXTREME_HOT: f64 = 40.0;
const COLD: f64 = 10.0;
const FREEZING: f64 = 0.0;
const WINDY: f64 = 50.0;
const GALE: f64 = 80.0;
const UV_HIGH: f64 = 8.0;
const UV_EXTREME: f64 = 11.0;
/// US AQI: "unhealthy for sensitive groups" and "unhealthy".
const AIR_BAD: u16 = 101;
const AIR_VERY_BAD: u16 = 151;
const FOG_KM: f64 = 1.0;
/// Relative humidity in %: the attention and alert levels health services use for dry air.
const DRY: u8 = 30;
const VERY_DRY: u8 = 20;
/// A change of this many degrees in the day's high is a front, not noise.
const SWING: f64 = 8.0;
/// UV after this local hour has passed its peak; the hint would come too late.
const UV_LAST_HOUR: u32 = 14;

#[derive(Debug, Clone, PartialEq)]
pub struct Hint {
    pub kind: &'static str,
    /// Loud enough to ring at night and to sit in the danger tone.
    pub severe: bool,
    pub title: String,
    pub body: String,
    /// The one number or hour that sums the hint up ("41°", "62 km/h", "UV 9"), shown big on the pop-up.
    pub value: String,
}

fn hint(kind: &'static str, severe: bool, title: &str, body: String) -> Hint {
    Hint { kind, severe, title: title.to_string(), body, value: String::new() }
}

/// `HH:MM` of an hour the API sent as `YYYY-MM-DDTHH:MM`.
fn clock(hour: &Hour) -> String {
    hour.at.get(11..16).unwrap_or_default().to_string()
}

/// The local hour (0-23) of the first hour of the forecast, which is the city's "now".
pub fn local_hour(forecast: &Forecast) -> u32 {
    forecast.hours.first().and_then(|h| h.at.get(11..13)).and_then(|h| h.parse().ok()).unwrap_or(12)
}

/// The city's local date, so "once a day" follows the city and not the computer.
pub fn local_date(forecast: &Forecast) -> String {
    forecast.hours.first().and_then(|h| h.at.get(..10)).unwrap_or_default().to_string()
}

fn deg(value: f64) -> String {
    format!("{}", value.round() as i64)
}

fn fill(text: &str, pairs: &[(&str, String)]) -> String {
    pairs.iter().fold(text.to_string(), |acc, (k, v)| acc.replace(k, v))
}

fn rain(f: &Forecast, soon: &[Hour]) -> Option<Hint> {
    let nowcast: f64 = f.next_rain.iter().take(4).sum();
    let wet = soon.iter().find(|h| h.rain >= RAIN_CHANCE || matches!(h.condition, Condition::Rain));
    let heavy = soon.iter().any(|h| h.precip >= HEAVY_MM);
    let title = tr("Leve guarda-chuva", "Take an umbrella");
    if nowcast >= NOWCAST_MM {
        return Some(hint("rain", heavy, title, tr("Chuva na próxima hora.", "Rain within the hour.").to_string()));
    }
    let h = wet?;
    let body = fill(
        tr("Chuva por volta das {h} ({p}%).", "Rain around {h} ({p}%)."),
        &[("{h}", clock(h)), ("{p}", h.rain.to_string())],
    );
    Some(hint("rain", heavy, title, body))
}

fn storm(f: &Forecast, soon: &[Hour]) -> Option<Hint> {
    let at = if matches!(f.now.condition, Condition::Storm) {
        tr("agora", "now").to_string()
    } else {
        clock(soon.iter().find(|h| matches!(h.condition, Condition::Storm))?)
    };
    let body = fill(
        tr(
            "Trovoadas ({h}). Evite sair e fique longe de áreas abertas e árvores.",
            "Thunderstorms ({h}). Avoid going out and stay away from open areas and trees.",
        ),
        &[("{h}", at)],
    );
    Some(hint("storm", true, tr("Tempestade a caminho", "Storm on the way"), body))
}

fn snow(today: &[Hour]) -> Option<Hint> {
    let h = today.iter().find(|h| matches!(h.condition, Condition::Snow))?;
    let body = fill(
        tr(
            "Neve por volta das {h}. Agasalhe-se e cuidado com o chão escorregadio.",
            "Snow around {h}. Dress warmly and watch for slippery ground.",
        ),
        &[("{h}", clock(h))],
    );
    Some(hint("snow", false, tr("Neve a caminho", "Snow on the way"), body))
}

fn heat(f: &Forecast, today: &[Hour]) -> Option<Hint> {
    let top = today.iter().map(|h| h.feels).fold(f.now.feels, f64::max);
    if top < HOT {
        return None;
    }
    let t = [("{t}", deg(top))];
    Some(if top >= EXTREME_HOT {
        let body = tr(
            "Sensação de até {t}°. Evite sair entre 11h e 16h e beba água.",
            "Feels like up to {t}°. Avoid going out from 11am to 4pm and drink water.",
        );
        hint("heat", true, tr("Calor extremo", "Extreme heat"), fill(body, &t))
    } else {
        let body = tr(
            "Sensação de até {t}°. Hidrate-se e prefira a sombra.",
            "Feels like up to {t}°. Stay hydrated and keep to the shade.",
        );
        hint("heat", false, tr("Beba água", "Drink water"), fill(body, &t))
    })
}

fn cold(f: &Forecast, today: &[Hour]) -> Option<Hint> {
    let low = today.iter().min_by(|a, b| a.feels.total_cmp(&b.feels))?;
    let (feels, at) =
        if f.now.feels <= low.feels { (f.now.feels, tr("agora", "now").to_string()) } else { (low.feels, clock(low)) };
    if feels > COLD {
        return None;
    }
    let pairs = [("{t}", deg(feels)), ("{h}", at)];
    Some(if feels <= FREEZING {
        let body = tr(
            "Sensação de {t}° ({h}). Proteja-se e evite ficar muito tempo fora.",
            "Feels like {t}° ({h}). Bundle up and limit time outdoors.",
        );
        hint("cold", true, tr("Frio intenso", "Severe cold"), fill(body, &pairs))
    } else {
        let body = tr("Sensação de {t}° ({h}).", "Feels like {t}° ({h}).");
        hint("cold", false, tr("Leve um agasalho", "Bring a jacket"), fill(body, &pairs))
    })
}

fn wind(f: &Forecast, soon: &[Hour]) -> Option<Hint> {
    let top = soon.iter().map(|h| h.wind).fold(f.now.gusts.unwrap_or(f.now.wind).max(f.now.wind), f64::max);
    if top < WINDY {
        return None;
    }
    let n = [("{n}", deg(top))];
    Some(if top >= GALE {
        let body = tr(
            "Rajadas de até {n} km/h. Evite sair e fique longe de árvores.",
            "Gusts up to {n} km/h. Avoid going out and stay away from trees.",
        );
        hint("wind", true, tr("Ventania", "Gale"), fill(body, &n))
    } else {
        let body = tr(
            "Rajadas de até {n} km/h. Cuidado com objetos soltos.",
            "Gusts up to {n} km/h. Watch out for loose objects.",
        );
        hint("wind", false, tr("Vento forte", "Strong wind"), fill(body, &n))
    })
}

fn uv(f: &Forecast) -> Option<Hint> {
    let uv = f.days.first()?.uv;
    if uv < UV_HIGH || local_hour(f) > UV_LAST_HOUR {
        return None;
    }
    let severe = uv >= UV_EXTREME;
    let title = if severe { tr("UV extremo", "Extreme UV") } else { tr("UV muito alto", "Very high UV") };
    let body = tr(
        "Índice {n} hoje. Use protetor solar e evite o sol das 10h às 16h.",
        "UV index {n} today. Wear sunscreen and avoid the sun from 10am to 4pm.",
    );
    Some(hint("uv", severe, title, fill(body, &[("{n}", deg(uv))])))
}

fn air(f: &Forecast) -> Option<Hint> {
    let aqi = f.air.filter(|a| *a >= AIR_BAD)?;
    let n = [("{n}", aqi.to_string())];
    Some(if aqi >= AIR_VERY_BAD {
        let body =
            tr("AQI {n}. Evite sair; se precisar, use máscara.", "AQI {n}. Avoid going out; wear a mask if you must.");
        hint("air", true, tr("Ar muito poluído", "Very poor air"), fill(body, &n))
    } else {
        let body = tr("AQI {n}. Evite exercícios ao ar livre.", "AQI {n}. Avoid outdoor exercise.");
        hint("air", false, tr("Ar poluído", "Poor air quality"), fill(body, &n))
    })
}

fn fog(f: &Forecast) -> Option<Hint> {
    let km = f.now.visibility.filter(|v| *v < FOG_KM)?;
    let body = tr(
        "Visibilidade de {n} km. Dirija com cuidado e use farol baixo.",
        "Visibility {n} km. Drive carefully with low beams on.",
    );
    Some(hint("fog", false, tr("Neblina", "Fog"), fill(body, &[("{n}", format!("{km:.1}"))])))
}

fn dry(f: &Forecast) -> Option<Hint> {
    let rh = f.now.humidity;
    if rh == 0 || rh > DRY {
        return None;
    }
    let body = tr(
        "Umidade de {n}%. Beba água e evite exercícios nas horas quentes.",
        "Humidity {n}%. Drink water and avoid exercise in the hot hours.",
    );
    Some(hint("dry", rh <= VERY_DRY, tr("Ar seco", "Dry air"), fill(body, &[("{n}", rh.to_string())])))
}

fn swing(f: &Forecast) -> Option<Hint> {
    let (today, tomorrow) = (f.days.first()?, f.days.get(1)?);
    let delta = tomorrow.max - today.max;
    if delta.abs() < SWING {
        return None;
    }
    let pairs = [("{a}", deg(today.max)), ("{b}", deg(tomorrow.max))];
    Some(if delta < 0.0 {
        let body = tr(
            "A máxima cai de {a}° para {b}°. Separe um agasalho.",
            "The high drops from {a}° to {b}°. Have a jacket ready.",
        );
        hint("swing", false, tr("Frente fria amanhã", "Cold front tomorrow"), fill(body, &pairs))
    } else {
        let body = tr("A máxima sobe de {a}° para {b}°.", "The high climbs from {a}° to {b}°.");
        hint("swing", false, tr("Calor amanhã", "Hot day tomorrow"), fill(body, &pairs))
    })
}

fn value(kind: &str, f: &Forecast) -> String {
    let soon = &f.hours[..f.hours.len().min(SOON)];
    let today = &f.hours[..f.hours.len().min(TODAY)];
    let first = |c: Condition| soon.iter().chain(today).find(|h| h.condition == c).map(clock).unwrap_or_default();
    match kind {
        "rain" => format!("{}%", soon.iter().map(|h| h.rain).max().unwrap_or(0)),
        "storm" => {
            if matches!(f.now.condition, Condition::Storm) {
                tr("agora", "now").to_string()
            } else {
                first(Condition::Storm)
            }
        }
        "heat" => format!("{}°", deg(today.iter().map(|h| h.feels).fold(f.now.feels, f64::max))),
        "cold" => format!("{}°", deg(today.iter().map(|h| h.feels).fold(f.now.feels, f64::min))),
        "wind" => format!(
            "{} km/h",
            deg(soon.iter().map(|h| h.wind).fold(f.now.gusts.unwrap_or(f.now.wind).max(f.now.wind), f64::max))
        ),
        "uv" => format!("UV {}", deg(f.days.first().map_or(0.0, |d| d.uv))),
        "air" => format!("AQI {}", f.air.unwrap_or(0)),
        "fog" => format!("{:.1} km", f.now.visibility.unwrap_or(0.0)),
        "dry" => format!("{}%", f.now.humidity),
        "snow" => first(Condition::Snow),
        _ => match (f.days.first(), f.days.get(1)) {
            (Some(a), Some(b)) => format!("{}° → {}°", deg(a.max), deg(b.max)),
            _ => String::new(),
        },
    }
}

/// Every hint the forecast gives right now, worst first. A storm already says "stay in", so rain stays quiet then.
pub fn hints(f: &Forecast) -> Vec<Hint> {
    let soon = &f.hours[..f.hours.len().min(SOON)];
    let today = &f.hours[..f.hours.len().min(TODAY)];
    let stormy = storm(f, soon);
    let wet = if stormy.is_some() { None } else { rain(f, soon) };
    let mut out: Vec<Hint> = [
        stormy,
        wet,
        heat(f, today),
        cold(f, today),
        wind(f, soon),
        uv(f),
        air(f),
        fog(f),
        dry(f),
        snow(today),
        swing(f),
    ]
    .into_iter()
    .flatten()
    .collect();
    for h in &mut out {
        h.value = value(h.kind, f);
    }
    out.sort_by_key(|h| !h.severe);
    out
}

#[cfg(test)]
#[path = "hints_tests.rs"]
mod tests;
