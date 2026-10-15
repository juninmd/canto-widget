# Language catalogs

Canto has 42 interface languages and a README for each. `src/i18n/languages.ts` owns language codes and native
names. `language.ts` resolves the stored choice or the primary system language; unsupported primary languages
fall back to English. Portuguese variants use Brazilian Portuguese, Chinese variants use Simplified Chinese,
and `iw`/`no` map to `he`/`nb`. `localeFor` selects the date and number locale. Arabic, Hebrew and Persian set
the document direction to RTL.

Portuguese and English are the original catalogs. The 40 additional catalogs and 31 new README translations
are machine translations, without native-speaker review. Technical identifiers, interpolation parameters,
command examples, code blocks and link destinations are preserved. Some integration alert descriptions use
English; Rust command errors continue to use Portuguese. The task parser still accepts its existing Portuguese
and English keywords, such as `Daily at 9:30 !high`.

Each catalog has the same keys and interpolation parameters. JSON files are split into groups of at most 175
messages. The original Portuguese and English catalogs are part of the bootstrap bundle; `loaders.ts` imports
only the chosen additional catalog before modules create translated labels. `catalogs.ts`
is the complete inventory used by tests and capture tools. New keys must be added to every catalog.

Rust's `lang_catalogs.rs` embeds translations for the tray and notification headings. The command boundary
validates the language before updating the process-wide selection. Existing pure integration alert builders
retain their Portuguese/English parameters, with English used for the additional languages.

To regenerate **public repository text only**, install Python 3 and use the repository's Bun installation:

```bash
python scripts/expand-languages.py
bun scripts/sync-readme-navigation.ts
bun test src/i18n scripts/readme-languages.test.ts
bun run e2e -- --workers=4
```

The generator sends public English catalog messages and README prose to Google's translation endpoint.
It requires internet access and may be rate-limited. It caches results in `.translations-cache.tmp/`, an ignored
directory. Runtime translation is entirely local and requires no translation service, account or credentials.
Existing README translations are preserved apart from the language navigation. `scripts/native-labels.json`
holds reviewed application-exit labels so an ambiguous “Quit” does not become “stop smoking.”

Regenerate the two UI captures with fictitious data:

```bash
bunx playwright test --config scripts/languages-capture.config.ts
```

If port 1420 belongs to another application, choose a free port for the Canto tests and captures. In PowerShell:

```powershell
$env:CANTO_E2E_PORT = "1428"
bun run e2e -- --workers=4
```

Tests and captures start their own servers and never reuse an existing one. Captures default to port 1431;
`CANTO_E2E_PORT` overrides that port as well.

Catalog parity tests, native-language validation tests, README structure tests and Chromium flows cover the
integration. They verify functionality and structure, rather than native linguistic accuracy or OS notification
delivery on every platform.
