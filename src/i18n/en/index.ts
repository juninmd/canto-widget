import { app } from "./app";
import { content } from "./content";
import { integrations } from "./integrations";
import { tasks } from "./tasks";

export const en = { ...app, ...tasks, ...content, ...integrations };
