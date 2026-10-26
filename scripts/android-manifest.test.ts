import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

const androidMain = new URL("../src-tauri/gen/android/app/src/main/", import.meta.url);

test("Android auto-backup is off so the vault and sealed tokens never leave the device", () => {
  const manifest = readFileSync(new URL("AndroidManifest.xml", androidMain), "utf8");
  expect(manifest).toContain('android:allowBackup="false"');
  expect(manifest).toContain('android:fullBackupContent="false"');
  expect(manifest).toContain('android:dataExtractionRules="@xml/data_extraction_rules"');
});

test("data extraction rules exclude local app data from cloud backup", () => {
  const path = new URL("res/xml/data_extraction_rules.xml", androidMain);
  expect(existsSync(path)).toBe(true);
  const rules = readFileSync(path, "utf8");
  const cloud = rules.match(/<cloud-backup>([\s\S]*?)<\/cloud-backup>/)?.[1] ?? "";
  for (const domain of ["root", "file", "database", "sharedpref"]) {
    expect(cloud).toContain(`<exclude domain="${domain}"`);
  }
});
