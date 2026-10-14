"""Generate static catalogs and translated READMEs from public English sources."""
import concurrent.futures
import importlib.util
import json
import re
import subprocess
from pathlib import Path

spec = importlib.util.spec_from_file_location("translate_public", Path(__file__).with_name("translate-public.py"))
translation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(translation)
ROOT = translation.ROOT
LANGUAGES = re.findall(r'\["([^"]+)", "([^"]+)"\]', (ROOT / "src/i18n/languages.ts").read_text(encoding="utf-8"))
TARGETS = [code for code, _ in LANGUAGES if code not in ("pt-BR", "en")]
SOURCE = json.loads(subprocess.check_output(
    ["bun", "-e", 'import {en} from "./src/i18n/en"; console.log(JSON.stringify(en))'], cwd=ROOT,
).decode("utf-8"))
SOURCE["settings.language.translationNote"] = "New languages use automatic translations. Some integration alerts and backend errors may still appear in English or Portuguese."
SOURCE["settings.language.search"] = "Find a language"
NATIVE = sorted(set(re.findall(
    r'(?:lang::)?tr\(\s*"(?:[^"\\]|\\.)*"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)',
    "\n".join(path.read_text(encoding="utf-8") for path in (ROOT / "src-tauri/src").glob("*.rs")),
)))
README = (ROOT / "README.md").read_text(encoding="utf-8")
README = re.sub(r"<sub>\*\*English\*\*.*?</sub>", "", README)
README = "\n".join(line for line in README.splitlines() if not line.startswith("**[Features]"))
README_LINES = README.splitlines()
READ_ME_KEYS = []
in_code = False
for i, line in enumerate(README_LINES):
    if line.startswith("```"):
        in_code = not in_code
        continue
    if not in_code and line.strip() and not re.fullmatch(r"\s*(?:<[^>]+>|\|[-:| ]+\|)\s*", line):
        READ_ME_KEYS.append(i)


def generate(code):
    target = {"he": "iw", "nb": "no", "zh": "zh-CN"}.get(code, code)
    directory = ROOT / "src/i18n" / code
    cached = ROOT / ".translations-cache.tmp" / f"{code}.json"
    if cached.exists():
        data = json.loads(cached.read_text(encoding="utf-8"))
    else:
        unique = list(dict.fromkeys([*SOURCE.values(), *NATIVE, *(README_LINES[i] for i in READ_ME_KEYS)]))
        output = translation.translate(unique, target)
        data = dict(zip(unique, output, strict=True))
        translation.write_json(cached, data)
    required = list(dict.fromkeys([*SOURCE.values(), *NATIVE, *(README_LINES[i] for i in READ_ME_KEYS)]))
    brands = re.compile(r"\b(?:Rust|React|Tauri|Bun|Electron|TypeScript|Argon2id|AES-256-GCM)\b")
    repair = [value for value in required if value not in data or
              any(brand not in data[value] for brand in brands.findall(value))]
    if repair:
        data.update(zip(repair, translation.translate(repair, target), strict=True))
        translation.write_json(cached, data)
    catalog = {key: data[value] for key, value in SOURCE.items()}
    catalog["app.name"] = SOURCE["app.name"]
    placeholders = lambda text: sorted(re.findall(r"\{\w+\}", text))
    for key, value in catalog.items():
        if not value.strip() or placeholders(value) != placeholders(SOURCE[key]):
            raise ValueError(f"{code}:{key}: invalid translation")
    keys = list(catalog)
    parts = []
    for i in range(0, len(keys), 175):
        part = f"messages{len(parts) + 1}"
        translation.write_json(directory / f"{part}.json", {key: catalog[key] for key in keys[i:i + 175]})
        parts.append(part)
    directory.joinpath("index.ts").write_text(
        'import type { en } from "../en";\n' +
        "".join(f'import {part} from "./{part}.json" with {{ type: "json" }};\n' for part in parts) +
        "\nexport const messages: Record<keyof typeof en, string> = { " +
        ", ".join(f"...{part}" for part in parts) + " };\n", encoding="utf-8",
    )
    native = {key: data[key] for key in NATIVE}
    native["Quit"] = json.loads((ROOT / "scripts/native-labels.json").read_text(encoding="utf-8"))[code]
    translation.write_json(ROOT / "src-tauri/src/locales" / f"{code}.json", native)
    translated_lines = README_LINES.copy()
    for i in READ_ME_KEYS:
        original = README_LINES[i]
        translated = data[original]
        targets = re.findall(r"\]\(([^)]+)\)", original)
        translated_targets = re.findall(r"\]\(([^)]+)\)", translated)
        if len(targets) != len(translated_targets):
            raise ValueError(f"{code}: README link structure changed: {original}")
        iterator = iter(targets)
        translated_lines[i] = re.sub(r"\]\([^)]+\)", lambda _: f"]({next(iterator)})", translated)
    text = "\n".join(translated_lines) + "\n"
    path = ROOT / f"README.{code}.md"
    if code not in ["es", "fr", "it", "ja", "zh", "de", "ru", "tr", "hi"]:
        path.write_text(text, encoding="utf-8")
    print(f"{code}: {len(catalog)} UI messages, {len(NATIVE)} native labels, README ready", flush=True)


if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(generate, code): code for code in TARGETS}
        for future in concurrent.futures.as_completed(futures):
            try:
                future.result()
            except Exception as error:
                print(f"FAILED {futures[future]}: {error}", flush=True)
                raise
