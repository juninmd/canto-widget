use super::*;

const CHART: &str = r#"{"response":{"last_update":1761210000,"ranks":[
  {"rank":2,"appid":570,"concurrent_in_game":600000,"peak_in_game":780000},
  {"rank":1,"appid":730,"concurrent_in_game":1500000,"peak_in_game":1700000},
  {"rank":3,"appid":578080,"concurrent_in_game":400000,"peak_in_game":700000}
]}}"#;

#[test]
fn the_chart_is_read_in_rank_order_with_players_and_peak() {
    let (ranks, updated) = parse(CHART);
    assert_eq!(updated, 1761210000);
    assert_eq!(ranks.iter().map(|r| r.appid).collect::<Vec<_>>(), vec![730, 570, 578080]);
    assert_eq!((ranks[0].players, ranks[0].peak), (1_500_000, 1_700_000));
    assert_eq!(total_players(&ranks), 2_500_000);
    assert_eq!(parse("{}").0, Vec::new());
}

#[test]
fn movement_compares_with_the_previous_chart() {
    let (ranks, _) = parse(CHART);
    let previous = HashMap::from([(730u32, 1u32), (570, 4)]);
    assert_eq!(moved(&previous, &ranks[0]), 0);
    assert_eq!(moved(&previous, &ranks[1]), 2, "from 4th to 2nd");
    assert_eq!(moved(&previous, &ranks[2]), 0, "new on the chart");
    assert_eq!(moved(&HashMap::from([(578080u32, 1u32)]), &ranks[2]), -2);
}

#[test]
fn only_mine_filters_before_paging() {
    let ranks: Vec<Rank> = (1..=45).map(|i| Rank { rank: i, appid: i * 10, players: 1, peak: 1 }).collect();
    let mine = HashSet::from([10u32, 450]);
    assert_eq!(slice(&ranks, &mine, false, 2).0.len(), 5);
    assert_eq!(slice(&ranks, &mine, false, 0).1, 3);
    let (kept, pages) = slice(&ranks, &mine, true, 0);
    assert_eq!((kept.iter().map(|r| r.appid).collect::<Vec<_>>(), pages), (vec![10, 450], 1));
}
