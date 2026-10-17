use super::*;

#[test]
fn a_recent_list_without_a_key_says_so_instead_of_calling_out() {
    let view = recent(&SteamConfig::default()).unwrap();
    assert!(!view.has_key);
    assert!(view.items.is_empty());
}

#[test]
fn a_fetch_failure_becomes_the_message_the_user_reads() {
    let offline = failed(FetchError::Network("offline".into())).to_string();
    assert!(offline.contains("sem conexão com a Steam"), "{offline}");
    let http = failed(FetchError::Other("HTTP 500".into())).to_string();
    assert!(http.contains("HTTP 500"), "{http}");
}
