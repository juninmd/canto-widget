import { expect, test } from "bun:test";
import type { Contact } from "./api";
import { ageToday, birthdaysToday, isBirthday, whatsappLink, whatsappNumber } from "./contactExtras";

const c = (over: Partial<Contact>): Contact => ({
  id: "1", name: "Ana", emails: [], phones: [], org: "", title: "", starred: false, link: "",
  nickname: "", department: "", birthday: null, addresses: [], urls: [], relations: [], note: "", ...over,
});

test("a birthday is today by day and month, and 29 February falls on the 28th in common years", () => {
  const today = new Date(2026, 9, 23);
  expect(isBirthday(c({ birthday: { day: 23, month: 10, year: null } }), today)).toBe(true);
  expect(isBirthday(c({ birthday: { day: 23, month: 11, year: null } }), today)).toBe(false);
  expect(isBirthday(c({}), today)).toBe(false);
  const leapling = c({ birthday: { day: 29, month: 2, year: 2000 } });
  expect(isBirthday(leapling, new Date(2026, 1, 28))).toBe(true);
  expect(isBirthday(leapling, new Date(2028, 1, 28))).toBe(false);
  expect(isBirthday(leapling, new Date(2028, 1, 29))).toBe(true);
});

test("birthdays come by name and the age only when the year is known", () => {
  const today = new Date(2026, 9, 23);
  const list = [c({ id: "z", name: "Zé", birthday: { day: 23, month: 10, year: 1990 } }), c({ id: "a", name: "Ana", birthday: { day: 23, month: 10, year: null } }), c({ id: "b", name: "Bia" })];
  expect(birthdaysToday(list, today).map((x) => x.id)).toEqual(["a", "z"]);
  expect(ageToday(list[0], today)).toBe(36);
  expect(ageToday(list[1], today)).toBeNull();
});

test("WhatsApp numbers get the country code; a short local number gets no link", () => {
  expect(whatsappNumber("+55 (11) 90000-1234")).toBe("5511900001234");
  expect(whatsappNumber("+1 415 555 0100")).toBe("14155550100");
  expect(whatsappNumber("0044 20 7946 0958")).toBe("442079460958");
  expect(whatsappNumber("(11) 90000-1234")).toBe("5511900001234");
  expect(whatsappNumber("011 90000-1234")).toBe("5511900001234");
  expect(whatsappNumber("11 3333-4444")).toBe("551133334444");
  expect(whatsappNumber("5511900001234")).toBe("5511900001234");
  expect(whatsappNumber("555-0100")).toBeNull();
  expect(whatsappNumber("+12")).toBeNull();
  expect(whatsappLink("(11) 90000-1234", "Oi & tchau")).toBe("https://wa.me/5511900001234?text=Oi%20%26%20tchau");
  expect(whatsappLink("555-0100")).toBeNull();
});
