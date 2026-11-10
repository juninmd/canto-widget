use super::*;

const ACCOUNT: &str = "76561190000000000";

fn price(discount: u32, cents: i64) -> Price {
    Price {
        discount,
        final_cents: cents,
        final_formatted: "R$ 9,99".into(),
        initial_formatted: "R$ 49,99".into(),
        ..Default::default()
    }
}

fn seen(hot: &[(u32, u32)]) -> SteamWatch {
    SteamWatch {
        watching: true,
        region: "br".into(),
        steamid: ACCOUNT.into(),
        hot: hot.iter().copied().collect(),
        ..Default::default()
    }
}

fn scan(from: &SteamWatch, prices: &[(u32, Price)]) -> (Vec<u32>, HotBaseline) {
    hot_deals(from, &prices.iter().cloned().collect(), "br", ACCOUNT)
}

#[test]
fn only_a_sale_of_75_percent_or_more_rings_deepest_first() {
    let (ring, next) = scan(&SteamWatch::default(), &[(1, price(74, 100)), (2, price(75, 100)), (3, price(90, 100))]);
    assert_eq!(ring, vec![3, 2], "74% stays quiet");
    assert_eq!(next.hot, HashMap::from([(2, 75), (3, 90)]));
    assert_eq!((next.region.as_str(), next.steamid.as_str()), ("br", ACCOUNT));
}

#[test]
fn a_sale_rings_once_and_again_only_when_it_gets_deeper() {
    let state = seen(&[(2, 75)]);
    assert!(scan(&state, &[(2, price(75, 100))]).0.is_empty(), "the same sale twice is one alert");
    let (ring, next) = scan(&state, &[(2, price(90, 100))]);
    assert_eq!((ring, next.hot[&2]), (vec![2], 90));
    let (ring, next) = scan(&seen(&[(2, 90)]), &[(2, price(80, 100))]);
    assert!(ring.is_empty(), "a smaller discount within the same sale does not ring");
    assert_eq!(next.hot[&2], 90);
}

#[test]
fn when_the_sale_ends_the_next_one_rings_anew() {
    let (_, ended) = scan(&seen(&[(2, 80)]), &[(2, price(0, 5000))]);
    assert!(ended.hot.is_empty());
    let after = SteamWatch { hot: ended.hot, ..seen(&[]) };
    assert_eq!(scan(&after, &[(2, price(80, 100))]).0, vec![2]);
}

#[test]
fn another_store_or_account_starts_from_nothing() {
    let state = seen(&[(2, 80)]);
    let prices: HashMap<u32, Price> = HashMap::from([(2, price(80, 100))]);
    assert_eq!(hot_deals(&state, &prices, "us", ACCOUNT).0, vec![2]);
    assert_eq!(hot_deals(&state, &prices, "br", "76561190000000001").0, vec![2]);
}

#[test]
fn a_free_game_is_not_a_sale() {
    assert!(scan(&SteamWatch::default(), &[(1, Price { is_free: true, discount: 100, ..Default::default() })])
        .0
        .is_empty());
}

#[test]
fn an_update_rings_only_when_the_newest_post_changes() {
    let (ring, next) = new_updates(&HashMap::new(), &HashMap::from([(1, "a".to_string())]));
    assert!(ring.is_empty(), "a game seen for the first time only records");
    let (ring, next) = new_updates(&next, &HashMap::from([(1, "a".to_string()), (2, "x".to_string())]));
    assert!(ring.is_empty());
    let (ring, next) = new_updates(&next, &HashMap::from([(1, "b".to_string()), (2, "x".to_string())]));
    assert_eq!(ring, vec![1]);
    assert_eq!(next[&1], "b");
    let (_, kept) = new_updates(&next, &HashMap::new());
    assert_eq!(kept.len(), 2, "a game uninstalled for a while keeps its last update");
}

#[test]
fn the_toasts_use_the_stores_own_price_and_the_posts_title() {
    let (title, body) = deal_message("Sekiro", &price(80, 999));
    assert_eq!(title, "Promoção na lista de desejos");
    assert_eq!(body, "Sekiro · -80% · R$ 9,99 (era R$ 49,99)");
    assert_eq!(
        update_message("Hades II", "Patch 3"),
        ("Hades II · nova atualização".to_string(), "Patch 3".to_string())
    );
    assert_eq!(summary_message(4).1, "+4 avisos na aba Steam");
}
