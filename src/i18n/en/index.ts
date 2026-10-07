import { app } from "./app";
import { content } from "./content";
import { focus } from "./focus";
import { health } from "./health";
import { integrations } from "./integrations";
import { models } from "./models";
import { tasks } from "./tasks";

export const en = { ...app, ...tasks, ...focus, ...content, ...integrations, ...models, ...health };
