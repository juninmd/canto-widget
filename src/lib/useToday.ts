import { useEffect, useRef, useState } from "react";
import { todayLocal } from "./api";

const TICK_MS = 30_000;

/**
 * O widget fica aberto a noite inteira. Sem este relógio, `todayLocal()` é
 * calculado uma vez na montagem e a aba de tarefas continua na véspera até
 * alguém mexer em alguma coisa.
 */
export function useToday(agora: () => Date = () => new Date()): string {
  const [dia, setDia] = useState(() => todayLocal(agora()));
  const relogio = useRef(agora);
  relogio.current = agora;
  useEffect(() => {
    const t = setInterval(() => {
      setDia((atual) => {
        const hoje = todayLocal(relogio.current());
        return hoje === atual ? atual : hoje;
      });
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);
  return dia;
}
