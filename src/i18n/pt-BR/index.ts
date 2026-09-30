import { app } from "./app";
import { content } from "./content";
import { focus } from "./focus";
import { integrations } from "./integrations";
import { models } from "./models";
import { tasks } from "./tasks";

/** One file per area so features can be translated (and reviewed) independently. */
export const ptBR = { ...app, ...tasks, ...focus, ...content, ...integrations, ...models } as const;
