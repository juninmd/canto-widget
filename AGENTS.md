bun install --frozen-lockfile
bun run lint                     # tsc --noEmit
bun test                         # UI tests
bun run e2e                      # Playwright smoke tests (e2e/*.e2e.ts): real UI in Chromium, Tauri IPC mocked
bun run build                    # tsc + vite build -> dist/ (needed before cargo: generate_context! embeds it)
cd src-tauri && cargo fmt --check                         # rustfmt.toml: max_width 120
cd src-tauri && cargo clippy --all-targets --locked -- -D warnings
cd src-tauri && cargo test --locked
cd src-tauri && cargo test --release --test scale -- --ignored --nocapture   # load harness, on demand
bun run tauri dev                # app with hot reload
bun run tauri build              # installer for the current OS