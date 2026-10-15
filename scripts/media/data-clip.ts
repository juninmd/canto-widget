import type { ClipItem } from "../../src/lib/api";
import { NOW } from "./stage";

const clip = (id: string, preview: string, minutes: number, extra: Partial<ClipItem> = {}): ClipItem => ({
  id,
  preview,
  chars: preview.length,
  kept: preview.length,
  truncated: false,
  copied_at: NOW.getTime() - minutes * 60_000,
  pinned: false,
  ...extra,
});

export const CLIPS: ClipItem[] = [
  clip("c1", "https://example.com/docs/guia-de-estilo", 3, { pinned: true }),
  clip("c2", "#4ade80", 9),
  clip("c3", '{"status":"ok","itens":3,"proximo":null}', 22),
  clip("c4", "SELECT id, titulo\nFROM tarefas\nWHERE feita = false\nORDER BY criada_em;", 40),
  clip("c5", "2026-10-09 09:58:12 INFO worker-0 job 4200 concluído em 83 ms\n2026-10-09 09:58:13 INFO worker-1 job 4201 concluído em 87 ms\n2026-10-09 09:58:14 WARN worker-2 job 4202 lento: 912 ms", 58, { chars: 2_300_000, kept: 32_000, truncated: true }),
  clip("c6", "ana@example.com", 95),
  clip("c7", "+55 11 98888-7777", 130),
];
