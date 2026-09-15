use canto_widget_lib::error::AppError;
use canto_widget_lib::model::{Repetir, Task, VaultData};
use canto_widget_lib::rotina::{definir_detalhes, dia_da_semana, id_da_instancia, materializar, validar_hora};

fn tarefa(id: &str, dia: &str) -> Task {
    Task { id: id.into(), title: "tomar remedio".into(), day: dia.into(), created_at: 1, updated_at: 1, ..Default::default() }
}

fn com_serie(dia: &str, r: Repetir) -> VaultData {
    let mut t = tarefa("s1", dia);
    definir_detalhes(&mut t, Some("08:30".into()), Some(r), 2).unwrap();
    VaultData { tasks: vec![t], ..Default::default() }
}

fn do_dia<'a>(d: &'a VaultData, dia: &str) -> Vec<&'a Task> {
    d.tasks.iter().filter(|t| t.day == dia).collect()
}

#[test]
fn dia_da_semana_bate_com_o_calendario() {
    assert_eq!(dia_da_semana("2026-09-14"), Some(1)); // segunda
    assert_eq!(dia_da_semana("2026-09-13"), Some(0)); // domingo
    assert_eq!(dia_da_semana("2024-02-29"), Some(4)); // quinta, ano bissexto
    assert_eq!(dia_da_semana("2000-01-01"), Some(6)); // sabado
    for ruim in ["", "2026-9-14", "2026-13-01", "abcd-ef-gh", "2026-09-14T00"] {
        assert_eq!(dia_da_semana(ruim), None, "aceitou {ruim:?}");
    }
}

#[test]
fn diaria_cria_a_tarefa_do_dia_seguinte_com_horario_e_em_aberto() {
    let mut d = com_serie("2026-09-14", Repetir::Diaria);
    d.tasks[0].done = true;
    assert_eq!(materializar(&mut d, "2026-09-15", 10), 1);
    let nova = do_dia(&d, "2026-09-15")[0];
    assert_eq!(nova.id, id_da_instancia("s1", "2026-09-15"));
    assert!(!nova.done, "instancia nova herdou o concluido da anterior");
    assert_eq!(nova.hora.as_deref(), Some("08:30"));
}

#[test]
fn abrir_o_dia_de_novo_nao_duplica() {
    let mut d = com_serie("2026-09-14", Repetir::Diaria);
    materializar(&mut d, "2026-09-15", 10);
    assert_eq!(materializar(&mut d, "2026-09-15", 11), 0);
    assert_eq!(do_dia(&d, "2026-09-15").len(), 1);
}

#[test]
fn dias_uteis_pula_fim_de_semana() {
    let mut d = com_serie("2026-09-18", Repetir::DiasUteis); // sexta
    assert_eq!(materializar(&mut d, "2026-09-19", 10), 0, "criou no sabado");
    assert_eq!(materializar(&mut d, "2026-09-21", 10), 1, "nao criou na segunda");
}

#[test]
fn semanal_so_no_dia_escolhido() {
    let mut d = com_serie("2026-09-14", Repetir::Semanal { dia: 1 });
    assert_eq!(materializar(&mut d, "2026-09-15", 10), 0);
    assert_eq!(materializar(&mut d, "2026-09-21", 10), 1);
}

#[test]
fn instancia_excluida_nao_renasce() {
    let mut d = com_serie("2026-09-14", Repetir::Diaria);
    materializar(&mut d, "2026-09-15", 10);
    d.tombstone(&id_da_instancia("s1", "2026-09-15"), 20);
    assert_eq!(materializar(&mut d, "2026-09-15", 30), 0);
    assert_eq!(materializar(&mut d, "2026-09-16", 30), 1, "excluir um dia parou a serie inteira");
}

