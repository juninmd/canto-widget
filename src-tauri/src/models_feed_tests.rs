use super::*;

const SAMPLE: &str = r#"{"status":200,"data":[
  {"id":"m-1","name":"Aurora 4","slug":"aurora-4","model_creator":{"id":"c1","name":"Lumen Labs","slug":"lumen"},
   "evaluations":{"artificial_analysis_intelligence_index":73.2,"mmlu_pro":0.8},
   "pricing":{"price_1m_blended_3_to_1":3.44,"price_1m_input_tokens":1.5,"price_1m_output_tokens":9.2},
   "median_output_tokens_per_second":142.7,"median_time_to_first_token_seconds":0.4},
  {"id":"m-2","name":"Nimbus Ultra","model_creator":{"name":"Stratos"},
   "evaluations":{"artificial_analysis_intelligence_index":null},"pricing":{},"median_output_tokens_per_second":null},
  {"id":"m-3","name":"Orca Think","model_creator":null,"evaluations":{"artificial_analysis_intelligence_index":61},
   "pricing":null},
  {"id":"m-4","name":"Sem avaliação"},
  {"id":"m-5","name":"Brisa Mini","evaluations":{"artificial_analysis_intelligence_index":40.5},
   "pricing":{"price_1m_blended_3_to_1":0},"median_output_tokens_per_second":0},
  {"name":"Sem id","evaluations":{"artificial_analysis_intelligence_index":50}},
  {"id":"m-7","name":"Tipo errado","evaluations":{"artificial_analysis_intelligence_index":"alto"}}
]}"#;

#[test]
fn keeps_only_models_with_an_index_and_reads_every_field() {
    let models = parse(SAMPLE.as_bytes()).unwrap();
    let ids: Vec<&str> = models.iter().map(|m| m.id.as_str()).collect();
    assert_eq!(ids, ["m-1", "m-3", "m-5"]);
    assert_eq!(
        models[0],
        Model {
            id: "m-1".into(),
            name: "Aurora 4".into(),
            creator: "Lumen Labs".into(),
            score: 73.2,
            price: Some(3.44),
            speed: Some(142.7),
        }
    );
}

#[test]
fn null_or_missing_nested_objects_leave_the_field_empty() {
    let models = parse(SAMPLE.as_bytes()).unwrap();
    let orca = &models[1];
    assert_eq!((orca.creator.as_str(), orca.price, orca.speed), ("", None, None));
    assert_eq!(orca.score, 61.0, "an integer index is still a number");
}

#[test]
fn zero_price_and_speed_mean_not_measured() {
    let brisa = &parse(SAMPLE.as_bytes()).unwrap()[2];
    assert_eq!((brisa.price, brisa.speed), (None, None));
}

#[test]
fn a_missing_data_array_is_an_empty_list_and_garbage_is_an_error() {
    assert_eq!(parse(br#"{"status":200}"#).unwrap(), Vec::<Model>::new());
    assert!(matches!(parse(b"<html>captcha</html>"), Err(FetchError::Other(_))));
}

#[test]
fn a_missing_name_falls_back_to_the_id_and_long_text_is_cut() {
    let long = "x".repeat(500);
    let json = format!(
        r#"{{"data":[{{"id":"m-9","model_creator":{{"name":"{long}"}},"evaluations":{{"artificial_analysis_intelligence_index":1}}}}]}}"#
    );
    let m = &parse(json.as_bytes()).unwrap()[0];
    assert_eq!(m.name, "m-9");
    assert_eq!(m.creator.chars().count(), MAX_TEXT);
}

#[test]
fn errors_read_as_pt_br_for_the_ui() {
    assert_eq!(FetchError::Unauthorized.message(), "chave inválida");
    assert_eq!(FetchError::RateLimited.message(), "limite diário da API atingido");
}

#[test]
fn the_key_is_checked_for_length_and_charset() {
    assert_eq!(valid_key("  aa_0123456789abcdefXYZ  ").unwrap(), "aa_0123456789abcdefXYZ");
    assert!(valid_key("curta").is_err());
    assert!(valid_key(&"a".repeat(129)).is_err());
    assert!(valid_key("aa_0123456789abcdef\r\nX-Evil: 1").is_err(), "no header injection");
    assert!(valid_key("aa_0123456789 abcdef").is_err());
}
