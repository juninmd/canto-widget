import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import ProtoFrame from "./ProtoFrame";

afterEach(cleanup);

/** No tab is a prototype today, but the frame stays for the next idea: it carries the badge and the honest note. */
test("a prototype frame shows the badge and what the idea would still need", () => {
  render(
    <ProtoFrame needs="só o cofre">
      <p>maquete</p>
    </ProtoFrame>,
  );
  expect(screen.getByText("protótipo")).toBeTruthy();
  expect(screen.getByText("o que falta: só o cofre")).toBeTruthy();
  expect(screen.getByText("maquete")).toBeTruthy();
});