#[test]
fn deixar_de_repetir_encerra_a_serie() {
    let mut d = com_serie("2026-09-14", Repetir::Diaria);
    materializar(&mut d, "2026-09-15", 10);
    let hoje = d.tasks.iter_mut().find(|t| t.day == "2026-09-15").unwrap();
    definir_detalhes(hoje, None, None, 11).unwrap();
    assert_eq!(materializar(&mut d, "2026-09-16", 12), 0);
}

#[test]
fn duas_maquinas_geram_a_mesma_instancia_e_o_merge_nao_duplica() {
    let mut a = com_serie("2026-09-14", Repetir::Diaria);
    let mut b = a.clone();
    materializar(&mut a, "2026-09-15", 10);
    materializar(&mut b, "2026-09-15", 99);
    assert_eq!(do_dia(&a.merge(b), "2026-09-15").len(), 1);
}

#[test]
fn horario_fora_do_formato_e_recusado_antes_do_cofre() {
    assert_eq!(validar_hora("09:05").unwrap(), "09:05");
    for ruim in ["9:05", "24:00", "12:60", "+1:00", "ab:cd", "12:3é", ""] {
        assert!(matches!(validar_hora(ruim), Err(AppError::Config(_))), "aceitou {ruim:?}");
    }
    let mut t = tarefa("x", "2026-09-14");
    assert!(definir_detalhes(&mut t, None, Some(Repetir::Semanal { dia: 7 }), 1).is_err());
    assert!(t.repetir.is_none() && t.serie.is_none(), "estado mudou apesar do erro");
}

#[test]
fn cofre_antigo_sem_campos_novos_abre_igual() {
    let json = r#"{"tasks":[{"id":"a","title":"t","done":false,"day":"2026-09-14","created_at":1,"updated_at":1}],
                   "notes":[{"id":"n","title":"t","body":"b","created_at":1,"updated_at":1}]}"#;
    let d: VaultData = serde_json::from_str(json).unwrap();
    assert!(d.tasks[0].hora.is_none() && d.tasks[0].repetir.is_none());
    assert!(!d.notes[0].fixada);
}

mod notas {
    use canto_widget_lib::cmd_notas::{note_matches, ordenar};
    use canto_widget_lib::model::Note;

    fn nota(id: &str, tags: &[&str], fixada: bool, updated_at: i64) -> Note {
        Note {
            id: id.into(),
            title: format!("nota {id}"),
            tags: tags.iter().map(|t| t.to_string()).collect(),
            fixada,
            updated_at,
            ..Default::default()
        }
    }

    #[test]
    fn fixada_fica_no_topo_mesmo_mais_antiga() {
        let mut l = vec![nota("nova", &[], false, 50), nota("velha-fixada", &[], true, 1), nota("media", &[], false, 20)];
        ordenar(&mut l);
        let ids: Vec<_> = l.iter().map(|n| n.id.as_str()).collect();
        assert_eq!(ids, ["velha-fixada", "nova", "media"]);
    }

    #[test]
    fn clique_na_tag_filtra_pela_tag_exata_e_nao_por_trecho() {
        let trabalho = nota("a", &["trabalho"], false, 1);
        let trab = nota("b", &["trab"], false, 1);
        assert!(note_matches(&trabalho, "#trabalho"));
        assert!(!note_matches(&trab, "#trabalho"));
        assert!(!note_matches(&trabalho, "#trab"), "#tag virou busca por trecho");
        assert!(note_matches(&trabalho, "trab"), "busca livre deixou de achar trecho da tag");
    }
}

#[test]
fn concluir_pelo_lembrete_nunca_reabre_tarefa_ja_feita() {
    use canto_widget_lib::commands::concluir;
    let mut d = VaultData { tasks: vec![tarefa("a", "2026-09-14")], ..Default::default() };
    assert!(concluir(&mut d, "a", 5), "nao concluiu");
    assert!(!concluir(&mut d, "a", 6), "segunda chamada mudou o cofre");
    assert!(d.tasks[0].done);
    assert_eq!(d.tasks[0].updated_at, 5, "carimbo mudou sem mudanca real");
    assert!(!concluir(&mut d, "inexistente", 7));
}
