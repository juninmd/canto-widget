use super::*;
use crate::forge::ForgeList;

fn gh(numbers: &[u64]) -> ForgeList {
    let items = numbers.iter().map(|n| ForgeItem { is_pr: true, ..crate::forge::item(*n, "", "", 0) }).collect();
    ForgeList { total: numbers.len() as u64, items, ..Default::default() }
}

fn mention(id: u64, body: &str) -> Mention {
    Mention {
        id,
        title: format!("Falha no deploy {id}"),
        url: format!("https://git.example.com/acme/atlas/-/issues/{id}"),
        author: "ana".into(),
        body: body.into(),
        project: "acme/atlas".into(),
    }
}

#[test]
fn a_github_mention_names_the_thread_and_opens_it() {
    let list = gh(&[7]);
    let fresh: Vec<&ForgeItem> = list.items.iter().collect();
    let [e] = &github_events(&fresh, false)[..] else { panic!("one alert") };
    assert_eq!((e.id.as_str(), e.tag.as_str(), e.organizer.as_str()), ("mention:github:o/r#7", "github", "o/r#7"));
    assert_eq!((e.title.as_str(), e.link.as_str()), ("item 7", "https://github.com/o/r/issues/7"));
    assert_eq!(e.description, "Você foi mencionado em o/r#7.");
    assert_eq!(github_events(&fresh, true)[0].description, "You were mentioned in o/r#7.");
}

#[test]
fn github_mentions_seed_once_ring_once_and_ring_again_after_leaving_the_list() {
    let (first, second) = (gh(&[1, 2]), gh(&[3, 1, 2]));
    let (fresh, seen) = review_alert::advance(None, &first);
    assert!(fresh.is_empty());
    let (fresh, seen) = review_alert::advance(Some(&seen), &second);
    assert_eq!(fresh.iter().map(|i| i.number).collect::<Vec<_>>(), [3]);
    let (fresh, seen) = review_alert::advance(Some(&seen), &second);
    assert!(fresh.is_empty());
    let (_, seen) = review_alert::advance(Some(&seen), &first);
    let (fresh, _) = review_alert::advance(Some(&seen), &second);
    assert_eq!(fresh.iter().map(|i| i.number).collect::<Vec<_>>(), [3]);
}

#[test]
fn a_gitlab_mention_carries_who_said_what_flattened_and_capped() {
    let long = format!("oi\n\n  @voce   olha   isso {}", "x".repeat(400));
    let ms = [mention(5, &long)];
    let fresh: Vec<&Mention> = ms.iter().collect();
    let [e] = &gitlab_events(&fresh, false)[..] else { panic!("one alert") };
    assert_eq!((e.id.as_str(), e.tag.as_str(), e.organizer.as_str()), ("mention:gitlab:5", "gitlab", "acme/atlas"));
    assert!(e.description.starts_with("@ana: oi @voce olha isso xxx"), "{}", e.description);
    assert_eq!(e.description.chars().count(), "@ana: ".chars().count() + 280);
    assert_eq!(e.link, "https://git.example.com/acme/atlas/-/issues/5");
}

#[test]
fn a_gitlab_mention_without_text_or_author_still_reads() {
    let mut m = mention(1, "");
    assert_eq!(gitlab_events(&[&m], false)[0].description, "@ana");
    m.author.clear();
    m.body = "texto".into();
    assert_eq!(gitlab_events(&[&m], false)[0].description, "texto");
}

#[test]
fn gitlab_todos_seed_then_only_new_ids_ring() {
    let first = [mention(1, ""), mention(2, "")];
    let (fresh, seen) = advance_gitlab(None, &first);
    assert!(fresh.is_empty());
    let second = [mention(3, ""), mention(1, ""), mention(2, "")];
    let (fresh, seen) = advance_gitlab(Some(&seen), &second);
    assert_eq!(fresh.iter().map(|m| m.id).collect::<Vec<_>>(), [3]);
    assert!(advance_gitlab(Some(&seen), &second).0.is_empty());
}

#[test]
fn a_burst_becomes_one_summary_per_forge() {
    let ms: Vec<Mention> = (1..=5).map(|i| mention(i, "")).collect();
    let all: Vec<&Mention> = ms.iter().collect();
    let [e] = &gitlab_events(&all, true)[..] else { panic!("one summary") };
    assert_eq!((e.id.as_str(), e.title.as_str()), ("mention:gitlab:summary", "5 new mentions"));
    assert_eq!(e.description.lines().count(), 5);
    assert!(e.link.is_empty());
    let list = gh(&[1, 2, 3, 4]);
    let items: Vec<&ForgeItem> = list.items.iter().collect();
    assert_eq!(github_events(&items, false)[0].id, "mention:github:summary");
}
