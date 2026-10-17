import { app } from "./app";
import { agents } from "./agents";
import { content } from "./content";
import { focus } from "./focus";
import { health } from "./health";
import { integrations } from "./integrations";
import { models } from "./models";
import { protos } from "./protos";
import { steam } from "./steam";
import { tasks } from "./tasks";

export const en = { ...app, ...tasks, ...focus, ...content, ...integrations, ...models, ...health, ...steam, ...agents, ...protos };
