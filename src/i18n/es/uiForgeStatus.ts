import type { uiForgeStatus as source } from "../pt-BR/uiForgeStatus";

export const uiForgeStatus: Record<keyof typeof source, string> = {
  "uiForge.more": "más acciones",
  "uiForge.sortButton": "ordenar por: {sort}",
  "uiForge.sortMenu": "ordenación",
  "uiForge.tileTitle": "mostrar solo {label}; pulsa de nuevo para ver todo",
  "uiForge.focusEmpty": "nada en este recorte con el filtro actual",
  "uiStatus.filter.label": "filtrar servicios por estado",
  "uiStatus.filter.all": "Todos",
  "uiStatus.filter.problems": "Con problemas",
  "uiStatus.filter.ok": "Operativos",
  "uiStatus.filter.maintenance": "Mantenimiento",
  "uiStatus.filter.empty": "ningún servicio en este filtro",
  "uiStatus.none": "no se pudo leer ninguna página de estado ahora; revisa la conexión e inténtalo de nuevo",
  "uiStatus.bar": "{down} caídos, {warn} inestables, {maint} en mantenimiento, {ok} operativos",
  "uiStatus.add": "+ dirección",
  "uiStatus.emptyAdd": "añadir endpoint",
  "uiStatus.pills.label": "resumen de los endpoints",
  "uiStatus.pill.down": "{n} caídos",
  "uiStatus.pill.slow": "{n} lentos",
  "uiStatus.pill.cert": "{n} por vencer",
  "uiStatus.count": "{n} endpoints",
};
