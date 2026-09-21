use super::*;
use crate::forge_filter::{Order, SECTIONS};

fn param<'a>(r: &'a Request, key: &str) -> Option<&'a str> {
    r.params.iter().find(|(k, _)| *k == key).map(|(_, v)| v.as_str())
}

#[test]
fn every_section_asks_only_for_open_items_with_an_explicit_scope() {
    for s in SECTIONS {
        for r in requests(s, "ana", 1, &ForgeFilter::default()).unwrap() {
            assert_eq!(param(&r, "state"), Some("opened"), "{s:?}");
            assert!(param(&r, "scope").is_some(), "{s:?}: the MR endpoint defaults to created_by_me");
        }
    }
}

#[test]
fn review_requested_looks_at_every_project_for_the_user_as_reviewer() {
    let r = requests(Section::ReviewRequested, "ana", 1, &ForgeFilter::default()).unwrap();
    assert_eq!(r.len(), 1);
    assert!(r[0].is_mr());
    assert_eq!((param(&r[0], "scope"), param(&r[0], "reviewer_username")), (Some("all"), Some("ana")));
}

#[test]
fn assigned_hits_both_endpoints_unless_the_filter_picks_one() {
    let both = requests(Section::Assigned, "ana", 1, &ForgeFilter::default()).unwrap();
    assert_eq!(both.iter().map(|r| r.path).collect::<Vec<_>>(), vec!["issues", "merge_requests"]);
    let only_mr = requests(Section::Assigned, "ana", 1, &ForgeFilter { kind: Kind::Pr, ..Default::default() }).unwrap();
    assert_eq!(only_mr.len(), 1);
    assert!(requests(Section::MyIssues, "ana", 1, &ForgeFilter { kind: Kind::Pr, ..Default::default() }).unwrap().is_empty());
}

#[test]
fn sort_order_text_and_page_reach_the_api() {
    let f = ForgeFilter { text: " login\nbug ".into(), sort: Sort::Created, order: Order::Asc, ..Default::default() };
    let r = &requests(Section::MyPrs, "ana", 99, &f).unwrap()[0];
    assert_eq!(param(r, "order_by"), Some("created_at"));
    assert_eq!(param(r, "sort"), Some("asc"));
    assert_eq!(param(r, "search"), Some("login bug"));
    assert_eq!(r.page(), crate::forge_filter::MAX_PAGE);
}

#[test]
fn sorting_by_comments_is_refused_instead_of_silently_ignored() {
    let f = ForgeFilter { sort: Sort::Comments, ..Default::default() };
    assert!(requests(Section::MyPrs, "ana", 1, &f).is_err());
}

#[test]
fn opened_today_includes_merged_and_closed_mrs() {
    let r = opened_since("2026-09-18T03:00:00+00:00");
    assert_eq!((param(&r, "state"), param(&r, "created_after")), (Some("all"), Some("2026-09-18T03:00:00+00:00")));
}

#[test]
fn base_url_accepts_gitlab_com_and_self_hosted_prefixes() {
    assert_eq!(base_url("https://gitlab.com/").unwrap(), "https://gitlab.com");
    assert_eq!(base_url(" gitlab.acme.com.br ").unwrap(), "https://gitlab.acme.com.br");
    assert_eq!(base_url("https://git.acme.io:8443/gitlab/").unwrap(), "https://git.acme.io:8443/gitlab");
}

#[test]
fn base_url_refuses_what_could_leak_the_token() {
    for bad in ["http://gitlab.acme.com", "ftp://gitlab.com", "https://user:pw@gitlab.com", "https://gitlab.com/?x=1", "https://gitlab.com/#a", "https://", ""] {
        assert!(base_url(bad).is_err(), "{bad}");
    }
}

#[test]
fn token_must_look_like_a_token() {
    assert_eq!(token("  glpat-abcdefghij0123456789 \n").unwrap(), "glpat-abcdefghij0123456789");
    for bad in ["curto", "glpat-abc def ghij0123456789", "glpat-ção-abcdefghij0123456789", &"x".repeat(256)] {
        assert!(token(bad).is_err(), "{bad}");
    }
}
