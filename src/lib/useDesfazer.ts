import { useCallback } from "react";
import { api, errText } from "./api";
import { useToast } from "./toast";

/**
 * Exclusão sem confirmação, mas reversível: o aviso oferece desfazer (Nielsen: controle
 * e liberdade do usuário). `chave` nula significa que nada foi removido.
 */
export function useDesfazer(onError: (m: string) => void, recarregar: () => Promise<void>) {
  const avisar = useToast();
  return useCallback(
    (chave: string | null, texto: string) => {
      if (!chave) return;
      avisar({
        texto,
        acao: {
          rotulo: "desfazer",
          executar: () =>
            void api
              .lixeiraDesfazer(chave)
              .then((voltou) => (voltou ? recarregar() : onError("não dá mais para desfazer: o cofre foi trancado")))
              .catch((e) => onError(errText(e))),
        },
      });
    },
    [avisar, onError, recarregar],
  );
}
