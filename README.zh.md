<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto：将你一整天的安排收纳在屏幕角落。任务、GitHub 和会议提醒尽在小组件窗口中。" width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20%E4%B8%8B%E8%BD%BD-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-%E5%8A%A0%E5%AF%86%E5%86%85%E6%A0%B8-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)

**[功能](#-功能)** · **[皮肤](#-五种皮肤)** · **[安装](#%EF%B8%8F-安装)** · **[安全](#-安全一览)** · **[文档](#-文档)**

<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · **中文** · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md)</sub>

</div>

<br>

> **带提醒的任务、笔记、剪贴板历史、带会议提醒的日程、会议记录以及你的 GitHub PR，
> 全部集中在一个固定在屏幕角落的小窗口里。** 按 `Ctrl+Alt+Space` 弹出，不需要时自动隐藏，
> 所有数据都在你的电脑上加密保存,无需账号,也无需服务器。

## ✨ 为什么选择 Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="浏览任务、笔记、剪贴板、日程和 GitHub 标签页、会议提醒以及皮肤" width="300"></td>
<td>

如果你的生活在会议、PR 和各种琐碎待办事项之间来回切换,你最终会打开五六个应用。Canto 把这一切集中在一个地方。

🔒 **默认加密。** 使用主密码进行 Argon2id + AES-256-GCM 加密,密钥只存在于内存中。
可选启用 Windows Hello。

🏠 **数据永远属于你。** 零遥测、零服务器、无需账号。备份就是一个加密的
`.canto` 文件。

⏰ **绝不会错过。** 会议开始前 1 分钟以及到达提醒时间时,小组件会弹出、播放提示音并发送系统通知,
支持**延后 10 分钟**。

