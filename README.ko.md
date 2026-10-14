<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · **한국어** · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **알림, 메모, 클립보드 기록, 회의 알림이 포함된 안건, 기록 및 GitHub PRs이 포함된 작업
> 화면 모서리에 고정된 작은 창에서.** `Ctrl+Alt+Space`으로 팝업되고, 필요하지 않을 때는 숨겨집니다.
> 계정이나 서버 없이 컴퓨터의 모든 것을 암호화된 상태로 유지합니다.

## 🌐 언어

Canto은 각각 고유한 README가 포함된 **42개의 인터페이스 언어**를 제공합니다. **설정 → 언어**에서 원하는 언어를 선택하세요.
검색 가능한 선택기는 모국어 이름을 사용하고 자동 모드는 기본 시스템 언어를 따릅니다.
아랍어, 히브리어, 페르시아어에서는 오른쪽에서 왼쪽으로 쓰는 텍스트를 사용합니다. 요청 시 추가 언어 카탈로그가 로드됩니다.

40개의 새로운 인터페이스 카탈로그와 31개의 새로운 README 번역은 기계 번역이며 아직 번역되지 않았습니다.
원어민이 리뷰했습니다. 포르투갈어와 영어는 원래 인터페이스 카탈로그로 유지됩니다. 트레이 라벨 및
알림 제목은 선택한 언어를 따릅니다. 일부 통합 알림 세부정보는 영어로 대체됩니다.
백엔드 오류는 포르투갈어로 남아 있습니다. 작업 제목 구문은 기존 포르투갈어 및 영어 키워드를 유지합니다.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ 왜 Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

회의, PRs 및 소규모 보류 항목 사이에 거주하는 경우 5개의 앱이 열려 있게 됩니다. Canto이 모든 것을 다 담았습니다
한 곳.

🔒 **기본적으로 암호화됩니다.** Argon2id + AES-256-GCM(마스터 비밀번호 포함); 키는 RAM에만 존재합니다.
Windows Hello 선택 사항입니다.

🏠 **귀하의 데이터는 그대로 유지됩니다.** 원격 측정, 서버 없음, 계정이 필요하지 않습니다. 백업은 단일 암호화됩니다.
`.canto` 파일.

⏰ **놓칠 수 없습니다.** 회의 1분 전, 알림 시간이 되면 위젯이 팝업되어 소리가 나고,
**10분 동안 다시 알림**과 함께 알림을 보냅니다.

🪶 **Light.** Electron 대신 Tauri v2(Rust + 시스템 웹뷰): 3.5MB 설치 프로그램.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **항상 최신 상태입니다.** 앱 내에서 업데이트하고 프로젝트 자체 키로 서명된 것만 설치합니다.

</td>
</tr>
</table>

## 🧰 기능

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ 상기시켜주는 작업

시간과 반복 횟수(매일, 주중 또는 매주)가 포함된 일일 체크리스트입니다. **`Daily at 9:30am`**를 입력하고
알림이 이미 설정되었습니다. 우선순위에 **`!high`**(또는 `!alta`, `!média`, `!baixa`)을 추가하거나 행의 점을 클릭하여 순환합니다. 긴 제목은 잘리지 않고 줄바꿈됩니다. 모든 작업에 대한 **포커스 타이머**: 추정치를 제공하고 ▶를 누르면 모든 탭 아래에 고정된 막대가 해당 작업에 대한 시간을 계산합니다(한 번 넘어가면 빨간색). 시간은 매분마다 저장소에 저장됩니다. **일 요약** 붙여넣기 가능(작업, 집중 시간, 총 시간이 포함된 회의, PRs/MRs 열기, 병합, 검토 및 병합 없이 종료), 마크다운의 **주간 및 월간 보고서**, 어제의 **보류 항목 가져오기**.

</td>
</tr>
<tr>
<td>

### 📅 회의가 시작되나요? 그것은 당신에게 알려줍니다.

