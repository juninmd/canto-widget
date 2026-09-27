use super::*;
use crate::model::Note;
use crate::trash::Removed;

const PNG: &[u8] = b"\x89PNG\r\n\x1a\n\0\0\0\rIHDR";

fn state(name: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-note-images-{name}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create("senha").unwrap();
    st
}

fn cleanup(st: &AppState) {
    let _ = std::fs::remove_dir_all(&st.dir);
}

fn note_with(st: &AppState, id: &str, image: &str) {
    let body = format!("antes\n![](canto-img:{image})\n");
    st.mutate(|d| d.notes.push(Note { id: id.into(), body, ..Default::default() })).unwrap();
}

#[test]
fn ids_with_path_tricks_are_rejected() {
    let long = "a".repeat(65);
    for bad in ["", "../vault", "a/b", "a\\b", "ABC", "x.json", "1f..", long.as_str()] {
        assert!(!valid_id(bad), "accepted {bad:?}");
        assert!(image_path(Path::new("canto"), bad).is_err());
    }
    assert!(valid_id(&new_id()));
}

#[test]
fn only_png_jpeg_gif_and_webp_pass_by_their_own_bytes() {
    assert_eq!(sniff(PNG), Some("image/png"));
    assert_eq!(sniff(&[0xFF, 0xD8, 0xFF, 0xE0]), Some("image/jpeg"));
    assert_eq!(sniff(b"GIF89a...."), Some("image/gif"));
    assert_eq!(sniff(b"RIFF\0\0\0\0WEBPVP8 "), Some("image/webp"));
    assert_eq!(sniff(b"<svg xmlns='http://www.w3.org/2000/svg'/>"), None);
    let err = decode_upload(&B64.encode(b"%PDF-1.7")).unwrap_err();
    assert!(err.to_string().contains("formato de imagem"), "{err}");
}

#[test]
fn an_image_over_two_megabytes_is_rejected_before_it_is_stored() {
    let mut big = PNG.to_vec();
    big.resize(MAX_BYTES + 1, 0);
    let err = decode_upload(&B64.encode(&big)).unwrap_err();
    assert!(err.to_string().contains("2 MB"), "{err}");
    let mut ok = PNG.to_vec();
    ok.resize(MAX_BYTES, 0);
    assert_eq!(decode_upload(&B64.encode(&ok)).unwrap().len(), MAX_BYTES);
}

#[test]
fn a_saved_image_is_sealed_on_disk_and_comes_back_as_a_data_url() {
    let st = state("roundtrip");
    let id = st.note_image_save(PNG).unwrap();
    let on_disk = std::fs::read_to_string(image_path(&st.dir, &id).unwrap()).unwrap();
    assert!(!on_disk.contains(&B64.encode(PNG)), "image stored in the clear");
    assert_eq!(st.note_image_data_url(&id).unwrap(), format!("data:image/png;base64,{}", B64.encode(PNG)));
    let vault = std::fs::read(store::vault_path(&st.dir)).unwrap();
    assert!(vault.len() < 2048, "the image went into vault.json");
    cleanup(&st);
}

#[test]
fn a_missing_image_reports_unavailable_and_a_locked_vault_reads_nothing() {
    let st = state("ausente");
    let err = st.note_image_data_url("abc123").unwrap_err();
    assert!(err.to_string().contains("imagem indisponível"), "{err}");
    let id = st.note_image_save(PNG).unwrap();
    st.lock();
    assert!(matches!(st.note_image_data_url(&id), Err(AppError::Locked)));
    cleanup(&st);
}

#[test]
fn references_are_found_in_note_bodies() {
    let refs = referenced(["x ![](canto-img:ab12) y", "![a](canto-img:ff)\n![](canto-img:../x)"]);
    assert_eq!(refs, HashSet::from(["ab12".to_string(), "ff".to_string()]));
}

#[test]
fn orphans_go_but_referenced_trashed_and_recent_images_stay() {
    let st = state("orfas");
    let kept = st.note_image_save(PNG).unwrap();
    let orphan = st.note_image_save(PNG).unwrap();
    let trashed = st.note_image_save(PNG).unwrap();
    note_with(&st, "n1", &kept);
    note_with(&st, "n2", &trashed);
    let removed = st.mutate(|d| d.remove("n2", now_ms())).unwrap().unwrap();
    let key = st.store_in_trash(removed).unwrap();
    std::fs::write(images_dir(&st.dir).join("not-an-id.json"), b"{}").unwrap();

    assert_eq!(st.note_images_gc(ORPHAN_GRACE).unwrap(), 0, "a freshly pasted draft image was collected");
    assert_eq!(st.note_images_gc(Duration::ZERO).unwrap(), 1);
    assert!(!image_path(&st.dir, &orphan).unwrap().exists());
    assert!(image_path(&st.dir, &kept).unwrap().exists());
    assert!(image_path(&st.dir, &trashed).unwrap().exists(), "undo would bring back a note without its image");
    assert!(images_dir(&st.dir).join("not-an-id.json").exists(), "a file the app never wrote was deleted");

    assert!(matches!(st.trash.take(&key), Some(Removed::Note(_))));
    st.note_images_gc(Duration::ZERO).unwrap();
    assert!(!image_path(&st.dir, &trashed).unwrap().exists(), "image of a note gone for good was kept");
    cleanup(&st);
}

#[test]
fn unlock_collects_images_orphaned_more_than_a_day_ago() {
    let st = state("desbloqueio");
    let old = st.note_image_save(PNG).unwrap();
    let fresh = st.note_image_save(PNG).unwrap();
    let two_days_ago = SystemTime::now() - 2 * ORPHAN_GRACE;
    let file = std::fs::File::options().write(true).open(image_path(&st.dir, &old).unwrap()).unwrap();
    file.set_modified(two_days_ago).unwrap();
    drop(file);
    st.lock();
    st.unlock("senha").unwrap();
    assert!(!image_path(&st.dir, &old).unwrap().exists());
    assert!(image_path(&st.dir, &fresh).unwrap().exists());
    cleanup(&st);
}
