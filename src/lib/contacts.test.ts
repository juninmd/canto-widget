import { expect, test } from "bun:test";
import type { Contact } from "./api";
import { filterContacts, groupByLetter, letterOf, matchesContact, subtitle } from "./contacts";

const c = (over: Partial<Contact>): Contact => ({
  id: "1", name: "Ana", emails: [], phones: [], org: "", title: "", starred: false, link: "", ...over,
});

test("search ignores accents and case and finds company, e-mail and a phone however it is spaced", () => {
  const marina = c({ name: "Marina Lopes", org: "Vértice", emails: ["marina@exemplo.com"], phones: ["+55 (11) 90000-1234"] });
  expect(matchesContact(marina, "VERTICE")).toBe(true);
  expect(matchesContact(marina, "exemplo.com")).toBe(true);
  expect(matchesContact(marina, "900001234")).toBe(true);
  expect(matchesContact(marina, "12")).toBe(false);
  expect(matchesContact(marina, "joao")).toBe(false);
  expect(matchesContact(marina, "  ")).toBe(true);
});

test("filters combine with the search", () => {
  const list = [c({ id: "1", name: "Ana", starred: true, emails: ["a@x.com"] }), c({ id: "2", name: "Bia", phones: ["555-0100"] })];
  expect(filterContacts(list, "starred", "").map((x) => x.id)).toEqual(["1"]);
  expect(filterContacts(list, "email", "").map((x) => x.id)).toEqual(["1"]);
  expect(filterContacts(list, "phone", "").map((x) => x.id)).toEqual(["2"]);
  expect(filterContacts(list, "all", "bia").map((x) => x.id)).toEqual(["2"]);
  expect(filterContacts(list, "starred", "bia")).toEqual([]);
});

test("sections run A to Z, accents join their letter and symbols go last", () => {
  const groups = groupByLetter([c({ id: "1", name: "Zé" }), c({ id: "2", name: "Álvaro" }), c({ id: "3", name: "+1 Hotel" }), c({ id: "4", name: "ana" })]);
  expect(groups.map((g) => g.letter)).toEqual(["A", "Z", "#"]);
  expect(groups[0].items.map((x) => x.name)).toEqual(["Álvaro", "ana"]);
  expect(letterOf("érica")).toBe("E");
  expect(letterOf("")).toBe("#");
});

test("the subtitle prefers the job, then the first e-mail or phone", () => {
  expect(subtitle(c({ title: "Diretora", org: "Vértice" }))).toBe("Diretora · Vértice");
  expect(subtitle(c({ org: "Vértice" }))).toBe("Vértice");
  expect(subtitle(c({ emails: ["a@x.com"], phones: ["1"] }))).toBe("a@x.com");
  expect(subtitle(c({ phones: ["555-0100"] }))).toBe("555-0100");
});
