use super::*;

#[test]
fn filters_become_drive_queries_and_a_search_cannot_break_out_of_its_quotes() {
    let (q, order) = query("shared", "", "").unwrap();
    assert!(q.ends_with("and sharedWithMe = true"), "{q}");
    assert_eq!(order, "sharedWithMeTime desc");
    let (q, _) = query("recent", "", " d'água \\ ").unwrap();
    assert!(q.ends_with(r"and name contains 'd\'água \\'"), "{q}");
    assert!(query("trashed", "", "").is_err());
}

#[test]
fn owned_files_and_a_kind_narrow_the_query_and_an_unknown_kind_is_refused() {
    let (q, _) = query("mine", "sheet", "").unwrap();
    assert!(q.ends_with("and 'me' in owners and mimeType = 'application/vnd.google-apps.spreadsheet'"), "{q}");
    assert!(query("recent", "folder", "").is_err());
}

#[test]
fn the_quota_reads_drive_int64_strings_and_an_unlimited_plan_has_no_limit() {
    let about: About =
        serde_json::from_str(r#"{"storageQuota": {"limit": "16106127360", "usage": "4509715660"}}"#).unwrap();
    assert_eq!(into_quota(about.storage_quota), DriveQuota { used: 4_509_715_660, limit: 16_106_127_360 });
    let about: About = serde_json::from_str(r#"{"storageQuota": {"usage": "10"}}"#).unwrap();
    assert_eq!(into_quota(about.storage_quota), DriveQuota { used: 10, limit: 0 });
}

#[test]
fn a_file_keeps_its_kind_editor_and_only_a_google_link() {
    let raw: RawFile = serde_json::from_str(
        r#"{"id": "1", "name": "Roadmap Q4", "mimeType": "application/vnd.google-apps.document",
            "webViewLink": "https://docs.google.com/document/d/1/edit", "starred": true,
            "modifiedTime": "2026-10-20T14:20:00Z", "lastModifyingUser": {"displayName": "Rafael", "me": false},
            "parents": ["0AbcFolder"], "size": "2048"}"#,
    )
    .unwrap();
    let file = raw.into_file();
    assert_eq!((file.kind.as_str(), file.editor.as_str(), file.starred), ("doc", "Rafael", true));
    assert_eq!(file.link, "https://docs.google.com/document/d/1/edit");
    assert_eq!((file.folder.as_str(), file.size), ("https://drive.google.com/drive/folders/0AbcFolder", 2048));
    let mine: RawFile = serde_json::from_str(
        r#"{"id": "2", "mimeType": "image/png", "webViewLink": "javascript:alert(1)",
            "lastModifyingUser": {"displayName": "Eu", "me": true}, "parents": ["../x"]}"#,
    )
    .unwrap();
    let file = mine.into_file();
    assert_eq!((file.kind.as_str(), file.editor.as_str(), file.link.as_str()), ("other", "", ""));
    assert_eq!((file.folder.as_str(), file.size), ("", 0));
}
