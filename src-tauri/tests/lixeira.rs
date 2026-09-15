use canto_widget_lib::clipboard::{ClipHistory, ClipItem};
use canto_widget_lib::lixeira::{desfazer, Removido};
use canto_widget_lib::model::{now_ms, Note, Task, VaultData};
use canto_widget_lib::vault::AppState;

fn tarefa(id: &str, updated_at: i64) -> Task {
    Task { id: id.into(), title: "pagar boleto".into(), done: false, day: "2026-09-14".into(), created_at: 1, updated_at, ..Default::default() }
}

fn nota(id: &str) -> Note {
    Note { id: id.into(), title: "wifi".into(), body: "senha".into(), tags: vec![], created_at: 1, updated_at: 5, ..Default::default() }
}

fn clip(id: &str, text: &str, copied_at: i64) -> ClipItem {
    ClipItem { id: id.into(), text: text.into(), copied_at, pinned: false }
}

fn cofre(nome: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-lixeira-{nome}-{}-{}", std::process::id(), now_ms()));
    let st = AppState::new(dir);
    st.create("1234").unwrap();
    st
}

#[test]
fn desfazer_devolve_a_tarefa_e_tira_a_lapide() {
    let mut d = VaultData { tasks: vec![tarefa("t1", 10)], ..Default::default() };
    let removido = d.remover("t1", 20).expect("tarefa existia");
    assert!(d.tasks.is_empty() && d.deleted.contains_key("t1"));

    d.restaurar(removido, 30);

    assert_eq!(d.tasks.len(), 1);
    assert!(!d.deleted.contains_key("t1"), "lapide ficou e o proximo merge apagaria de novo");
}

#[test]
fn item_restaurado_sobrevive_a_backup_antigo_com_a_lapide() {
    let mut local = VaultData { tasks: vec![tarefa("t1", 10)], ..Default::default() };
    let removido = local.remover("t1", 20).unwrap();
    let backup_antigo = local.clone();
    local.restaurar(removido, 30);

    let fundido = local.merge(backup_antigo);

    assert_eq!(fundido.tasks.len(), 1, "importar backup feito entre excluir e desfazer apagou a tarefa");
}

#[test]
fn remover_id_inexistente_nao_guarda_nada_para_desfazer() {
    let mut d = VaultData { notes: vec![nota("n1")], ..Default::default() };
    assert!(d.remover("nao-existe", 1).is_none());
    assert_eq!(d.notes.len(), 1);
}

#[test]
fn clipboard_restaurado_volta_na_ordem_sem_duplicar() {
    let mut h = ClipHistory { items: vec![clip("c3", "novo", 300)] };
    h.restaurar(vec![clip("c1", "velho", 100), clip("c2", "novo", 200), clip("c3", "novo", 300)]);
    let textos: Vec<&str> = h.items.iter().map(|i| i.text.as_str()).collect();
    assert_eq!(textos, ["novo", "velho"], "duplicou texto ou perdeu a ordem cronologica");
}

#[test]
fn chave_so_desfaz_uma_vez() {
    let st = cofre("uma-vez");
    st.mutate(|d| d.tasks.push(tarefa("t1", now_ms()))).unwrap();
    let removido = st.mutate(|d| d.remover("t1", now_ms())).unwrap().unwrap();
    let chave = st.lixeira.guardar(removido);

    assert!(desfazer(&st, &chave).unwrap());
    assert!(!desfazer(&st, &chave).unwrap(), "segundo clique restaurou de novo");
    assert_eq!(st.read(|d| d.tasks.len()).unwrap(), 1);
}

#[test]
fn trancar_esvazia_a_lixeira() {
    let st = cofre("tranca");
    let chave = st.lixeira.guardar(Removido::Nota(nota("n1")));
    st.lock();
    st.unlock("1234").unwrap();
    assert!(!desfazer(&st, &chave).unwrap(), "conteudo em claro sobreviveu ao cofre trancado");
}

#[test]
fn lixeira_tem_teto_e_descarta_a_mais_antiga() {
    let st = cofre("teto");
    let primeira = st.lixeira.guardar(Removido::Nota(nota("n0")));
    for i in 1..=20 {
        st.lixeira.guardar(Removido::Nota(nota(&format!("n{i}"))));
    }
    assert!(st.lixeira.retirar(&primeira).is_none());
}

#[test]
fn remocao_que_chega_depois_de_trancar_nao_fica_em_claro_na_ram() {
    let st = cofre("depois-tranca");
    st.lock();
    assert!(st.guardar_na_lixeira(Removido::Nota(nota("n1"))).is_none());
    st.unlock("1234").unwrap();
    assert!(st.lixeira.retirar("qualquer").is_none());
}

#[test]
fn desfazer_com_cofre_trancado_responde_que_nao_da_mais() {
    let st = cofre("desfaz-trancado");
    let chave = st.guardar_na_lixeira(Removido::Nota(nota("n1"))).unwrap();
    st.lock();
    assert!(!desfazer(&st, &chave).unwrap(), "devia ser Ok(false), nao erro de cofre trancado");
}
