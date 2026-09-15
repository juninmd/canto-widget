import { useEffect, useRef } from "react";
import { api } from "./api";
import { chaveLembrete, comoEvento, lembretesDevidos } from "./lembretes";

const VIGIA_MS = 30_000;

/** Mora no App, como a agenda: o lembrete dispara em qualquer aba ou com o widget escondido. */
export function useLembretes(ativo: boolean, dia: string, agora: () => Date = () => new Date()) {
  const avisados = useRef(new Set<string>());
  const relogio = useRef(agora);
  relogio.current = agora;

  useEffect(() => {
    if (!ativo) {
      avisados.current.clear();
      return;
    }
    const conferir = async () => {
      const tarefas = (await api.tasksLembretes(dia).catch(() => null)) ?? [];
      for (const t of lembretesDevidos(tarefas, avisados.current, relogio.current())) {
        avisados.current.add(chaveLembrete(t));
        void api.alertaAbrir(comoEvento(t)).catch(() => {});
      }
    };
    void conferir();
    const id = setInterval(() => void conferir(), VIGIA_MS);
    return () => clearInterval(id);
  }, [ativo, dia]);
}
