//! Expiry date of an X.509 certificate, read straight from its DER: only `notAfter` matters here, so a
//! full parser (and its dependency) would be overkill.
use chrono::NaiveDate;

/// One DER element: tag, content and what follows it.
fn tlv(d: &[u8]) -> Option<(u8, &[u8], &[u8])> {
    let (&tag, rest) = d.split_first()?;
    let (&first, rest) = rest.split_first()?;
    let (len, rest) = if first < 0x80 {
        (first as usize, rest)
    } else {
        let n = (first & 0x7f) as usize;
        if n == 0 || n > 4 || rest.len() < n {
            return None;
        }
        (rest[..n].iter().fold(0usize, |acc, b| (acc << 8) | *b as usize), &rest[n..])
    };
    (rest.len() >= len).then(|| (tag, &rest[..len], &rest[len..]))
}

/// Unix seconds of `notAfter` in a DER certificate.
pub fn not_after(der: &[u8]) -> Option<i64> {
    let (_, cert, _) = tlv(der)?;
    let (_, tbs, _) = tlv(cert)?;
    let (tag, _, after_version) = tlv(tbs)?;
    // Version is the optional [0] element; without it the first element is already the serial number.
    let mut rest = if tag == 0xA0 { after_version } else { tbs };
    for _ in 0..3 {
        rest = tlv(rest)?.2; // serial, signature algorithm, issuer
    }
    let (_, validity, _) = tlv(rest)?;
    let (_, _, not_after) = tlv(validity)?;
    let (tag, text, _) = tlv(not_after)?;
    parse_time(tag, std::str::from_utf8(text).ok()?)
}

fn parse_time(tag: u8, text: &str) -> Option<i64> {
    let (year, rest) = match tag {
        0x17 => {
            let yy: i32 = text.get(..2)?.parse().ok()?;
            (if yy >= 50 { 1900 + yy } else { 2000 + yy }, text.get(2..)?)
        }
        0x18 => (text.get(..4)?.parse().ok()?, text.get(4..)?),
        _ => return None,
    };
    let field = |i: usize| rest.get(i..i + 2)?.parse::<u32>().ok();
    let date = NaiveDate::from_ymd_opt(year, field(0)?, field(2)?)?;
    Some(date.and_hms_opt(field(4)?, field(6)?, field(8).unwrap_or(0))?.and_utc().timestamp())
}

/// Whole days from `now` (unix seconds) until `expires`; negative once it has expired.
pub fn days_left(expires: i64, now: i64) -> i64 {
    (expires - now).div_euclid(86_400)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn el(tag: u8, content: &[u8]) -> Vec<u8> {
        let mut out = vec![tag];
        if content.len() < 0x80 {
            out.push(content.len() as u8);
        } else {
            out.extend([0x82, (content.len() >> 8) as u8, content.len() as u8]);
        }
        out.extend(content);
        out
    }

    fn cert(version: bool, not_after_tag: u8, not_after: &str) -> Vec<u8> {
        let mut tbs = Vec::new();
        if version {
            tbs.extend(el(0xA0, &el(0x02, &[2])));
        }
        tbs.extend(el(0x02, &[1, 2, 3])); // serial
        tbs.extend(el(0x30, &el(0x06, &[42]))); // signature algorithm
        tbs.extend(el(0x30, &el(0x31, &[]))); // issuer
        let mut validity = el(0x17, b"240101000000Z");
        validity.extend(el(not_after_tag, not_after.as_bytes()));
        tbs.extend(el(0x30, &validity));
        tbs.extend(el(0x30, &[0; 200])); // subject and key, long enough for a 2-byte length
        el(0x30, &el(0x30, &tbs))
    }

    #[test]
    fn reads_utc_and_generalized_time() {
        assert_eq!(not_after(&cert(true, 0x17, "261231235959Z")), Some(1_798_761_599));
        assert_eq!(not_after(&cert(true, 0x18, "20261231235959Z")), Some(1_798_761_599));
    }

    #[test]
    fn a_certificate_without_the_version_element_still_parses() {
        assert_eq!(not_after(&cert(false, 0x17, "261231235959Z")), Some(1_798_761_599));
    }

    #[test]
    fn two_digit_years_pivot_at_fifty() {
        assert_eq!(parse_time(0x17, "500101000000Z"), Some(-631_152_000));
        assert_eq!(parse_time(0x17, "490101000000Z"), Some(2_493_072_000));
    }

    #[test]
    fn garbage_is_none_not_a_panic() {
        assert_eq!(not_after(&[]), None);
        assert_eq!(not_after(&[0x30, 0x84, 0xff, 0xff]), None);
        assert_eq!(not_after(&cert(true, 0x0c, "261231235959Z")), None);
    }

    #[test]
    fn days_left_floors_and_goes_negative_after_expiry() {
        assert_eq!(days_left(10 * 86_400 + 5, 0), 10);
        assert_eq!(days_left(0, 86_400 + 1), -2);
    }
}
