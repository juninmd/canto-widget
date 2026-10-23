//! Parsing of the store's search page: one game per row, with its price, review summary and capsule.
//! Pure, so `steam_store_tests.rs` covers every shape with a captured fragment.
use crate::steam::SteamRow;

/// The rows of a store search page: `data-ds-appid` marks where each one starts.
pub fn parse_search(html: &str) -> Vec<SteamRow> {
    let starts: Vec<usize> = html.match_indices("data-ds-appid=\"").map(|(at, _)| at).collect();
    starts
        .iter()
        .enumerate()
        .filter_map(|(i, &start)| row_of(&html[start..starts.get(i + 1).copied().unwrap_or(html.len())]))
        .collect()
}

fn row_of(chunk: &str) -> Option<SteamRow> {
    let appid: u32 = between(chunk, "data-ds-appid=\"", "\"")?.parse().ok()?;
    let name = unescape(between(chunk, "class=\"title\">", "<")?).trim().to_string();
    if name.is_empty() {
        return None;
    }
    // The block carries the percentage in `data-discount`, and a free app has no such attribute.
    let discount: u32 = between(chunk, "data-discount=\"", "\"").and_then(|v| v.trim().parse().ok()).unwrap_or(0);
    let price = text_of(chunk, "discount_final_price");
    let original = text_of(chunk, "discount_original_price");
    let (review, review_key, review_count) = review_of(chunk);
    Some(SteamRow {
        appid,
        name,
        saved_cents: savings(&original, &price),
        price,
        original,
        discount,
        review,
        review_key,
        review_count,
        art: unescape(between(chunk, "<img src=\"", "\"").unwrap_or_default()).trim().to_string(),
    })
}

/// The text of the element whose tag carries `marker`, whatever else is in its class: a free app
/// prints `class="discount_final_price free"`, where a paid one prints `class="discount_final_price"`.
fn text_of(chunk: &str, marker: &str) -> String {
    let Some(rest) = chunk.find(marker).map(|at| &chunk[at + marker.len()..]) else {
        return String::new();
    };
    let Some(text) = rest.find('>').map(|at| &rest[at + 1..]) else {
        return String::new();
    };
    unescape(&text[..text.find('<').unwrap_or(text.len())]).trim().to_string()
}

/// Reviews ride in a tooltip: the wording before the first `<br>` is Steam's own bucket, then
/// "NN% das N análises" carries the percentage and how many reviews it counts.
fn review_of(chunk: &str) -> (Option<u8>, String, u32) {
    let none = (None, String::new(), 0);
    let Some(rest) = chunk.split_once("search_review_summary").map(|(_, r)| r) else {
        return none;
    };
    let Some(tooltip) = between(rest, "data-tooltip-html=\"", "\"") else {
        return none;
    };
    let tooltip = unescape(tooltip);
    let review = tooltip
        .find('%')
        .and_then(|at| tooltip[..at].trim_end().rsplit(|c: char| !c.is_ascii_digit()).next()?.parse::<u8>().ok());
    let wording = tooltip.split("<br>").next().unwrap_or_default();
    (review, crate::steam_review::bucket(wording), count_after_percent(&tooltip))
}

/// How many reviews the summary counts: the number right after the percentage ("99% das 1,350
/// análises" -> 1350). The wording around it is localized, so only digits and their separators are
/// read, and a separator only counts between two digits.
fn count_after_percent(tooltip: &str) -> u32 {
    let Some(rest) = tooltip.split_once('%').map(|(_, r)| r) else {
        return 0;
    };
    let chars: Vec<char> = rest.chars().collect();
    let Some(start) = chars.iter().position(|c| c.is_ascii_digit()) else {
        return 0;
    };
    let mut digits = String::new();
    let mut i = start;
    while i < chars.len() {
        let c = chars[i];
        if c.is_ascii_digit() {
            digits.push(c);
        } else if !matches!(c, ',' | '.' | '\'' | '\u{a0}' | ' ')
            || !chars.get(i + 1).is_some_and(|n| n.is_ascii_digit())
        {
            break;
        }
        i += 1;
    }
    if digits.is_empty() || digits.len() > 9 {
        return 0;
    }
    digits.parse().unwrap_or(0)
}

/// What the discount takes off, straight from the two prices Steam printed.
fn savings(original: &str, price: &str) -> u32 {
    match (cents(original), cents(price)) {
        (Some(before), Some(after)) if before > after => before - after,
        _ => 0,
    }
}

/// Cents out of a printed price: "R$ 1.234,56" -> 123456; "Grátis" -> `None`. A price printed
/// without decimals ("¥ 1,980", "₩ 22,000") is scaled, so every store's savings arrive in hundredths.
fn cents(text: &str) -> Option<u32> {
    let digits: String = text.chars().filter(char::is_ascii_digit).collect();
    if digits.is_empty() || digits.len() > 9 {
        return None;
    }
    let whole: u32 = digits.parse().ok()?;
    if has_decimals(text) {
        Some(whole)
    } else {
        whole.checked_mul(100)
    }
}

/// Whether the last number group is two digits after a separator ("1.234,56"), not a thousands group.
fn has_decimals(text: &str) -> bool {
    let number = text.trim_end_matches(|c: char| !c.is_ascii_digit());
    let tail: String = number.chars().rev().take_while(char::is_ascii_digit).collect();
    tail.len() == 2 && number[..number.len() - 2].ends_with(['.', ','])
}

/// A single pass over `&...;`, so `&amp;lt;` decodes to `&lt;` instead of `<`.
pub fn unescape(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut rest = text;
    while let Some(at) = rest.find('&') {
        out.push_str(&rest[..at]);
        let tail = &rest[at..];
        let Some(end) = tail.find(';').filter(|end| *end <= 12) else {
            out.push('&');
            rest = &tail[1..];
            continue;
        };
        match &tail[1..end] {
            "amp" => out.push('&'),
            "lt" => out.push('<'),
            "gt" => out.push('>'),
            "quot" => out.push('"'),
            "apos" | "#39" => out.push('\''),
            "nbsp" => out.push(' '),
            other => match numeric(other) {
                Some(c) => out.push(c),
                // An entity we don't know is left alone rather than guessed at.
                None => out.push_str(&tail[..=end]),
            },
        }
        rest = &tail[end + 1..];
    }
    out.push_str(rest);
    out
}

fn numeric(entity: &str) -> Option<char> {
    let digits = entity.strip_prefix('#')?;
    let code = match digits.strip_prefix(['x', 'X']) {
        Some(hex) => u32::from_str_radix(hex, 16).ok()?,
        None => digits.parse().ok()?,
    };
    char::from_u32(code)
}

fn between<'a>(text: &'a str, open: &str, close: &str) -> Option<&'a str> {
    let start = text.find(open)? + open.len();
    let rest = &text[start..];
    Some(&rest[..rest.find(close)?])
}

#[cfg(test)]
#[path = "steam_store_tests.rs"]
mod tests;