`Ctrl+Alt+M`(macOS에서는 `Ctrl+Cmd+M`)과(와) 다음 회의에 참여하세요. 등록이 실패하면 Canto가 시도합니다.
`Ctrl+Alt+Shift+M`(macOS에서는 `Ctrl+Cmd+Shift+M`); 트레이 메뉴는 둘 다 사용할 수 없는 경우에도 계속 사용할 수 있습니다.

오늘의 이벤트는 Google 캘린더(읽기 전용)에서 가져왔습니다. 1분 전에 위젯이 다음과 같이 화면으로 점프합니다.
**Meet**에 가입하면 현재 탭이 있든 숨겨져 있든 상관없이 소리를 재생하고 시스템 알림을 보냅니다.
각 카드에는 답변(수락됨, 미정, 거부됨, 대기 중)이 포함된 배지가 표시됩니다. 누가 주최했는지 보려면 이벤트를 클릭하세요.
그것, 의제, 이니셜 아바타와 답변, 그리고 Gemini의 메모와 같은 첨부 파일이 있는 모든 손님.
맨 윗줄에는 최소 15분의 **다음 무료 슬롯**이 표시됩니다(거부된 초대 및 종일 이벤트는 그렇지 않음).
개수), 겹치는 이벤트에는 다른 이벤트의 이름을 지정하는 **충돌** 배지가 표시됩니다. **오늘** 보기는 진행 중인 회의(남은 시간, 참여 버튼, 충돌 경고) 또는 다음 회의, 그 다음 **한 줄의 하루**(업무 시간 전체의 회의, 작업 및 자유 시간, 회의 시간, 자유 시간 및 충돌 계산 포함)와 회의, 시간이 있는 작업 및 여유 공백이 자체 행으로 표시되는 하나의 타임라인으로 이어집니다.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ 메모를 카드로

