import { describe, expect, test } from "bun:test";
import { parseQuickTask } from "./quickAdd";

describe("parseQuickTask", () => {
  test("'às' followed by an hour becomes the reminder time", () => {
    expect(parseQuickTask("Daily às 9h30")).toEqual({ title: "Daily", time: "09:30" });
    expect(parseQuickTask("às 14h ligar para o banco")).toEqual({ title: "ligar para o banco", time: "14:00" });
    expect(parseQuickTask("Revisão as 16:45")).toEqual({ title: "Revisão", time: "16:45" });
  });

  test("a bare HH:MM anywhere in the title is a time", () => {
    expect(parseQuickTask("Deploy 18:00 em produção")).toEqual({ title: "Deploy em produção", time: "18:00" });
  });

  test("durations and numbers are not mistaken for a reminder", () => {
    expect(parseQuickTask("Estudar 2h de Rust")).toEqual({ title: "Estudar 2h de Rust", time: null });
    expect(parseQuickTask("Revisar PR 14")).toEqual({ title: "Revisar PR 14", time: null });
    expect(parseQuickTask("Placar 3:1 no jogo")).toEqual({ title: "Placar 3:1 no jogo", time: null });
  });

  test("the English UI's 'at' and am/pm work like 'às'", () => {
    expect(parseQuickTask("Daily at 9:30")).toEqual({ title: "Daily", time: "09:30" });
    expect(parseQuickTask("Daily at 9:30am")).toEqual({ title: "Daily", time: "09:30" });
    expect(parseQuickTask("Call the bank at 2 pm")).toEqual({ title: "Call the bank", time: "14:00" });
    expect(parseQuickTask("Deploy 11:15 p.m.")).toEqual({ title: "Deploy", time: "23:15" });
  });
  test("12 am is midnight and 12 pm is noon, never the other way round", () => {
    expect(parseQuickTask("Backup 12:00 am")).toEqual({ title: "Backup", time: "00:00" });
    expect(parseQuickTask("Lunch at 12pm")).toEqual({ title: "Lunch", time: "12:00" });
  });
  test("am/pm only applies to a 12-hour clock, and words starting with 'am' are not a suffix", () => {
    expect(parseQuickTask("Plantão 13 pm")).toEqual({ title: "Plantão 13 pm", time: null });
    expect(parseQuickTask("Jantar com 5 amigos")).toEqual({ title: "Jantar com 5 amigos", time: null });
  });
  test("impossible times and a title made only of the time are left alone", () => {
    expect(parseQuickTask("Plantão às 25h")).toEqual({ title: "Plantão às 25h", time: null });
    expect(parseQuickTask("Algo 10:75")).toEqual({ title: "Algo 10:75", time: null });
    expect(parseQuickTask("às 9h")).toEqual({ title: "às 9h", time: null });
  });
});
