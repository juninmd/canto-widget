use super::*;

fn runs(json: &str) -> Vec<Run> {
    serde_json::from_str::<Runs>(json).unwrap().check_runs
}

fn statuses(json: &str) -> Vec<Status> {
    serde_json::from_str::<Combined>(json).unwrap().statuses
}

#[test]
fn only_failed_runs_are_named_with_their_link() {
    let runs = runs(
        r#"{"check_runs":[
            {"id":1,"name":"build","status":"completed","conclusion":"success","html_url":"https://github.com/o/r/runs/1"},
            {"id":2,"name":"lint","status":"completed","conclusion":"failure","html_url":"https://github.com/o/r/runs/2"},
            {"id":3,"name":"e2e","status":"in_progress","conclusion":null,"html_url":"https://github.com/o/r/runs/3"},
            {"id":4,"name":"deploy","status":"completed","conclusion":"timed_out","html_url":"https://github.com/o/r/runs/4"},
            {"id":5,"name":"docs","status":"completed","conclusion":"skipped","html_url":"https://github.com/o/r/runs/5"}
        ]}"#,
    );
    let jobs = failed_jobs(&runs, &[]);
    let names: Vec<&str> = jobs.iter().map(|j| j.name.as_str()).collect();
    assert_eq!(names, ["lint", "deploy"]);
    assert_eq!((jobs[0].id, jobs[0].url.as_str()), (2, "https://github.com/o/r/runs/2"));
}

#[test]
fn failed_legacy_statuses_follow_the_runs_and_a_foreign_link_is_dropped() {
    let runs = runs(r#"{"check_runs":[{"id":9,"name":"build","status":"completed","conclusion":"failure"}]}"#);
    let statuses = statuses(
        r#"{"statuses":[
            {"context":"ci/circle","state":"failure","target_url":"https://circleci.example/1"},
            {"context":"ci/ok","state":"success","target_url":"https://github.com/o/r/1"},
            {"context":"ci/jenkins","state":"error","target_url":"https://github.com/o/r/2"},
            {"context":"ci/nolink","state":"failure","target_url":null}
        ]}"#,
    );
    let jobs = failed_jobs(&runs, &statuses);
    let seen: Vec<(&str, u64, &str)> = jobs.iter().map(|j| (j.name.as_str(), j.id, j.url.as_str())).collect();
    assert_eq!(
        seen,
        [("build", 9, ""), ("ci/circle", 0, ""), ("ci/jenkins", 0, "https://github.com/o/r/2"), ("ci/nolink", 0, ""),]
    );
}

#[test]
fn the_list_is_capped_and_nameless_entries_are_skipped() {
    let many: Vec<Run> = (1..=8)
        .map(|i| Run {
            id: i,
            name: if i == 1 { String::new() } else { format!("job{i}") },
            html_url: String::new(),
            status: "completed".into(),
            conclusion: Some("failure".into()),
        })
        .collect();
    let jobs = failed_jobs(&many, &[]);
    assert_eq!(jobs.len(), MAX_JOBS);
    assert_eq!(jobs[0].name, "job2");
}

#[test]
fn the_broken_step_is_the_first_one_that_failed() {
    let job: Job = serde_json::from_str(
        r#"{"steps":[
            {"name":"Set up job","conclusion":"success"},
            {"name":"Run tests","conclusion":"failure"},
            {"name":"Upload","conclusion":"skipped"},
            {"name":"Cleanup","conclusion":"failure"}
        ]}"#,
    )
    .unwrap();
    assert_eq!(broken_step(&job.steps).as_deref(), Some("Run tests"));
    assert_eq!(broken_step(&[]), None);
}
