// Tarefas e Notas: filtros em chips, menu "⋯", atalhos de digitação e visão em grade.
// Os valores de "uiTasksNotes.chip.*" que começam com "!" precisam continuar entendidos por src/lib/quickAdd.ts em
// qualquer idioma (src/lib/quickAddTokens.test.ts confere todos os catálogos).
export const uiTasksNotes = {
  "uiTasksNotes.progress": "{done} de {total}",
  "uiTasksNotes.prio.all": "todas",
  "uiTasksNotes.menu.more": "ações da lista",
  "uiTasksNotes.chip.group": "atalhos de digitação",
  "uiTasksNotes.chip.label": "atalhos",
  "uiTasksNotes.chip.time": "hora",
  "uiTasksNotes.chip.timeHint": "insere um horário no fim do texto; troque o 9:00 pelo seu",
  "uiTasksNotes.chip.high": "!alta",
  "uiTasksNotes.chip.medium": "!média",
  "uiTasksNotes.chip.low": "!baixa",
  "uiTasksNotes.chip.priorityHint": "marca a tarefa com prioridade {label}",
  "uiTasksNotes.tags.label": "filtrar por tag",
  "uiTasksNotes.tags.all": "todas",
  "uiTasksNotes.view.label": "visualização dos cards",
  "uiTasksNotes.view.list": "lista",
  "uiTasksNotes.view.grid": "grade",
  "uiTasksNotes.section.pinned": "fixadas",
  "uiTasksNotes.section.recent": "recentes",
  "uiTasksNotes.emptyHint": "tente outra tag ou limpe a busca",
  "uiTasksNotes.clearSearch": "limpar busca",
} as const;