`#tags`, 상단 고정 및 원클릭 태그 필터로 검색 가능한 카드; 각 카드에는 원시 마크다운이 아닌 **렌더링된** 노트(제목, 체크리스트, 코드, 링크)의 시작이 표시됩니다. 컴팩트한 **WYSIWYG 편집기**
서식 지정 막대(굵게, 기울임꼴, 코드, 제목, 목록, 텍스트에서 바로 선택하는 체크리스트, 구문이 포함된 코드 블록)
강조 표시, 링크, 이미지) 및 마크다운 단축키(`# `, `- `, `[ ] `, ` ``` `); **MD** 토글
노트가 저장, 검색, 동기화 및 내보내는 방식인 원시 마크다운을 보여줍니다. 링크는 다음으로 열립니다.
`Ctrl`+클릭, http(s) 전용. 이미지(PNG, JPEG, GIF, WebP 최대 2MB)를 붙여넣거나 놓거나 첨부하세요. 각 이미지는 자체적으로 봉인됩니다.
암호화된 파일은 메모 내부와 카드의 썸네일로 표시됩니다. 그들은 `.canto` 외부에 있는 이 기계에 머물러 있습니다.
백업. 수천 개의 메모를 처리합니다. 목록이 페이지로 표시되고 모든 메모가 검색됩니다.

</td>
</tr>
<tr>
<td>

### 📋 절대 잊어버리지 않는(또는 새어나오는) 클립보드

검색 및 핀으로 암호화된 기록; 링크, 색상 및 코드를 인식합니다. **재작성된 항목을 복사**하려면 항목에 마우스를 가져가세요.
JSON 형식 또는 압축, 한 줄의 텍스트, 대문자 또는 소문자(기록 항목은 그대로 유지됨) 대용량 사본(100MB 로그)은 그렇지 않습니다.
무엇이든 고정하세요. 시작을 유지하고 경고합니다. Windows에서는 비밀번호 관리자가 표시한 내용을 건너뜁니다.
민감하다.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 귀하의 GitHub 개요

**나에게 요청한 검토**, 나에게 할당됨, PRs 및 내가 열었던 이슈, PR 또는 이슈 아이콘 및 열었던 이슈
그것. 초안, PRs **검토를 기다리는 중** 및 PRs **일주일 동안 중단됨**이 눈에 띄고 각 PR에는 작은
**CI 배지**(통과, 실패, 실행 중 또는 CI 없음)는 헤드 커밋 검사에서 가져옵니다. 누군가 **요청하면
검토**, OS 알림을 통해 알려줍니다(기본적으로 켜져 있으며 설정에서 꺼짐). 텍스트로 필터링(`repo:` 또는 `label:`, PRs만 또는 문제만), 업데이트, 생성 또는 댓글별로 정렬
**더 보기**로 스크롤하세요. 또한 **GitLab.com 및 자체 호스팅 GitLab**을 지원하며 5분 캐시를 통해
비율 제한을 준수합니다. 읽기 전용 개인 토큰을 사용하거나 브라우저(디바이스 흐름)에서 로그인하세요.

</td>
</tr>
<tr>
<td>

### ⚙️ 설정 및 자동 업데이트

마스터 비밀번호 변경, Windows Hello, `.canto` 백업, 자동 병합이 가능한 동기화 폴더(Dropbox,
OneDrive, 동기화...), 시스템 및 **업데이트** 섹션에서 **설치된 버전**으로 시작하고
**최신에 게시된** 항목이 나란히 있고 업데이트하고 다시 시작하는 버튼이 있습니다.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

또한 목록 및 날짜 옆에 있는 의제 하위 탭인 🎙️ **회의**가 있습니다.
지난 2주 동안의 내용과 로컬 폴더의 `.vtt`, `.srt`, `.txt` 및 `.md` 성적표가 정리되어 검색 가능합니다.

🤖 **AI 모델**(기본적으로 탭 표시줄에 **API 키 또는 계정 없음**): LLM은
[Artificial Analysis](https://artificialanalysis.ai) **지능 지수**, 공개 리더보드 페이지에서 읽음,
점수 표시줄, 생성자, 100만 토큰당 가격 및 속도를 제공하며 인텔리전스, 가격 또는 속도별로 정렬할 수 있습니다. 그것은에서 가져옵니다
대부분 3시간에 한 번씩, 선택 🔔을 통해 알림을 받을 수 있습니다.
모델이 **상위 10위 안에 진입**하거나 **그 안에 올라갑니다**(볼트가 잠금 해제된 동안 6시간마다 확인).
일주일 동안 "new" 및 "up" 배지를 획득합니다.

🌙 **방해 금지:** 설정 또는 트레이에서 회의 알림, 작업 알림, 상태 알림 및 모든 알림을 무음으로 설정합니다.
내일까지 또는 끌 때까지 30분, 1시간, 2시간 동안 시스템 알림을 받습니다. 상단 바에 달이 표시됩니다.
끝날 때; 한 번의 클릭으로 다시 꺼집니다. 다시 시작해도 유지되고 자체적으로 종료됩니다.

⌨️ **키보드로 모든 작업:** `Alt+1`…`Alt+7` 탭 전환, `N` 생성, `/` 검색, `F11` 전체 화면, `Alt+L`
잠금 및 `?`에 바로가기가 나열되어 있습니다. `Ctrl+Shift+P`(macOS의 경우 `Cmd+Shift+P`)은 모든 명령이 포함된 **명령 팔레트**를 엽니다.
이름별 작업: 탭으로 이동, 새 작업 또는 메모, 다음 회의 참여, 오늘의 요약 복사, 스킨 전환, 잠금.

## 🎨 다섯 개의 스킨

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>기본값</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>휴에코 문도</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>드라큘라</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>빛</b></td>
</tr>
</table>

그리고 OS에 따라 빛과 어둠을 전환하는 **Follow 시스템**도 있습니다. 모두 AA 대비를 통과합니다.

<details>
<summary>🖥️ 더 많은 화면: 온보딩, 전역 검색, 명령 팔레트, GitLab, 하위 작업, 노트 편집기, 보안, 동기화, 밀도 등</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| 첫 실행 환영 | 글로벌 검색(`Ctrl+K`) | 자체 호스팅 GitLab 탭 | 회의 알림 |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| 하위 작업, 우선순위 및 PR이 있는 작업 | 노트 편집자 | 더 많은 클립보드 유형 | 보안: 자동 잠금 및 잠금 해제 |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| 동기화된 폴더 | 컴팩트한 밀도 | 잠긴 금고 | GitHub 연결 |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| 모드: 미니, 숨김, 일반, 최대화 | 미니 모드: 화면 가장자리에 알림 |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| 도크에서 경고를 클릭하세요 | 최대화: 드래그 가능한 구분선이 있는 작업 및 알림 |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| 미니: 모드 메뉴가 도크 창 내부에 열립니다 |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| 맞지 않는 탭은 "추가" 메뉴 |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| 게임 및 전체 화면: 사용자가 떠날 때까지 알림이 기다림 |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| 다시 알림: 1분, 5분 또는 10분 |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| 작업 알림 | 마스터 비밀번호 변경 | 상태 API(선택 탭) | 언어: 영어 또는 포르투갈어 |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| 다시 작성된 클립 복사 | 준비가 완료된 회의 알림 |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| 재설계: 작업 탭, 전후 |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| 재설계: 모든 탭, 이전(위) 및 이후(아래) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| 작업이 중단되어 CI 실패 | 누군가 나를 언급했습니다 | 설정 |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: CI failed, PR without a review for 24, 48 or 72 hours, and mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| 비밀번호가 변경되었습니다. 파일 1개가 보류 중입니다. | 일요약 |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| 주간 보고서 | 의제: 다음 자유 시간 및 갈등 |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| 의제: 지금은 무료 | 명령 팔레트(`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| 방해하지 마세요 | 메모의 이미지 |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| PR마다 CI 배지 | 요청 알림 검토 |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| 이미지를 썸네일로 참고 | WYSIWYG 노트 편집기 |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| 노트 편집기: 원시 마크다운(MD) | 밝은 피부의 노트 편집기 |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| 작업: 행의 우선순위, 긴 제목 줄바꿈 | 렌더링된 마크다운이 포함된 메모 목록 |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| 지능 지수로 순위가 매겨진 AI 모델 |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| 중단, 회의, 작업 및 새로운 AI 모델 등 보류 중인 모든 것에 대한 단일 경고 오버레이 |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| 내 끝점: 최신 대기 시간이 있는 타일 | 개방형 엔드포인트: 대기 시간 차트, 제한 및 경고 설정 | DNS + 인증서 확인 추가 |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| 특정 날짜의 일정: 이전 및 다음 화살표, 날짜 선택기 및 오늘로 돌아가기 버튼 |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| 작업: 타이머 및 그룹화된 목록이 포함된 현재 작업 | GitHub: 목록 위의 요약 스트립 | GitLab: CI 타일이 없는 동일한 스트립 |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| 모든 탭 아래에 고정된 포커스 타이머 | 하루 일정, 회의 외 업무 |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| 일별 보기: 겹치는 일정이 나란히 너비를 공유 |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| 레이더 검토: 가장 오래된 요청부터, 기한이 지난 요청은 빨간색으로 표시, 다시 알림 |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| 목록 및 일 옆에 있는 의제 하위 탭으로 회의 |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| 활동 탭(기본적으로 꺼져 있음) | 집중된 시간과 마감된 요약 PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| 활동 탭, 지난 7일 | 활동 탭, 꺼짐 | 넓은 창의 활동 탭 |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

**활동** 탭은 숨겨진 상태로 시작됩니다(설정 → 표시되는 탭에서 활성화). 이름만 기록됩니다.
컴퓨터를 사용하는 동안 백업이나 동기화에 도달하지 않는 봉인된 로컬 파일에 집중된 응용 프로그램(Wayland
초점이 맞춰진 창을 보고할 수 없으므로 해당 창에서는 계속 사용할 수 없습니다.) 선택하기 전까지는 사용 중지되며 첫 번째 화면에 내용이 표시됩니다.
유지되는 것과 결코 유지되지 않는 것.

- **일**: 총계가 포함된 카테고리별 도넛으로, 범례에 카테고리가 숨겨져 있으며, 해당일에 대한 변화가 표시됩니다.
이전 및 유휴 시간(2분 동안 키보드나 마우스 사용 불가). 그 아래에는 연속 및
하루에 하나의 점, 3개의 하이라이트(한 앱에서 가장 긴 시간, 앱 전환, 피크 시간), 전체 시간이 표시되는 타임라인
하루 동안 유휴 상태로 있는 앱과 가장 바쁜 앱은 "지금" 표시와 함께 하나의 시간 축을 공유하며, 앱 목록은 다음과 같습니다.
(카테고리를 변경하려면 하나를 탭하세요) 또는 포커스 타이머가 실행된 작업.
- **주**: 목표를 달성한 각 날짜 아래에 평균 선과 점이 있는 누적 열, 시간 히트 맵
최고치와 함께, 일주일 내내 동일한 목록이 표시됩니다.
- **레이아웃 및 스킨**: 기본 창에 열 1개, 넓으면 열 2개(최대화) 모든 피부에는 고유한 것이 있습니다
카테고리 색상, 대비 확인. 해당 요일 옆의 메뉴는 이를 텍스트로 복사합니다.

<sub>모든 스크린샷은 가상의 데이터를 사용합니다.</sub>

## ⚖️ 시중 제품과 비교

연구된 도구 중 한 번에 두 가지 이상의 영역을 다루는 도구는 없습니다. 출처 및 세부정보
[docs/benchmark.md](docs/benchmark.md).

| | 작업 + 알림 | 메모 | 클립보드 | 회의 | GitHub | 기본적으로 로컬 암호화 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| 흑요석 / 조플린 | ➖ | ✅ | — | — | — | ➖ 동기화만 |
| 레이캐스트 | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ/동감 | — | — | ✅ | — | — | ➖ 선택사항 |
| 미팅바 | — | — | — | ✅ | — | 해당 없음 |
| Gitify | — | — | — | — | ✅ | 해당 없음 |

<sub>✅ 기본 · ➖ 부분, 확장을 통해 또는 선택 사항 · — 없음 · ? 게시되지 않음 · 해당 사항 없음 사용자 데이터를 저장하지 않습니다</sub>

벤치마크 결과: **작업 제목에 정확한 시간**(Todoist/TickTick), **알림 일시 중지**
(TickTick) 및 **암호 관리자를 존중하는 클립보드**(CopyQ/Ditto).

## ⬇️ 설치

**[Releases](https://github.com/juninmd/canto-widget/releases)**에서 해당 플랫폼에 맞는 설치 프로그램을 다운로드하세요.

| 시스템 | 파일 |
|---|---|
| 🪟 윈도우 10/11 | `Canto_x.y.z_x64-setup.exe`(권장) 또는 `.msi` |
| 🍎 맥OS | Apple Silicon 또는 Intel의 경우 `.dmg` |
| 🐧 리눅스 | `.AppImage`, `.deb` 또는 `.rpm` |

1. 처음 실행 시 **마스터 비밀번호**를 생성합니다. 복구할 수 없습니다. 비밀번호를 분실하면 데이터가 손실됩니다.
2. `Ctrl+Alt+Space`(macOS의 경우 `Cmd+Shift+Space`)은 위젯을 표시하거나 숨깁니다.
3. 완료되었습니다. 새 버전이 출시되면 Canto에서 알림을 보내드리며, 클릭 한 번으로 **설정 → 업데이트**를 업데이트할 수 있습니다.

> [!참고]
> 설치 프로그램은 아직 코드 서명되지 않았습니다. SmartScreen(Windows) 및 Gatekeeper(macOS)는 처음 시작할 때 경고합니다.
> 자동 업데이트는 실행하기 전에 프로젝트 자체 서명에 대해 확인됩니다.

Winget 및 Homebrew에 대한 기성 매니페스트(현재 차단된 Flatpak용 스켈레톤 포함)가
[`packaging/`](packaging/README.md) — 현지에서 준비 및 확인되었지만 아직 해당 지역에 게시되지 않았습니다.
저장소: 게시는 관리자가 수동으로 결정하고 수행하는 작업입니다.

## 🔒 보안 개요

| 레이어 | 보호 |
|---|---|
| 금고 | Argon2id(19MiB, t=2) → AES-256-GCM, 모든 쓰기에 대한 새로운 nonce, `fsync`을 사용한 원자 쓰기 |
| 열쇠 | RAM만 해당, 잠금 시 0으로 설정됨 구성 가능한 자동 잠금(유휴 시간 5~60분, 기본적으로 15분) |
| 네트워크 | Rust 프로세스만 네트워크와 대화합니다. webview에는 원격 원본(CSP)이 없으며 토큰이 표시되지 않습니다 |
| Google | 선택 사항, `calendar.events.readonly`, `directory.readonly`(게스트 목록의 작업 공간 동료 사진) 및 프로필, PKCE 및 루프백이 포함된 OAuth |
| GitHub | 선택사항, 암호화된 토큰; 링크가 `https://github.com/`인 경우에만 항목이 열립니다 |
| GitLab | 선택사항, 암호화된 주소 및 토큰 `https://`만, 리디렉션 없음, 구성된 인스턴스에서만 링크 |
| 업데이트 | 프로젝트 키로 서명된 패키지만 설치합니다. 변조된 다운로드는 실행 전에 삭제됩니다 |

전체 모델, 백업, 시스템 전체 및 각 파일이 있는 위치: [docs/seguranca.md](docs/seguranca.md).
결함을 발견했나요? [SECURITY.md](SECURITY.md).

## 📚 문서

| 문서 | 그 안에 무엇이 들어있나요 |
|---|---|
| 📖 [User guide](docs/uso.md) | 탭, 반복 작업, 바로가기, 스킨, 접근성, 창, 업데이트 및 시스템 시작 |
| 🔌 [Integrations](docs/integracoes.md) | Google 의제 및 GitHub(개인 토큰 또는 장치 흐름) |
| 🛡️ [Security and data](docs/seguranca.md) | 위협 모델, `.canto` 백업, 병합, 비밀번호 변경, 디스크의 파일 |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify 및 볼륨 테스트 |
| 📝 [CHANGELOG](CHANGELOG.md) | 각 버전에서 변경된 사항 |
| 🤝 [How to contribute](CONTRIBUTING.md) | 환경, 테스트, PRs 및 릴리스 게시 방법 |
| 🤖 [Agent guide](AGENTS.md) | AI로 코드를 편집하는 모든 사람을 위한 계약 및 함정 |

## 🛠️ 개발

전제 조건: [Bun](https://bun.sh) ≥ 1.2, 안정적인 Rust ≥ 1.85 및
귀하의 시스템에 대한 [Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/).

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

모든 PR은 Windows, macOS 및 Linux에서 CI를 실행합니다. 기존 `fix`, `feat` 및 중단 커밋이 `main`에 병합되었습니다.
SemVer 태그, 생성된 릴리스 노트 및 병렬로 구축된 서명된 설치 프로그램을 가져옵니다. 릴리스는 검증 후 게시됩니다(자세한 내용은
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 라이센스

[MIT](LICENSE) © 안토니오 카를로스

<div align="center"><sub>회의 사이에 생활하는 사람들을 위해 🦀 Rust, ⚛️ React 및 🔥로 제작되었습니다.</sub></div>
