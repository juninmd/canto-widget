import { app } from "./app";
import { content } from "./content";
import { integrations } from "./integrations";
import { models } from "./models";
import { tasks } from "./tasks";

/** One file per area so features can be translated (and reviewed) independently. */
export const ptBR = { ...app, ...tasks, ...content, ...integrations, ...models } as const;
