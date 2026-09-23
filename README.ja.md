<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: 画面の隅に一日をまるごと。タスク、GitHub、会議通知をウィジェットウィンドウで。" width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[機能](#-機能)** · **[スキン](#-5つのスキン)** · **[インストール](#%EF%B8%8F-インストール)** · **[セキュリティ](#-セキュリティ概要)** · **[ドキュメント](#-ドキュメント)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **日本語** · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **リマインダー付きタスク、メモ、クリップボード履歴、会議通知付きの予定表、文字起こし、そしてあなたのGitHub PRを
> 画面の隅に固定された小さなウィンドウに。** `Ctrl+Alt+Space` でポップアップし、不要なときは隠れ、
> アカウントもサーバーも不要で、すべてをあなたのマシン上で暗号化したまま保持します。

## ✨ Canto を選ぶ理由

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="タスク、メモ、クリップボード、予定表、GitHubの各タブ、会議通知、スキンを巡るツアー" width="300"></td>
<td>

会議とPRと細々としたタスクの合間で生きていると、気づけば5つのアプリを開いていませんか。Canto はそれをすべて
一つにまとめます。

🔒 **デフォルトで暗号化。** マスターパスワードによる Argon2id + AES-256-GCM。鍵は常に RAM 上にのみ存在します。
Windows Hello はオプションで利用可能。

🏠 **データはあなたの手元に。** テレメトリなし、サーバーなし、アカウント登録不要。バックアップは暗号化された
単一の `.canto` ファイルです。

⏰ **見逃しません。** 会議の1分前とリマインダー時刻に、ウィジェットがポップアップし、音を鳴らして
通知を送ります。**10分スヌーズ**も可能。

