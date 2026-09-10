import { useCallback, useEffect, useRef, useState } from "react";
import { api, errText, type AgendaItem } from "./api";
import { janelaDoDia, paraAlertar } from "./agenda";

const RECARGA_MS = 5 * 60_000;
const VIGIA_MS = 30_000;

export type Agenda = {
  itens: AgendaItem[];
  carregando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
};

/**
 * Mora no App, nunca na aba: o aviso de reunião precisa disparar com o usuário
 * em tarefas, em notas ou com o widget escondido na bandeja. Enquanto isto
 * vivia dentro do AgendaTab, sair da aba desligava o relógio e zerava a lista
 * de já avisados — nenhum pop-up, ou o mesmo pop-up duas vezes.
 */
export function useAgenda(ativo: boolean): Agenda {
  const [itens, setItens] = useState<AgendaItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const alertados = useRef(new Set<string>());

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { timeMin, timeMax } = janelaDoDia();
      setItens(await api.agendaToday(timeMin, timeMax));
      setErro("");
    } catch (e) {
      // Fica na aba: sem conta do Google, o polling de 5 em 5 min não pode
      // tomar a faixa de erro global do widget.
      setErro(errText(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!ativo) {
      setItens([]);
      setErro("");
      alertados.current.clear();
      return;
    }
    void recarregar();
    const t = setInterval(() => void recarregar(), RECARGA_MS);
    return () => clearInterval(t);
  }, [ativo, recarregar]);

  useEffect(() => {
    if (!ativo) return;
    const t = setInterval(() => {
      for (const evento of paraAlertar(itens, alertados.current)) {
        alertados.current.add(evento.id);
        void api.alertaAbrir(evento).catch(() => {});
      }
    }, VIGIA_MS);
    return () => clearInterval(t);
  }, [ativo, itens]);

  return { itens, carregando, erro, recarregar };
}
