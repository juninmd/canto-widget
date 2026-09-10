import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Os testes de hook precisam de DOM; o React 19 exige o sinal de ambiente de act.
GlobalRegistrator.register();
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
