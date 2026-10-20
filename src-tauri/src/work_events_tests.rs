use super::*;
use crate::calendar::Sender;
use crate::forge::item;

fn thread(n: u64, author: &str, pr: bool) -> ForgeItem {
    ForgeItem { is_pr: pr, author: author.into(), updated_at: "2026-10-12T10:00:00Z".into(), ..item(n, "", "", 0) }
}

#[test]
fn what_i_assigned_to_myself_is_no_news() {
    let list = ForgeList {
        total: 3,
        items: vec![thread(1, "voce", true), thread(2, "Ana", false), thread(3, "VOCE", false)],
        ..Default::default()
    };
    let out = others_only(list, "voce");
    assert_eq!((out.total, out.items.iter().map(|i| i.number).collect::<Vec<_>>()), (1, vec![2]));
}

#[test]
fn an_assignment_names_who_opened_it_and_when_and_a_burst_is_one_summary() {
    let (pr, issue) =
        (ForgeItem { created_at: "2026-10-12T09:00:00Z".into(), ..thread(7, "ana", true) }, thread(8, "", false));
    let out = assigned_events(&[&pr, &issue], false);
    assert_eq!((out[0].id.as_str(), out[0].tag.as_str()), ("pr:assigned:o/r#7", "assigned"));
    assert_eq!(out[0].sender.as_ref().map(|s| s.login.as_str()), Some("ana"));
    assert_eq!(out[0].start, "2026-10-12T09:00:00Z");
    assert_eq!((out[0].description.as_str(), out[1].sender.as_ref()), ("", None));

    let many: Vec<ForgeItem> = (1..=4).map(|n| thread(n, "ana", true)).collect();
    let refs: Vec<&ForgeItem> = many.iter().collect();
    let [sum] = &assigned_events(&refs, false)[..] else { panic!("one summary") };
    assert_eq!((sum.id.as_str(), sum.title.as_str()), ("pr:assigned:summary", "4 itens atribuídos a você"));
}

#[test]
fn a_thread_i_took_part_in_rings_only_when_its_update_moves() {
    let mut items = vec![thread(1, "ana", true), thread(2, "bia", false)];
    let (none, seen) = advance_replies(None, &items);
    assert!(none.is_empty(), "the first reading only seeds");
    let (none, seen) = advance_replies(Some(&seen), &items);
    assert!(none.is_empty(), "nothing moved");
    items[1].updated_at = "2026-10-12T11:00:00Z".into();
    items.push(thread(3, "caio", false));
    let (moved, seen) = advance_replies(Some(&seen), &items);
    assert_eq!(moved.iter().map(|i| i.number).collect::<Vec<_>>(), [2], "a thread not listed before only seeds");
    assert_eq!(seen.len(), 3);
    let (_, seen) = advance_replies(Some(&seen), &items[..1]);
    assert_eq!(seen.len(), 1, "a thread that left the list is forgotten");
}

#[test]
fn a_reply_carries_who_wrote_and_what() {
    let t = thread(7, "ana", true);
    let said = Said {
        sender: Some(Sender { name: String::new(), login: "bia".into(), avatar: String::new() }),
        text: "pode ver?".into(),
        mentions_me: false,
    };
    let [e] = &reply_events(&[(&t, said.clone())], false)[..] else { panic!("one alert") };
    assert_eq!((e.id.as_str(), e.tag.as_str(), e.description.as_str()), ("pr:reply:o/r#7", "reply", "@bia: pode ver?"));
    assert_eq!(e.sender, said.sender);
    let silent = reply_events(&[(&t, Said::default())], false);
    assert!(silent[0].description.is_empty() && silent[0].sender.is_none(), "no comment found: the thread still rings");
    let many: Vec<(&ForgeItem, Said)> = (0..4).map(|_| (&t, Said::default())).collect();
    assert_eq!(reply_events(&many, false)[0].title, "4 respostas nas suas conversas");
}

fn todo(id: u64) -> Mention {
    Mention {
        action: "build_failed".into(),
        id,
        title: "Ajusta o lote".into(),
        url: format!("https://git.example.com/acme/atlas/-/merge_requests/{id}"),
        project: "acme/atlas".into(),
        ..Default::default()
    }
}

#[test]
fn a_failed_pipeline_is_a_ci_alert_on_the_merge_request() {
    let m = todo(9);
    let [e] = &pipeline_events(&[&m], false)[..] else { panic!("one alert") };
    assert_eq!((e.tag.as_str(), e.organizer.as_str(), e.link.as_str()), ("ci", "acme/atlas", m.url.as_str()));
    assert_eq!(e.description, "O pipeline falhou neste MR.");
    assert_eq!(pipeline_events(&[&m], true)[0].description, "The pipeline failed on this merge request.");
    let many: Vec<Mention> = (1..=4).map(todo).collect();
    let refs: Vec<&Mention> = many.iter().collect();
    assert_eq!(pipeline_events(&refs, false)[0].title, "4 pipelines falharam");
}
