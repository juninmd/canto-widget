use super::*;
use serde_json::json;

#[test]
fn reads_the_camel_case_sheet() {
    let d = details(&json!({
        "price1mInputTokens": 2.5, "price1mOutputTokens": 12, "medianTimeToFirstTokenSeconds": 0.83,
        "contextWindowTokens": 131072, "releaseDate": "2025-08-05T00:00:00.000Z", "isOpenWeights": true,
        "isReasoning": false, "codingIndex": 51.4, "mathIndex": 0, "inputModalities": ["Text", "image", "pdf"]
    }));
    assert_eq!((d.input_price, d.output_price, d.ttft), (Some(2.5), Some(12.0), Some(0.83)));
    assert_eq!((d.context, d.released.as_deref()), (Some(131072), Some("2025-08-05")));
    assert_eq!((d.open_weights, d.reasoning), (Some(true), Some(false)));
    assert_eq!((d.coding, d.math), (Some(51.4), Some(0.0)), "an index of 0 is a real score");
    assert_eq!(d.inputs, ["text", "image"], "unknown modalities are left out, known ones keep a fixed order");
}

#[test]
fn falls_back_to_snake_case_and_per_modality_flags() {
    let d = details(&json!({
        "context_window_tokens": 200000, "release_date": "2026-01-02", "reasoning_model": true,
        "inputModalityText": true, "inputModalityVideo": true, "inputModalityAudio": false
    }));
    assert_eq!((d.context, d.released.as_deref(), d.reasoning), (Some(200000), Some("2026-01-02"), Some(true)));
    assert_eq!(d.inputs, ["text", "video"]);
}

#[test]
fn missing_zero_or_malformed_values_stay_empty() {
    let d = details(&json!({
        "price1mInputTokens": 0, "medianTimeToFirstTokenSeconds": null, "contextWindowTokens": "1M",
        "releaseDate": "agosto", "isOpenWeights": "sim", "codingIndex": -3
    }));
    assert_eq!(d, Details::default());
}
