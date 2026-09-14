use canto_widget_lib::backup::{self, ResumoImport, MANTER};
use canto_widget_lib::error::AppError;
use canto_widget_lib::model::{now_ms, Note, Task};
use canto_widget_lib::vault::AppState;
use std::path::{Path, PathBuf};

fn maquina(nome: &str, senha: &str) -> AppState {
    let dir = std::env::temp_dir().join(format!("canto-bkp-{nome}-{}-{}", std::process::id(), now_ms()));
    let _ = std::fs::remove_dir_all(&dir);
    let st = AppState::new(dir);
    st.create(senha).unwrap();
    st
}

fn com_tarefa(st: &AppState, id: &str) {
    st.mutate(|d| {
        d.tasks.push(Task {
            id: id.into(),
            title: "pagar boleto".into(),
            done: false,
            day: "2026-09-14".into(),
            created_at: 1,
            updated_at: now_ms(),
        })
    })
    .unwrap();
}

fn com_nota(st: &AppState, id: &str) {
    st.mutate(|d| {
        d.notes.push(Note {
            id: id.into(),
            title: "wifi".into(),
            body: "senha do roteador".into(),
            tags: vec![],
            created_at: 1,
            updated_at: now_ms(),
        })
    })
    .unwrap();
}

fn exportado(st: &AppState) -> PathBuf {
    let destino = st.dir.join("fora").join("meu backup.canto");
    backup::exportar(&st.dir, &destino).unwrap();
    destino
}

fn arquivos(pasta: &Path) -> Vec<String> {
    let mut v: Vec<String> = std::fs::read_dir(pasta)
        .map(|r| r.filter_map(|e| e.ok()).map(|e| e.file_name().to_string_lossy().into()).collect())
        .unwrap_or_default();
    v.sort();
    v
}

#[test]
fn backup_leva_as_tarefas_para_outra_maquina_com_a_mesma_senha() {
    let a = maquina("origem", "1234");
    com_tarefa(&a, "t1");
    let b = maquina("destino", "1234");
    com_nota(&b, "n1");

    let resumo = backup::importar(&b, &exportado(&a)).unwrap();

    assert_eq!(resumo, ResumoImport { tarefas: 1, notas: 1 }, "merge perdeu item de um dos lados");
    b.lock();
    b.unlock("1234").unwrap();
    assert_eq!(b.read(|d| d.tasks[0].id.clone()).unwrap(), "t1", "import nao foi gravado em disco");
}

#[test]
fn exportado_nao_vaza_conteudo_em_claro() {
    let a = maquina("claro", "1234");
    com_nota(&a, "n1");
    let texto = std::fs::read_to_string(exportado(&a)).unwrap();
    assert!(!texto.contains("senha do roteador"));
}

#[test]
fn reimportar_o_mesmo_backup_nao_muda_nada() {
    let a = maquina("idem-a", "1234");
    com_tarefa(&a, "t1");
    let b = maquina("idem-b", "1234");
    let arq = exportado(&a);
    backup::importar(&b, &arq).unwrap();
    let antes = b.read(|d| d.clone()).unwrap();
    backup::importar(&b, &arq).unwrap();
    assert_eq!(b.read(|d| d.clone()).unwrap(), antes);
}

#[test]
fn senha_diferente_recusa_sem_tocar_no_cofre_local() {
    let a = maquina("senha-a", "1234");
    com_tarefa(&a, "t1");
    let b = maquina("senha-b", "outra");
    com_nota(&b, "n1");
    let antes = b.read(|d| d.clone()).unwrap();

    let err = backup::importar(&b, &exportado(&a)).unwrap_err();

    assert!(err.to_string().contains("outra senha mestra"), "mensagem inutil: {err}");
    assert_eq!(b.read(|d| d.clone()).unwrap(), antes);
    assert!(arquivos(&backup::backups_dir(&b.dir)).is_empty(), "guardou copia de import que falhou");
}

#[test]
fn arquivo_qualquer_e_recusado_como_formato_invalido() {
    let b = maquina("lixo", "1234");
    let arq = b.dir.join("foto.canto");
    std::fs::write(&arq, b"\x89PNG nao sou cofre").unwrap();
    assert!(matches!(backup::importar(&b, &arq), Err(AppError::Format(_))));
}

#[test]
fn arquivo_grande_demais_nem_e_lido() {
    let b = maquina("grande", "1234");
    let arq = b.dir.join("enorme.canto");
    std::fs::File::create(&arq).unwrap().set_len(64 * 1024 * 1024).unwrap();
    let err = backup::importar(&b, &arq).unwrap_err();
    assert!(err.to_string().contains("grande demais"), "{err}");
}

#[test]
fn importar_com_cofre_trancado_falha() {
    let a = maquina("tranca-a", "1234");
    let b = maquina("tranca-b", "1234");
    let arq = exportado(&a);
    b.lock();
    assert!(matches!(backup::importar(&b, &arq), Err(AppError::Locked)));
}

#[test]
fn importar_guarda_o_estado_anterior_para_desfazer() {
    let a = maquina("desfaz-a", "1234");
    let b = maquina("desfaz-b", "1234");
    backup::importar(&b, &exportado(&a)).unwrap();
    let copias = arquivos(&backup::backups_dir(&b.dir));
    assert_eq!(copias.len(), 1);
    assert!(copias[0].ends_with("-import.canto"), "{copias:?}");
}

#[test]
fn backup_diario_grava_uma_vez_por_dia() {
    let st = maquina("diario", "1234");
    assert!(backup::diario(&st.dir, "2026-09-14").unwrap());
    assert!(!backup::diario(&st.dir, "2026-09-14").unwrap(), "duplicou a copia do dia");
    assert!(backup::diario(&st.dir, "2026-09-15").unwrap());
}

#[test]
fn backup_diario_sem_cofre_nao_faz_nada() {
    let dir = std::env::temp_dir().join(format!("canto-bkp-vazio-{}", now_ms()));
    assert!(!backup::diario(&dir, "2026-09-14").unwrap());
    assert!(!backup::backups_dir(&dir).exists());
}

#[test]
fn poda_descarta_as_copias_mais_antigas() {
    let st = maquina("poda", "1234");
    for dia in 1..=MANTER + 2 {
        backup::diario(&st.dir, &format!("2026-08-{dia:02}")).unwrap();
    }
    let copias = arquivos(&backup::backups_dir(&st.dir));
    assert_eq!(copias.len(), MANTER);
    assert_eq!(copias[0], "2026-08-03.canto", "apagou a copia errada");
}
