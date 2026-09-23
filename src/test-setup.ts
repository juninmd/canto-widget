import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Hook tests need a DOM; reduced motion by default keeps removals synchronous (the animated path has its own test).
GlobalRegistrator.register({ settings: { device: { prefersReducedMotion: "reduce" } } });
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// Assertions are on the pt-BR text; happy-dom reports an en-US system language.
localStorage.setItem("canto.language", "pt-BR");
