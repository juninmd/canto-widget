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
import { uiClipAgenda } from "./uiClipAgenda";
import { uiTasksNotes } from "./uiTasksNotes";
import { google } from "./google";
import { weather } from "./weather";
import { map } from "./map";
import { uiModelsActivity } from "./uiModelsActivity";

/** One file per area so features can be translated (and reviewed) independently. */
export const ptBR = { ...app, ...tasks, ...focus, ...content, ...integrations, ...models, ...health, ...steam, ...agents, ...protos, ...weather, ...map, ...reads, ...uiModelsActivity, ...uiForgeStatus, ...uiClipAgenda, ...uiTasksNotes, ...google } as const;
