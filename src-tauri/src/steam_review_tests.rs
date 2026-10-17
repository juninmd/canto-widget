use super::*;

#[test]
fn the_stores_own_wording_maps_to_the_nine_buckets() {
    // The wordings Steam actually prints in Portuguese, captured from the store's search page.
    for (wording, key) in [
        ("Extremamente positivas", "overwhelmingly_positive"),
        ("Muito positivas", "very_positive"),
        ("Positivas", "positive"),
        ("Praticamente positivas", "mostly_positive"),
        ("Neutras", "mixed"),
        ("Praticamente negativas", "mostly_negative"),
        ("Negativas", "negative"),
        ("Muito negativas", "very_negative"),
        ("Extremamente negativas", "overwhelmingly_negative"),
        ("  Muito positivas  ", "very_positive"),
        ("Very Positive", ""),
        ("", ""),
    ] {
        assert_eq!(bucket(wording), key, "{wording}");
        if !key.is_empty() {
            assert!(is_bucket(key), "{key}");
        }
    }
}

#[test]
fn the_summary_percentage_is_clamped_and_needs_reviews() {
    let summary =
        Summary { total_positive: 462_479, total_reviews: 468_548, review_score_desc: "Muito positivas".into() };
    assert_eq!(summary.percent(), Some(99));
    assert_eq!(summary.bucket(), "very_positive");
    assert_eq!(Summary::default().percent(), None, "no reviews yet");
    let odd = Summary { total_positive: 5, total_reviews: 2, ..Default::default() };
    assert_eq!(odd.percent(), Some(100), "never above 100");
}