🪶 **轻量。** 使用 Tauri v2(Rust + 系统自带的 webview)而非 Electron:安装包仅 3.5 MB。
[实测数据](docs/benchmark.md#footprint-medido)。

🔄 **始终保持最新。** 可在应用内直接更新,且只安装经过项目自有密钥签名的版本。

</td>
</tr>
</table>

## 🧰 功能

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="带时间和重复规则的今日任务"></td>
<td>

### ✅ 会提醒你的任务

一份带时间和重复规则(每天、工作日或每周)的每日清单。输入 **`每天 9:30`**,
提醒就已经设置好了。**每日总结**一键复制,还能**把昨天的待办事项延续**过来。

</td>
</tr>
<tr>
<td>

### 📅 会议要开始了?它会告诉你。

今天的日程来自 Google 日历(只读)。提前一分钟,小组件会跳到屏幕最前方,
带上**加入 Meet**按钮,播放提示音并发送系统通知,无论你正在哪个标签页,或者小组件是否已隐藏。
点击事件即可查看组织者、议程、参会者和附件,例如 Gemini 的会议记录。

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="事件详情,含组织者、参会者和 Gemini 会议记录"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="带标签的笔记卡片以及一条置顶笔记"></td>
<td>

### 🗒️ 卡片形式的笔记

可搜索的卡片,支持 `#标签`、置顶以及一键按标签筛选。可以轻松应对成千上万条笔记:
列表分页加载,搜索则覆盖全部内容。

</td>
</tr>
<tr>
<td>

### 📋 永不遗忘(也不泄露)的剪贴板

加密的历史记录,支持搜索和置顶;能识别链接、颜色和代码。即使复制了一段巨大的内容(100 MB 的日志)
也不会卡死:它只保留开头部分并给出提示。在 Windows 上,凡是密码管理器标记为敏感内容的,
都会自动跳过。

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="剪贴板历史,包含链接、大段日志和代码"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub 标签页,显示请求我审查、指派给我以及未关闭的 PR"></td>
<td>

### 🐙 一目了然的 GitHub

**请求我审查**的、指派给我的、我创建的 PR 和 issue,均带有 PR 或 issue 图标以及创建者信息。
支持按文本、`repo:` 或 `label:` 筛选,按更新时间、创建时间或评论数排序,
并可通过**显示更多**滚动加载。同时支持 **GitLab.com 及自托管 GitLab**,带有 5 分钟缓存,
遵守速率限制。可使用只读个人令牌登录,也可从浏览器登录(设备授权流程)。

</td>
</tr>
<tr>
<td>

### ⚙️ 设置与自动更新

修改主密码、Windows Hello、`.canto` 备份、带自动合并的同步文件夹(Dropbox、
OneDrive、Syncthing 等)、开机自启,以及**更新**栏目,并排显示**已安装版本**与
**最新发布版本**,还有一键更新并重启的按钮。

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="设置页显示已安装版本、最新发布版本以及更新按钮"></td>
</tr>
</table>

还有 🎙️ **会议**功能:过去两周的 Gemini 会议记录和文字记录,以及来自本地文件夹的
`.vtt`、`.srt`、`.txt` 和 `.md` 格式记录,自动清理并可搜索。

⌨️ **一切皆可用键盘操作:** `Alt+1`…`Alt+7` 切换标签页,`N` 新建,`/` 搜索,`F11` 全屏,
`Alt+L` 锁定,`?` 显示快捷键列表。

## 🎨 五种皮肤

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="默认皮肤" width="200"><br><b>默认</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="虚圈皮肤" width="200"><br><b>虚圈</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="德古拉皮肤" width="200"><br><b>德古拉</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="浅色皮肤" width="200"><br><b>浅色</b></td>
</tr>
</table>

还有**跟随系统**皮肤,会随操作系统在浅色和深色之间自动切换。所有皮肤均通过 AA 对比度标准。

<details>
<summary>🖥️ 更多界面截图:引导流程、全局搜索、GitLab、子任务、Markdown、安全、同步、密度等</summary>

<br>

![全屏模式下的 GitHub 标签页](docs/prints/app/12-tela-cheia.png)

| 首次启动欢迎页 | 全局搜索(`Ctrl+K`) | 自托管 GitLab 标签页 | 会议提醒 |
|---|---|---|---|
| ![带核心快捷键说明的引导页](docs/prints/app/19-onboarding.png) | ![同时搜索任务、笔记和剪贴板](docs/prints/app/20-busca-global.png) | ![自托管 GitLab 上请求审查、指派和 issue](docs/prints/app/21-gitlab.png) | ![带加入 Meet 和延后选项的会议提醒](docs/prints/app/07-aviso-reuniao.png) |

| 带子任务、优先级和 PR 的任务 | Markdown 格式笔记 | 更多剪贴板类型 | 安全:自动锁定和解锁记录 |
|---|---|---|---|
| ![任务上的清单、优先级和 PR 链接](docs/prints/app/23-tarefas-detalhes.png) | ![以 Markdown 渲染并关联任务的笔记](docs/prints/app/24-notas-markdown.png) | ![识别链接、颜色、json、邮箱和电话的剪贴板](docs/prints/app/25-clipboard-tipos.png) | ![可配置的自动锁定以及最近解锁记录](docs/prints/app/26-ajustes-seguranca.png) |

| 同步文件夹 | 紧凑密度 | 已锁定的保险库 | 连接 GitHub |
|---|---|---|---|
| ![指向 Dropbox 文件夹的设置](docs/prints/app/27-ajustes-sync.png) | ![任务标签页的紧凑界面](docs/prints/app/28-densidade-compacta.png) | ![带 Windows Hello 的密码解锁界面](docs/prints/app/09-cofre-trancado.png) | ![使用令牌或浏览器进行连接](docs/prints/app/10-github-conectar.png) |

| 任务提醒 | 修改主密码 |
|---|---|
| ![带完成和延后选项的提醒](docs/prints/app/08-lembrete-tarefa.png) | ![修改密码表单](docs/prints/app/13-trocar-senha.png) |

</details>

<sub>所有截图均使用虚构数据。</sub>

## ⚖️ 与市面产品的对比

调研过的工具中,没有一个能同时覆盖两个以上的这些方面。来源和细节见
[docs/benchmark.md](docs/benchmark.md)。

| | 任务 + 提醒 | 笔记 | 剪贴板 | 会议 | GitHub | 默认本地加密 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ 仅同步时 |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Ditto | — | — | ✅ | — | — | ➖ 可选 |
| MeetingBar | — | — | — | ✅ | — | n/a |
| Gitify | — | — | — | — | ✅ | n/a |

<sub>✅ 原生支持 · ➖ 部分支持,通过扩展或可选功能 · — 无 · ? 未公开 · n/a 不存储用户数据</sub>

从对比中得到的启发:**任务标题里直接写时间**(Todoist/TickTick)、**延后提醒**
(TickTick)以及**尊重密码管理器的剪贴板**(CopyQ/Ditto)。

## ⬇️ 安装

从 **[Releases](https://github.com/juninmd/canto-widget/releases)** 下载适合你平台的安装包:

| 系统 | 文件 |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe`(推荐)或 `.msi` |
| 🍎 macOS | 适用于 Apple Silicon 或 Intel 的 `.dmg` |
| 🐧 Linux | `.AppImage`、`.deb` 或 `.rpm` |

1. 首次启动时需要设置**主密码**。没有找回机制:密码一旦丢失,数据也随之丢失。
2. `Ctrl+Alt+Space`(macOS 上为 `Cmd+Alt+Space`)可以显示或隐藏小组件。
3. 完成。有新版本发布时 Canto 会通知你,在**设置 → 更新**中一键即可更新。

> [!NOTE]
> 安装包目前尚未进行代码签名:首次启动时 SmartScreen(Windows)和 Gatekeeper(macOS)会发出警告。
> 自动更新会先校验项目自身的签名,再执行安装。

winget 和 Homebrew 的安装清单已经准备好(还有一份暂时受阻的 Flatpak 骨架),位于
[`packaging/`](packaging/README.md)——已在本地准备并验证,但尚未发布到相应的仓库:
发布与否是维护者的手动决定和操作。

## 🔒 安全一览

| 层级 | 保护措施 |
|---|---|
| 保险库 | Argon2id(19 MiB,t=2) → AES-256-GCM,每次写入使用全新 nonce,原子写入并调用 `fsync` |
| 密钥 | 仅存在于内存中,锁定时清零;可配置自动锁定(5 到 60 分钟无操作,默认 15 分钟) |
| 网络 | 只有 Rust 进程会访问网络;webview 没有任何远程源(CSP),也绝不会接触到令牌 |
| Google | 可选启用,仅申请 `calendar.events.readonly` 和基础资料权限,通过 PKCE 和本地回环完成 OAuth |
| GitHub | 可选启用,令牌加密存储;只有链接为 `https://github.com/` 时才会打开 |
| GitLab | 可选启用,地址和令牌均加密存储;仅限 `https://`,不允许重定向,链接只能来自已配置的实例 |
| 更新 | 只安装经过项目密钥签名的安装包;被篡改的下载文件会在运行前被丢弃 |

完整模型、跨设备备份与合并、每个文件的存放位置:[docs/seguranca.md](docs/seguranca.md)。
发现了安全漏洞?请看 [SECURITY.md](SECURITY.md)。

## 📚 文档

| 文档 | 内容 |
|---|---|
| 📖 [用户指南](docs/uso.md) | 标签页、重复任务、快捷键、皮肤、无障碍功能、窗口、更新以及开机自启 |
| 🔌 [集成](docs/integracoes.md) | Google 日历和 GitHub(个人令牌或设备授权流程) |
| 🛡️ [安全与数据](docs/seguranca.md) | 威胁模型、`.canto` 备份、合并、密码修改、磁盘上的文件 |
| 📊 [基准对比](docs/benchmark.md) | Todoist、TickTick、Obsidian、Joplin、Raycast、PowerToys、CopyQ、Ditto、MeetingBar、Gitify 以及容量测试 |
| 📝 [更新日志](CHANGELOG.md) | 每个版本的变更内容 |
| 🤝 [如何贡献](CONTRIBUTING.md) | 开发环境、测试、PR 以及如何发布版本 |
| 🤖 [代理指南](AGENTS.md) | 面向使用 AI 编辑代码者的契约与注意事项 |

## 🛠️ 开发

前置条件:[Bun](https://bun.sh) ≥ 1.2、稳定版 Rust ≥ 1.85,以及适用于你所在系统的
[Tauri v2 依赖项](https://v2.tauri.app/start/prerequisites/)。

```bash
bun install
bun run tauri dev                                        # 带热重载的应用
bun run lint && bun test                                 # 类型检查和 UI 测试
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # 当前平台的安装包
```

每个 PR 都会在 Windows、macOS 和 Linux 上运行 CI。打 `v*` 标签会构建带签名的安装包,
用于更新,并生成草稿版本发布(详细步骤见 [CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão))。

## 📄 许可证

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>用 🦀 Rust、⚛️ React 和 ☕ 为那些生活在会议之间的人制作。</sub></div>
