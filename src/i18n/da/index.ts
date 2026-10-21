import type { en } from "../en";
import messages1 from "./messages1.json" with { type: "json" };
import messages2 from "./messages2.json" with { type: "json" };
import messages3 from "./messages3.json" with { type: "json" };
import messages4 from "./messages4.json" with { type: "json" };
import messages5 from "./messages5.json" with { type: "json" };
import messages6 from "./messages6.json" with { type: "json" };
import messages7 from "./messages7.json" with { type: "json" };
import messages8 from "./messages8.json" with { type: "json" };
import messages9 from "./messages9.json" with { type: "json" };

export const messages: Record<keyof typeof en, string> = { ...messages1, ...messages2, ...messages3, ...messages4, ...messages5, ...messages6, ...messages7, ...messages8, ...messages9 };