🪶 **軽量。** Electron ではなく Tauri v2（Rust + システムの webview）を採用：インストーラーはわずか 3.5 MB。
[実測データ](docs/benchmark.md#footprint-medido)。

🔄 **常に最新。** アプリ内から更新でき、プロジェクト自身の鍵で署名されたものだけをインストールします。

</td>
</tr>
</table>

## 🧰 機能

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="時刻と繰り返し設定付きの今日のタスク"></td>
<td>

### ✅ リマインダー付きタスク

時刻と繰り返し（毎日、平日、毎週）を設定できる日々のチェックリスト。**`毎日 9:30`** と入力するだけで
リマインダーが設定されます。貼り付けてすぐ使える**1日のサマリー**と、昨日からの**未完了タスクの持ち越し**も。

</td>
</tr>
<tr>
<td>

### 📅 会議が始まる? ちゃんと教えます。

今日の予定は Google カレンダー（読み取り専用）から取得します。開始1分前になると、**Meet に参加**ボタン付きで
ウィジェットが画面に飛び出し、音を鳴らしてシステム通知を送ります。どのタブを開いていても、隠れていても関係ありません。
予定をクリックすると、主催者、議題、参加者、Gemini のメモなどの添付情報を確認できます。

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="主催者、参加者、Gemini のメモを含む予定の詳細"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="タグ付きのメモカードとピン留めされたメモ"></td>
<td>

### 🗒️ カード形式のメモ

`#タグ`付きで検索できるカード、上部へのピン留め、ワンクリックでのタグ絞り込み。数千件のメモにも対応：
一覧はページ分割され、検索はすべてを対象にします。

</td>
</tr>
<tr>
<td>

### 📋 忘れない（漏らさない）クリップボード

検索とピン留めができる暗号化された履歴。リンク、色、コードを自動認識します。巨大なコピー（100MBのログなど）が
発生しても固まりません：先頭部分だけを保持して警告を表示します。Windows では、パスワードマネージャーが
機密扱いにした内容はスキップされます。

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="リンク、大きなログ、コードを含むクリップボード履歴"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="レビュー依頼、アサイン、オープンPRを表示するGitHubタブ"></td>
<td>

### 🐙 GitHub をひと目で

**自分へのレビュー依頼**、自分へのアサイン、自分が開いたPRとIssueを、PR/Issueアイコンと作成者付きで表示。
テキスト、`repo:`、`label:`で絞り込み、PRのみ／Issueのみの表示、更新日・作成日・コメント数での並び替え、
**もっと見る**でのスクロール読み込みが可能。**GitLab.com とセルフホストGitLab**にも対応し、レート制限を
尊重する5分間のキャッシュを使います。読み取り専用の個人トークン、またはブラウザ（デバイスフロー）でサインイン。

</td>
</tr>
<tr>
<td>

### ⚙️ 設定と自動アップデート

マスターパスワードの変更、Windows Hello、`.canto` バックアップ、自動マージ対応の同期フォルダ（Dropbox、
OneDrive、Syncthing など）、システム起動時の自動起動、そして**インストール済みバージョン**と
**最新公開バージョン**を並べて表示し、更新して再起動するボタンを備えた**アップデート**セクション。

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="インストール済みバージョン、最新公開バージョン、更新ボタンを表示する設定画面"></td>
</tr>
</table>

🎙️ **会議**機能もあります：過去2週間分の Gemini のメモと文字起こしに加え、ローカルフォルダにある
`.vtt`、`.srt`、`.txt`、`.md` 形式の文字起こしを整形して検索可能にします。

⌨️ **すべてキーボードで操作可能：** `Alt+1`〜`Alt+7` でタブ切り替え、`N` で新規作成、`/` で検索、`F11` で
全画面表示、`Alt+L` でロック、`?` でショートカット一覧を表示。

## 🎨 5つのスキン

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="デフォルトスキン" width="200"><br><b>デフォルト</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo スキン" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula スキン" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="ライトスキン" width="200"><br><b>ライト</b></td>
</tr>
</table>

そして OS に合わせてライト/ダークを切り替える**システムに従う**。すべて AA コントラストをクリアしています。

<details>
<summary>🖥️ その他の画面：オンボーディング、グローバル検索、GitLab、サブタスク、マークダウン、セキュリティ、同期、表示密度など</summary>

<br>

![全画面表示のGitHubタブ](docs/prints/app/12-tela-cheia.png)

| 初回起動時のようこそ画面 | グローバル検索（`Ctrl+K`） | セルフホストGitLabタブ | 会議通知 |
|---|---|---|---|
| ![主要なショートカットを示すオンボーディング](docs/prints/app/19-onboarding.png) | ![タスク、メモ、クリップボードを横断検索](docs/prints/app/20-busca-global.png) | ![セルフホストGitLabでのレビュー依頼、アサイン、Issue](docs/prints/app/21-gitlab.png) | ![Meet参加とスヌーズ付きの会議通知](docs/prints/app/07-aviso-reuniao.png) |

| サブタスク・優先度・PR付きのタスク | マークダウンのメモ | その他のクリップボード種別 | セキュリティ：自動ロックと解除履歴 |
|---|---|---|---|
| ![タスクのチェックリスト、優先度、PRリンク](docs/prints/app/23-tarefas-detalhes.png) | ![タスクにリンクされたマークダウン表示のメモ](docs/prints/app/24-notas-markdown.png) | ![リンク、色、json、メール、電話番号を認識するクリップボード](docs/prints/app/25-clipboard-tipos.png) | ![設定可能な自動ロックと直近の解除ログ](docs/prints/app/26-ajustes-seguranca.png) |

| 同期フォルダ | コンパクト表示 | ロックされた保管庫 | GitHub連携 |
|---|---|---|---|
| ![Dropboxフォルダを指す設定](docs/prints/app/27-ajustes-sync.png) | ![タスクタブのコンパクトなインターフェース](docs/prints/app/28-densidade-compacta.png) | ![Windows Hello対応のパスワード画面](docs/prints/app/09-cofre-trancado.png) | ![トークンまたはブラウザで連携](docs/prints/app/10-github-conectar.png) |

| タスクのリマインダー | マスターパスワードの変更 |
|---|---|
| ![完了とスヌーズ付きのリマインダー](docs/prints/app/08-lembrete-tarefa.png) | ![パスワード変更フォーム](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>すべてのスクリーンショットは架空のデータを使用しています。</sub>

## ⚖️ 他のツールとの比較

調査したツールの中で、これらの領域を同時に2つ以上カバーするものはありませんでした。出典と詳細は
[docs/benchmark.md](docs/benchmark.md) にあります。

| | タスク＋リマインダー | メモ | クリップボード | 会議 | GitHub | デフォルトのローカル暗号化 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ 同期のみ |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ オプション |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ ネイティブ対応 · ➖ 部分対応（拡張機能またはオプション） · — 非対応 · ? 未公開 · n/a ユーザーデータを保存しない</sub>

このベンチマークから取り入れたもの：**タスクのタイトルに直接時刻を書ける**（Todoist/TickTick）、
**通知のスヌーズ**（TickTick）、**パスワードマネージャーを尊重するクリップボード**（CopyQ/Ditto）。

## ⬇️ インストール

お使いのプラットフォーム向けのインストーラーを **[Releases](https://github.com/juninmd/canto-widget/releases)** からダウンロードしてください：

| システム | ファイル |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe`（推奨）または `.msi` |
| 🍎 macOS | Apple Silicon または Intel 向けの `.dmg` |
| 🐧 Linux | `.AppImage`、`.deb`、`.rpm` |

1. 初回起動時に**マスターパスワード**を作成します。復旧手段はありません：パスワードを失うとデータも失われます。
2. `Ctrl+Alt+Space`（macOS では `Cmd+Shift+Space`）でウィジェットの表示・非表示を切り替えます。
3. これで完了です。新しいバージョンが公開されると Canto が通知し、**設定 → アップデート**からワンクリックで更新できます。

> [!NOTE]
> インストーラーはまだコード署名されていません：初回起動時に SmartScreen（Windows）と Gatekeeper（macOS）が
> 警告を表示します。自動アップデートは実行前にプロジェクト自身の署名で検証されます。

winget と Homebrew 用にすぐ使えるマニフェスト（現在ブロックされている Flatpak の雛形も含む）が
[`packaging/`](packaging/README.md) にあります — ローカルで準備・検証済みですが、まだそれらのリポジトリには
公開していません：公開はメンテナーによる手動の判断と操作です。

## 🔒 セキュリティ概要

| レイヤー | 保護内容 |
|---|---|
| 保管庫 | Argon2id（19 MiB、t=2）→ AES-256-GCM、書き込みごとに新しいnonce、`fsync` によるアトミック書き込み |
| 鍵 | RAM上にのみ存在し、ロック時にゼロクリア；設定可能な自動ロック（アイドル5〜60分、デフォルト15分） |
| ネットワーク | ネットワーク通信を行うのは Rust プロセスのみ；webview はリモートオリジンを持たず（CSP）、トークンを一切見ません |
| Google | オプション、`calendar.events.readonly` とプロフィールのみ、PKCE とループバックによるOAuth |
| GitHub | オプション、暗号化されたトークン；リンクが `https://github.com/` の場合のみ項目を開きます |
| GitLab | オプション、暗号化されたアドレスとトークン；`https://` のみ、リダイレクトなし、設定済みインスタンスからのリンクのみ |
| アップデート | プロジェクトの鍵で署名されたパッケージのみインストール；改ざんされたダウンロードは実行前に破棄されます |

完全な脅威モデル、バックアップ、複数端末間のマージ、各ファイルの保存場所については
[docs/seguranca.md](docs/seguranca.md) を参照してください。
脆弱性を見つけましたか？ [SECURITY.md](SECURITY.md)。

## 📚 ドキュメント

| ドキュメント | 内容 |
|---|---|
| 📖 [ユーザーガイド](docs/uso.md) | タブ、繰り返しタスク、ショートカット、スキン、アクセシビリティ、ウィンドウ、アップデート、システム起動時の自動起動 |
| 🔌 [連携](docs/integracoes.md) | Googleカレンダーと GitHub（個人トークンまたはデバイスフロー） |
| 🛡️ [セキュリティとデータ](docs/seguranca.md) | 脅威モデル、`.canto` バックアップ、マージ、パスワード変更、ディスク上のファイル |
| 📊 [ベンチマーク](docs/benchmark.md) | Todoist、TickTick、Obsidian、Joplin、Raycast、PowerToys、CopyQ、Ditto、MeetingBar、Gitify、負荷テスト |
| 📝 [CHANGELOG](CHANGELOG.md) | 各バージョンでの変更点 |
| 🤝 [コントリビュート方法](CONTRIBUTING.md) | 環境構築、テスト、PR、リリースの公開方法 |
| 🤖 [エージェントガイド](AGENTS.md) | AIでコードを編集する人のための契約事項と落とし穴 |

## 🛠️ 開発

前提条件：[Bun](https://bun.sh) ≥ 1.2、stable Rust ≥ 1.85、お使いのシステム向けの
[Tauri v2 の依存関係](https://v2.tauri.app/start/prerequisites/)。

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

すべての PR で Windows、macOS、Linux 上の CI が実行されます。`v*` タグを付けると、ドラフトリリースとして
更新用の署名済みインストーラーがビルドされます（手順は [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão) を参照）。

## 📄 ライセンス

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>会議の合間を生きる人たちのために、🦀 Rust、⚛️ React、☕ を込めて作りました。</sub></div>
