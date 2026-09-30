use super::*;

/// Wraps a payload the way the page ships it: inside a JSON string literal of a flight chunk, in two pieces.
fn page(payload: &str) -> String {
    let (a, b) = payload.split_at(payload.len() / 2);
    let chunk = |s: &str| format!("<script>self.__next_f.push([1,{}])</script>", serde_json::to_string(s).unwrap());
    format!("<html>{}{}</html>", chunk(a), chunk(b))
}

const MODELS: &str = r#"{"props":{"models":[
  {"slug":"aurora-4","name":"Aurora 4","modelCreatorName":"Lumen Labs","intelligenceIndex":57.25,
   "price1mInputTokens":2,"price1mOutputTokens":10,"medianOutputTokensPerSecond":142.7},
  {"slug":"nimbus","name":"Nimbus Ultra","intelligenceIndex":null},
  {"slug":"orca","name":"Orca Think","modelCreatorName":null,"intelligenceIndex":61,"price1mInputTokens":null},
  {"slug":"velho","name":"Velho","deprecated":true,"intelligenceIndex":70},
  {"slug":"brisa","name":"Brisa Mini","intelligenceIndex":40.5,"price1mInputTokens":0,"price1mOutputTokens":0,
   "medianOutputTokensPerSecond":0},
  {"name":"Sem slug","intelligenceIndex":50},
  {"slug":"tipo-errado","name":"Tipo errado","intelligenceIndex":"alto"}
]}}"#;

#[test]
fn reads_the_index_price_and_speed_from_the_embedded_list() {
    let models = parse_page(&page(MODELS)).unwrap();
    let ids: Vec<_> = models.iter().map(|m| m.id.as_str()).collect();
    assert_eq!(ids, ["aurora-4", "orca", "brisa"], "deprecated and unscored models are dropped");
    let a = &models[0];
    assert_eq!((a.name.as_str(), a.creator.as_str(), a.score), ("Aurora 4", "Lumen Labs", 57.25));
    assert_eq!((a.price, a.speed), (Some(4.0), Some(142.7)), "blended 3:1 input/output");
}

#[test]
fn missing_or_zero_measures_leave_the_field_empty() {
    let models = parse_page(&page(MODELS)).unwrap();
    assert_eq!((models[1].creator.as_str(), models[1].price, models[1].speed), ("", None, None));
    assert_eq!((models[2].price, models[2].speed), (None, None), "zero means not measured");
}

#[test]
fn a_page_without_the_model_list_is_an_error_not_an_empty_ranking() {
    let err = parse_page("<html>outra coisa</html>").unwrap_err();
    assert_eq!(err, FetchError::Other("a página mudou de formato".into()));
    let other = page(r#"{"models":[{"slug":"x","name":"sem índice"}]}"#);
    assert!(parse_page(&other).is_err());
}

#[test]
fn a_missing_name_falls_back_to_the_id_and_long_text_is_cut() {
    let long = "x".repeat(500);
    let body = format!(r#"{{"models":[{{"slug":"m-1","intelligenceIndex":1,"modelCreatorName":"{long}"}}]}}"#);
    let models = parse_page(&page(&body)).unwrap();
    assert_eq!(models[0].name, "m-1");
    assert_eq!(models[0].creator.chars().count(), MAX_TEXT);
}

#[test]
fn errors_read_as_pt_br_for_the_ui() {
    assert!(FetchError::RateLimited.message().contains("limite"));
    assert!(FetchError::Network("dns".into()).message().contains("sem resposta"));
}
