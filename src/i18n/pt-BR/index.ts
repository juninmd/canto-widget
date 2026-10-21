import { app } from "./app";
import { agents } from "./agents";
import { content } from "./content";
import { focus } from "./focus";
import { health } from "./health";
import { integrations } from "./integrations";
import { models } from "./models";
import { reads } from "./reads";
import { protos } from "./protos";
import { steam } from "./steam";
import { tasks } from "./tasks";
import { uiForgeStatus } from "./uiForgeStatus";
import { weather } from "./weather";

/** One file per area so features can be translated (and reviewed) independently. */
export const ptBR = { ...app, ...tasks, ...focus, ...content, ...integrations, ...models, ...health, ...steam, ...agents, ...protos, ...weather, ...reads, ...uiForgeStatus } as const;
