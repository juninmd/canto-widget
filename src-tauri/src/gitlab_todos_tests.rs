use super::*;

#[test]
fn only_todos_on_the_configured_instance_are_kept_and_mentions_are_told_apart() {
    let raw: Vec<RawTodo> = serde_json::from_str(
        r#"[
        {"id":1,"action_name":"mentioned","target_url":"https://git.example.com/a/b/-/issues/3","body":"@voce veja","created_at":"2026-10-12T09:00:00.000Z","target_type":"Issue",
         "author":{"username":"ana","name":"Ana Pires","avatar_url":"https://git.example.com/uploads/ana.png"},"target":{"title":"Falha no deploy"},"project":{"path_with_namespace":"a/b"}},
        {"id":2,"action_name":"assigned","target_url":"https://git.example.com/a/b/-/issues/4","body":"x"},
        {"id":3,"action_name":"directly_addressed","target_url":"https://git.example.com/a/b/-/merge_requests/5","body":"@voce ok?","target_type":"MergeRequest"},
        {"id":4,"action_name":"mentioned","target_url":"https://evil.example.org/a/b/-/issues/6","body":"x"},
        {"id":5,"action_name":"build_failed","target_url":"https://git.example.com/a/b/-/pipelines/9","body":"x"}
    ]"#,
    )
    .unwrap();
    let all = todos_in(raw, "https://git.example.com");
    assert_eq!(
        all.iter().map(|m| (m.id, m.action.as_str())).collect::<Vec<_>>(),
        [(1, "mentioned"), (2, "assigned"), (3, "directly_addressed"), (5, "build_failed")]
    );
    let found: Vec<Mention> = all.into_iter().filter(is_mention).collect();
    assert_eq!(found.iter().map(|m| m.id).collect::<Vec<_>>(), [1, 3]);
    assert_eq!(
        found[0],
        Mention {
            id: 1,
            action: "mentioned".into(),
            title: "Falha no deploy".into(),
            url: "https://git.example.com/a/b/-/issues/3".into(),
            author: "ana".into(),
            author_name: "Ana Pires".into(),
            avatar_url: "https://git.example.com/uploads/ana.png".into(),
            body: "@voce veja".into(),
            project: "a/b".into(),
            at: "2026-10-12T09:00:00.000Z".into(),
            is_pr: false,
            done: false,
        }
    );
    assert!(found[1].author.is_empty() && found[1].title.is_empty(), "missing fields default to empty");
    assert!(found[1].is_pr && found[1].at.is_empty(), "a merge request target is a PR; no date stays empty");
}
