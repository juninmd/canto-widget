import { describe, expect, test } from "bun:test";
import type { AgendaItem } from "../../lib/api";
import { senderProfile } from "../alerts/alerts";

const ev = (over: Partial<AgendaItem>): AgendaItem =>
  ({ id: "mention:1", title: "", start: "", end: "", all_day: false, location: "", meet: "", link: "", ...over }) as AgendaItem;

describe("senderProfile", () => {
  test("GitHub login points at github.com", () => {
    expect(senderProfile(ev({ sender: { name: "", login: "bruno", avatar: "" } }))).toBe("https://github.com/bruno");
  });
  test("GitLab uses the instance of the alert's link", () => {
    const e = ev({ tag: "gitlab", link: "https://git.acme.io/a/b/-/merge_requests/3", sender: { name: "", login: "ana", avatar: "" } });
    expect(senderProfile(e)).toBe("https://git.acme.io/ana");
  });
  test("no sender or bad link gives nothing", () => {
    expect(senderProfile(ev({}))).toBe("");
    expect(senderProfile(ev({ tag: "gitlab", link: "x", sender: { name: "", login: "ana", avatar: "" } }))).toBe("");
  });
});
