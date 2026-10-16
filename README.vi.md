<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · **Tiếng Việt** · [ไทย](README.th.md) · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **Nhiệm vụ có lời nhắc, ghi chú, lịch sử clipboard, chương trình làm việc có cảnh báo cuộc họp, bản ghi và GitHub PRs của bạn
> trong một cửa sổ nhỏ được ghim vào góc màn hình.** Bật lên với `Ctrl+Alt+Space`, ẩn khi bạn không cần
> nó và giữ mọi thứ được mã hóa trên máy của bạn, không cần tài khoản và không cần máy chủ.

## 🌐 Ngôn ngữ

Canto cung cấp **42 ngôn ngữ giao diện**, mỗi ngôn ngữ có README riêng. Chọn của bạn trong **Cài đặt → Ngôn ngữ**;
bộ chọn có thể tìm kiếm sử dụng tên ngôn ngữ bản địa và chế độ tự động tuân theo ngôn ngữ hệ thống chính của bạn.
Tiếng Ả Rập, tiếng Do Thái và tiếng Ba Tư sử dụng văn bản từ phải sang trái. Danh mục ngôn ngữ bổ sung tải theo yêu cầu.

40 danh mục giao diện mới và 31 bản dịch README mới là bản dịch máy và chưa được
được người bản ngữ đánh giá. Tiếng Bồ Đào Nha và tiếng Anh vẫn là danh mục giao diện ban đầu. Nhãn khay và
tiêu đề thông báo tuân theo ngôn ngữ đã chọn; một số chi tiết cảnh báo tích hợp chuyển sang tiếng Anh,
và lỗi phụ trợ vẫn còn bằng tiếng Bồ Đào Nha. Cú pháp tiêu đề nhiệm vụ giữ nguyên các từ khóa tiếng Bồ Đào Nha và tiếng Anh hiện có.

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ Tại sao Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

Nếu bạn đang bận giữa các cuộc họp, PRs và các mục nhỏ đang chờ xử lý thì bạn sẽ mở được năm ứng dụng. Canto đặt tất cả vào
một nơi.

🔒 **Được mã hóa theo mặc định.** Argon2id + AES-256-GCM bằng mật khẩu chính; chìa khóa chỉ tồn tại trong RAM.
Windows Hello tùy chọn.

🏠 **Dữ liệu của bạn luôn ở bên bạn.** Không cần đo từ xa, không cần máy chủ, không cần tài khoản. Bản sao lưu được mã hóa duy nhất
`.canto` tệp.

⏰ **Bạn sẽ không bỏ lỡ.** 1 phút trước cuộc họp và vào thời điểm nhắc nhở, tiện ích này sẽ bật lên, phát âm thanh và
gửi thông báo với **báo lại 10 phút**.

🪶 **Light.** Tauri v2 (Rust + chế độ xem web hệ thống) thay vì Electron: trình cài đặt 3,5 MB.
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **Luôn cập nhật.** Cập nhật từ bên trong ứng dụng và chỉ cài đặt những gì được ký bởi khóa riêng của dự án.

</td>
</tr>
</table>

## 🧰 Tính năng

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ Nhiệm vụ nhắc nhở bạn

Danh sách kiểm tra hàng ngày với thời gian và tần suất lặp lại (hàng ngày, các ngày trong tuần hoặc hàng tuần). Nhập **`Daily at 9:30am`** và
reminder is already set; add **`!high`** (or `!alta`, `!média`, `!baixa`) for the priority, or click the dot on the row to cycle it. Long titles wrap instead of being cut off. **Focus timer** on any task: give it an estimate, press ▶ and a bar pinned under every tab counts the time against it (red once you go over); the time is saved to the vault every minute. **Day summary** ready to paste (tasks, focused time, meetings with total time, PRs/MRs opened, merged, reviewed and closed without merging), a **weekly and monthly report** in markdown, and **pull over pending items** from yesterday. **Quick capture** (`Ctrl+Alt+N`, `Ctrl+Cmd+N` on macOS) jots a task or a note from any app, without opening the widget.

</td>
</tr>
<tr>
<td>

### 📅 Cuộc họp bắt đầu? Nó cho bạn biết.

Tham gia cuộc họp tiếp theo với `Ctrl+Alt+M` (`Ctrl+Cmd+M` trên macOS). Nếu đăng ký không thành công, Canto sẽ thử
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` trên macOS); menu khay vẫn khả dụng nếu cả hai đều không khả dụng.

Sự kiện hôm nay đến từ Lịch Google (chỉ đọc). Một phút trước, tiện ích sẽ nhảy lên màn hình với
**tham gia Meet**, phát âm thanh và gửi thông báo hệ thống, cho dù bạn đang truy cập tab nào hay ngay cả khi tab đó bị ẩn.
Mỗi thẻ hiển thị một huy hiệu có câu trả lời của bạn (được chấp nhận, có thể, bị từ chối, đang chờ). Bấm vào sự kiện để xem ai tổ chức
nó, chương trình nghị sự, mỗi vị khách có hình đại diện viết tắt và câu trả lời của họ cũng như các tệp đính kèm, chẳng hạn như ghi chú của Song Tử.
Dòng trên cùng cho bạn biết **vị trí miễn phí tiếp theo** kéo dài ít nhất 15 phút (lời mời bị từ chối và sự kiện cả ngày không
count) và các sự kiện trùng nhau sẽ nhận được huy hiệu **xung đột** khi đặt tên cho sự kiện khác. Chế độ xem **Hôm nay** dẫn đến cuộc họp đang diễn ra (thời gian còn lại, nút tham gia, cảnh báo xung đột) hoặc cuộc họp tiếp theo, sau đó là **ngày trên một dòng** (các cuộc họp, nhiệm vụ và thời gian rảnh trong suốt giờ làm việc, với thời gian họp, thời gian rảnh và xung đột được tính) và một dòng thời gian trong đó các cuộc họp, nhiệm vụ có thời gian và khoảng trống còn trống là các hàng riêng: một khoảng trống đưa ra để phù hợp với một nhiệm vụ chưa được tính thời gian và những gì đã quá hạn sẽ được gấp lại.

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ Ghi chú dưới dạng thẻ

Thẻ có thể tìm kiếm được với `#tags`, ghim lên đầu và bộ lọc thẻ bằng một cú nhấp chuột; mỗi thẻ hiển thị phần đầu của ghi chú **được hiển thị** (tiêu đề, danh sách kiểm tra, mã, liên kết), không phải đánh dấu thô. **Trình soạn thảo WYSIWYG** với thiết kế nhỏ gọn
thanh định dạng (in đậm, in nghiêng, mã, tiêu đề, danh sách, danh sách kiểm tra bạn đánh dấu ngay trong văn bản, khối mã có cú pháp
đánh dấu, liên kết, hình ảnh) và các phím tắt đánh dấu khi bạn nhập (`# `, `- `, `[ ] `, ` ``` `); nút chuyển đổi **MD**
hiển thị đánh dấu thô, đây vẫn là cách ghi chú được lưu trữ, tìm kiếm, đồng bộ hóa và xuất. Liên kết mở bằng
`Ctrl`+nhấp chuột, chỉ http(s). Dán, thả hoặc đính kèm hình ảnh (PNG, JPEG, GIF, WebP tối đa 2 MB), mỗi hình ảnh được niêm phong riêng
tập tin được mã hóa, hiển thị bên trong ghi chú và dưới dạng hình thu nhỏ trên thẻ; họ ở trên máy này, bên ngoài `.canto`
bản sao lưu. Xử lý hàng nghìn ghi chú: danh sách được phân trang và tìm kiếm bao gồm tất cả chúng.

</td>
</tr>
<tr>
<td>

### 📋 Clipboard không bao giờ quên (hoặc rò rỉ)

Lịch sử được mã hóa với tìm kiếm và ghim; nhận ra các liên kết, màu sắc và mã. Di chuột một mục để **sao chép nó được viết lại**:
JSON được định dạng hoặc thu gọn, văn bản trên một dòng, CHỮ HOA hoặc chữ thường (mục lịch sử vẫn giữ nguyên). Một bản sao khổng lồ (nhật ký 100 MB) không
đóng băng mọi thứ: nó giữ nguyên sự khởi đầu và cảnh báo bạn. Trên Windows, nó bỏ qua mọi thứ mà trình quản lý mật khẩu đánh dấu là
nhạy cảm.

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 Sơ lược về GitHub của bạn

**Yêu cầu xem xét từ tôi**, được chỉ định cho tôi, PRs và các vấn đề tôi đã mở, với PR hoặc biểu tượng vấn đề và ai đã mở
nó. Bản nháp, PRs **đang chờ bạn xem xét** và PRs **bị đình trệ** trong một tuần và mỗi bản PR đều mang theo một bản nháp nhỏ
**Huy hiệu CI** (đạt, không thành công, đang chạy hoặc không có CI) từ các lần kiểm tra của người đứng đầu. Khi ai đó ** yêu cầu bạn
review**, một thông báo của hệ điều hành sẽ cho bạn biết (bật theo mặc định, tắt trong Cài đặt). Lọc theo văn bản, chỉ `repo:` hoặc `label:`, PRs hoặc chỉ các vấn đề, sắp xếp theo cập nhật, sáng tạo hoặc nhận xét và
scroll with **show more**. Switch to the **Comments** view to see a **Commenters catalog** grid of everyone who commented on your PRs (avatars, human vs bot badges, comment counts, search, bot filter, progressive pagination) and their comments. Also supports **GitLab.com and self-hosted GitLab**, with a 5-minute cache that
tôn trọng giới hạn tỷ lệ. Đăng nhập bằng mã thông báo cá nhân chỉ đọc hoặc từ trình duyệt (luồng thiết bị).

</td>
</tr>
<tr>
<td>

### ⚙️ Cài đặt và cập nhật tự động

Thay đổi mật khẩu chính, sao lưu Windows Hello, `.canto`, thư mục được đồng bộ hóa với tính năng hợp nhất tự động (Dropbox,
OneDrive, Syncthing...), hãy bắt đầu với hệ thống và phần **Cập nhật**, với **phiên bản đã cài đặt** và
**xuất bản mới nhất** đặt cạnh nhau và một nút để cập nhật và khởi động lại.

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

Ngoài ra còn có 🎙️ **Cuộc họp**, một tab phụ của Chương trình nghị sự bên cạnh Danh sách và Ngày: Ghi chú và bản ghi của Song Tử từ
hai tuần qua, cùng với các bản ghi `.vtt`, `.srt`, `.txt` và `.md` từ một thư mục cục bộ, đã được dọn dẹp và có thể tìm kiếm được.

🤖 **Mô hình AI** (trên thanh tab theo mặc định, **không có khóa hoặc tài khoản API**): LLM được xếp hạng theo
[Artificial Analysis](https://artificialanalysis.ai) **Chỉ số thông minh**, đọc từ trang bảng xếp hạng công khai của nó,
với thanh điểm, người tạo, giá trên mỗi 1 triệu token và tốc độ, có thể sắp xếp theo mức độ thông minh, giá cả hoặc tốc độ. Nó lấy lúc
hầu hết 3 giờ một lần và tính năng chọn tham gia 🔔 sẽ thông báo cho bạn khi có
mô hình **lọt vào top 10** hoặc **leo vào trong đó** (được kiểm tra 6 giờ một lần khi kho tiền được mở khóa), với
huy hiệu "mới" và "lên" trong một tuần.

🌙 **Không làm phiền:** trong Cài đặt hoặc khay, tắt tiếng cảnh báo cuộc họp, lời nhắc nhiệm vụ, cảnh báo trạng thái và mọi thứ
thông báo hệ thống trong 30 phút, 1 giờ, 2 giờ, cho đến ngày mai hoặc cho đến khi bạn tắt nó đi. Một mặt trăng ở thanh trên cùng hiển thị
khi nó kết thúc; một cú nhấp chuột sẽ tắt nó đi. Nó tồn tại khi khởi động lại và tự kết thúc.

⌨️ **Mọi thứ bằng bàn phím:** `Alt+1`…`Alt+7` chuyển tab, `N` tạo, `/` tìm kiếm, `F11` toàn màn hình, `Alt+L`
khóa và `?` liệt kê các phím tắt. `Ctrl+Shift+P` (`Cmd+Shift+P` trên macOS) mở **bảng lệnh** với mọi
hành động theo tên: chuyển đến tab, nhiệm vụ hoặc ghi chú mới, tham gia cuộc họp tiếp theo, sao chép tóm tắt trong ngày, chuyển đổi giao diện, khóa.

## 🎨 Six skins

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>Mặc định</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>Hueco Mundo</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>Dracula</b></td>
<td align="center"><img src="docs/prints/app/79-skin-glass.png" alt="Glass skin" width="200"><br><b>Glass</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>Ánh sáng</b></td>
</tr>
</table>

Và **Theo dõi hệ thống**, hệ thống chuyển đổi giữa sáng và tối cùng với hệ điều hành. Tất cả đều vượt qua độ tương phản AA.

<details>
<summary>🖥️ Nhiều màn hình hơn: triển khai, tìm kiếm toàn cầu, bảng lệnh, GitLab, nhiệm vụ phụ, trình chỉnh sửa ghi chú, bảo mật, đồng bộ hóa, mật độ và hơn thế nữa</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

![Quick capture window: a text field with the hint and the task and note buttons](docs/prints/app/85-captura-rapida.png)

| Chào mừng lần đầu | Tìm kiếm toàn cầu (`Ctrl+K`) | Tab GitLab tự lưu trữ | Thông báo cuộc họp |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| Nhiệm vụ có nhiệm vụ phụ, mức độ ưu tiên và PR | Trình chỉnh sửa ghi chú | Nhiều loại khay nhớ tạm khác | Bảo mật: tự động khóa và mở khóa |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| Thư mục được đồng bộ hóa | Mật độ nhỏ gọn | Kho tiền bị khóa | Kết nối GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| Settings in groups, with search | Search filters the groups | Offline chip in the header | Confirm before clearing the clipboard |
|---|---|---|---|
| ![Settings grouped into Appearance, Notifications, Privacy and security, Data and accounts, and App](docs/prints/ux-melhorias/ajustes-grupos.png) | ![The "buscar ajuste" field opening only the Notifications group](docs/prints/ux-melhorias/ajustes-busca.png) | ![A "sem conexão" chip beside the title when the network drops](docs/prints/ux-melhorias/sem-conexao.png) | ![An inline bar asks to clear 2 items and keeps the pinned one](docs/prints/ux-melhorias/clipboard-limpar.png) |

| Discard an unsaved note draft |
|---|
| ![Esc on a changed note asks to discard or keep editing](docs/prints/ux-melhorias/notas-descartar.png) |

| Các chế độ: Mini, Ẩn, Bình thường, Tối đa hóa | Chế độ thu nhỏ: cảnh báo ở cạnh màn hình |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| Nhấp vào cảnh báo trong thanh công cụ | Tối đa hóa: nhiệm vụ và thông báo, với dải phân cách có thể kéo được |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| The bell opens the alerts over the whole window |
|---|
| ![Pending alerts as cards with their actions over the whole window, "dismiss all" and, below, what was resolved today](docs/prints/app/86-avisos.png) |

| Mini: menu chế độ mở bên trong cửa sổ dock |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| Các tab không phù hợp sẽ chờ trong menu "thêm" |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| Trò chơi và toàn màn hình: cảnh báo chờ cho đến khi bạn rời đi |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| Báo lại: 1, 5 hoặc 10 phút |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| Task reminder | Change master password | Status API (opt-in tab) | Language: English, Portuguese or Spanish |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| Sao chép một clip viết lại | Thông báo cuộc họp với sự chuẩn bị |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| Thiết kế lại: tab Nhiệm vụ, trước và sau |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| Thiết kế lại: mọi tab, trước (trên) và sau (dưới) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI thất bại, công việc bị hỏng | Ai đó đã nhắc đến tôi | Công tắc của họ trong Cài đặt |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: one switch per alert about my own work (CI, review, approval, merge state, comments, assignments, replies), plus mentions and team mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| Mention alert with who wrote it |
|---|
| ![Mention pop-up showing the author's photo, name and @login; the strip shows each author's name, with initials when there is no photo](docs/prints/app/79-aviso-mencao-com-autor.png) |

| Mention alert with a preview of the text |
|---|
| ![GitHub mention pop-up with the author and a preview of the comment that mentions me, cut around the @login](docs/prints/app/80-aviso-mencao-previa.png) |

| More alerts about my own work |
|---|
| ![Pop-up for an approved pull request showing the reviewer's name and what they wrote; the strip also lists a conflict, which ranks first](docs/prints/app/82-aviso-pr-aprovado.png) |

| Day summary alert | Day summary setting |
|---|---|
| ![Day summary pop-up listing the meetings, open tasks, review requests and unread mentions waiting](docs/prints/app/83-aviso-resumo-do-dia.png) | ![Settings: day summary switch, the hour it starts at and a working-days switch](docs/prints/app/84-ajustes-resumo-do-dia.png) |

| Mentions subtab (GitHub and GitLab) |
|---|
| ![GitHub tab, mentions subtab: unread dot, author's photo, name and @login, a preview of the text that mentions me, the thread's link, and actions to mark read or mute the thread or the person; the subtab shows the unread count](docs/prints/app/81-aba-mencoes.png) |

| Mật khẩu đã thay đổi, một tệp đang chờ xử lý | Tóm tắt ngày |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| Báo cáo hàng tuần | Chương trình nghị sự: thời gian rảnh rỗi và xung đột tiếp theo |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| Chương trình nghị sự: miễn phí ngay bây giờ | Bảng lệnh (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| Đừng làm phiền | Hình ảnh trong ghi chú |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| Huy hiệu CI trên mỗi PR | Xem lại thông báo yêu cầu |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| Lưu ý hình ảnh dưới dạng hình thu nhỏ | Trình soạn thảo ghi chú WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| Trình chỉnh sửa ghi chú: đánh dấu thô (MD) | Lưu ý soạn thảo về làn da sáng |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| Nhiệm vụ: ưu tiên theo hàng, bọc tiêu đề dài | Danh sách ghi chú có đánh dấu được hiển thị |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| Các mô hình AI được xếp hạng theo Chỉ số thông minh |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| Một lớp phủ cảnh báo cho mọi thứ đang chờ xử lý: ngừng hoạt động, cuộc họp, nhiệm vụ và mô hình AI mới |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| Điểm cuối của tôi: các ô có độ trễ mới nhất | Điểm cuối mở: biểu đồ độ trễ, cài đặt giới hạn và cảnh báo | Thêm DNS + kiểm tra chứng chỉ |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| Chương trình làm việc của bất kỳ ngày nào: mũi tên trước và tiếp theo, bộ chọn ngày và nút quay lại hôm nay |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| Nhiệm vụ: nhiệm vụ hiện tại với bộ đếm thời gian và danh sách được nhóm | GitHub: dải tóm tắt phía trên danh sách | GitLab: cùng một dải, không có ô CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| Hẹn giờ lấy nét được ghim dưới mỗi tab | Chương trình làm việc trong ngày, nhiệm vụ bên cạnh các cuộc họp |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| Chế độ xem theo ngày: các sự kiện chồng chéo chia sẻ chiều rộng cạnh nhau |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| Xem lại radar: yêu cầu cũ nhất trước, quá hạn màu đỏ, tạm dừng |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| Các cuộc họp dưới dạng tab phụ của Chương trình nghị sự, bên cạnh Danh sách và Ngày |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| Tab Hoạt động (tắt theo mặc định) | Tóm tắt với thời gian tập trung và đóng PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| Tab hoạt động, 7 ngày qua | Tab hoạt động, đã tắt | Tab hoạt động trên cửa sổ rộng |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

Tab **Hoạt động** bắt đầu ẩn (bật nó trong Cài đặt → tab hiển thị). Nó chỉ ghi lại tên của
ứng dụng tập trung trong khi bạn sử dụng máy tính, trong một tệp cục bộ được niêm phong không bao giờ đạt được bản sao lưu hoặc đồng bộ hóa (Wayland
không thể báo cáo cửa sổ tập trung, vì vậy nó vẫn không khả dụng ở đó). Tắt cho đến khi bạn chọn tham gia và màn hình đầu tiên cho biết nội dung
được giữ và những gì không bao giờ được giữ.

- **Ngày**: một chiếc bánh rán theo danh mục với tổng số bên trong, chú thích ẩn một danh mục, sự thay đổi so với ngày
trước và trong thời gian rảnh (không dùng bàn phím và chuột trong 2 phút). Bên dưới nó là mục tiêu tập trung vào mã hàng ngày với chuỗi và
một dấu chấm mỗi ngày, ba điểm nổi bật (kéo dài nhất trong một ứng dụng, chuyển đổi ứng dụng, giờ cao điểm), dòng thời gian trong đó toàn bộ
ngày, các khoảng thời gian nhàn rỗi và các ứng dụng bận rộn nhất chia sẻ một trục thời gian với điểm đánh dấu "hiện tại" và danh sách các ứng dụng
(chạm vào một mục để thay đổi danh mục của nó) hoặc các tác vụ mà bộ hẹn giờ lấy nét đã thực hiện.
- **Tuần**: các cột xếp chồng lên nhau mỗi ngày với đường trung bình và dấu chấm bên dưới mỗi ngày đáp ứng mục tiêu, bản đồ nhiệt một giờ
với đỉnh điểm của bạn và danh sách tương tự trong cả tuần.
- **Bố cục và giao diện**: một cột trong cửa sổ mặc định, hai cột khi cửa sổ rộng (tối đa); mỗi làn da đều có một cái riêng
màu sắc danh mục, kiểm tra độ tương phản. Menu bên cạnh ngày sao chép nó dưới dạng văn bản.

<sub>Tất cả ảnh chụp màn hình đều sử dụng dữ liệu hư cấu.</sub>

## ⚖️ So với những gì ngoài kia

Không có công cụ nào được nghiên cứu bao gồm nhiều hơn hai mặt trận này cùng một lúc. Nguồn và chi tiết trong
[docs/benchmark.md](docs/benchmark.md).

| | Nhiệm vụ + nhắc nhở | Ghi chú | Bảng nhớ tạm | Cuộc họp | GitHub | Mã hóa cục bộ theo mặc định |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Todoist / TickTick | ✅ | ➖ | — | — | — | — |
| Obsidian / Joplin | ➖ | ✅ | — | — | — | ➖ chỉ đồng bộ hóa |
| Raycast | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / Như trên | — | — | ✅ | — | — | ➖ tùy chọn |
| Cuộc họpBar | — | — | — | ✅ | — | không có |
| Gitify | — | — | — | — | ✅ | không có |

<sub> ✅ gốc · ➖ một phần, thông qua tiện ích mở rộng hoặc tùy chọn · — không có · ? chưa được xuất bản · không lưu trữ dữ liệu người dùng</sub>

Điểm chuẩn mang lại điều gì ở đây: **thời gian ngay trong tiêu đề nhiệm vụ** (Todoist/TickTick), **báo lại cảnh báo**
(TickTick) và **clipboard tôn trọng người quản lý mật khẩu** (CopyQ/Ditto).

## ⬇️ Cài đặt

Tải xuống trình cài đặt cho nền tảng của bạn từ **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| Hệ thống | Tập tin |
|---|---|
| 🪟 Windows 10/11 | `Canto_x.y.z_x64-setup.exe` (được khuyến nghị) hoặc `.msi` |
| 🍎 macOS | `.dmg` cho Apple Silicon hoặc Intel |
| 🐧 Linux | `.AppImage`, `.deb` hoặc `.rpm` |

1. Trong lần chạy đầu tiên, bạn tạo **mật khẩu chính**. Không có cách nào cứu vãn được: mất mật khẩu, mất dữ liệu.
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` trên macOS) hiển thị và ẩn tiện ích.
3. Xong. Khi có phiên bản mới xuất xưởng, Canto sẽ thông báo cho bạn và **Cài đặt → Cập nhật** cập nhật chỉ bằng một cú nhấp chuột.

> [!LƯU Ý]
> Trình cài đặt chưa được ký mã: SmartScreen (Windows) và Gatekeeper (macOS) cảnh báo trong lần khởi chạy đầu tiên.
> Cập nhật tự động được xác minh dựa trên chữ ký của chính dự án trước khi chạy.

Các bản kê khai được tạo sẵn cho Winget và Homebrew (cộng với bộ xương cho Flatpak, hiện bị chặn) tồn tại
[`packaging/`](packaging/README.md) — được chuẩn bị và xác minh cục bộ nhưng chưa được xuất bản cho những người đó
kho lưu trữ: xuất bản là một quyết định và hành động thủ công của người bảo trì.

## 🔒 Sơ lược về bảo mật

| Lớp | Bảo vệ |
|---|---|
| Kho tiền | Argon2id (19 MiB, t=2) → AES-256-GCM, một phiên bản mới trên mỗi lần viết, viết nguyên tử với `fsync` |
| Chìa khóa | Chỉ RAM, bằng 0 khi khóa; tự động khóa có thể định cấu hình (5 đến 60 phút không hoạt động, 15 phút theo mặc định) |
| Mạng | chỉ có quá trình Rust giao tiếp với mạng; chế độ xem web không có Nguồn gốc từ xa (CSP) và không bao giờ thấy mã thông báo |
| Google | tùy chọn, chỉ `calendar.events.readonly`, `directory.readonly` (ảnh của đồng nghiệp Workspace trong danh sách khách mời) cùng với hồ sơ, OAuth với PKCE và loopback |
| GitHub | mã thông báo tùy chọn, được mã hóa; các mục chỉ mở nếu liên kết là `https://github.com/` |
| GitLab | địa chỉ và mã thông báo tùy chọn, được mã hóa; Chỉ `https://`, không chuyển hướng, chỉ liên kết từ phiên bản đã định cấu hình |
| Cập nhật | chỉ cài đặt gói được ký bởi khóa của dự án; một bản tải xuống giả mạo sẽ bị loại bỏ trước khi chạy |

Mô hình đầy đủ, sao lưu, hợp nhất giữa các máy và nơi mỗi tệp tồn tại: [docs/seguranca.md](docs/seguranca.md).
Tìm thấy một lỗ hổng? [SECURITY.md](SECURITY.md).

## 📚 Tài liệu

| Tài liệu | Có gì trong đó |
|---|---|
| 📖 [User guide](docs/uso.md) | tab, tác vụ định kỳ, phím tắt, giao diện, khả năng truy cập, cửa sổ, cập nhật và bắt đầu với hệ thống |
| 🔌 [Integrations](docs/integracoes.md) | Google chương trình nghị sự và GitHub (mã thông báo cá nhân hoặc luồng thiết bị) |
| 🛡️ [Security and data](docs/seguranca.md) | mô hình mối đe dọa, sao lưu `.canto`, hợp nhất, thay đổi mật khẩu, tập tin trên đĩa |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetBar, Gitify và kiểm tra âm lượng |
| 📝 [CHANGELOG](CHANGELOG.md) | những gì đã thay đổi trong mỗi phiên bản |
| 🤝 [How to contribute](CONTRIBUTING.md) | môi trường, kiểm tra, PRs và cách xuất bản bản phát hành |
| 🤖 [Agent guide](AGENTS.md) | hợp đồng và bẫy cho bất kỳ ai chỉnh sửa mã bằng AI |

## 🛠️ Phát triển

Điều kiện tiên quyết: [Bun](https://bun.sh) ≥ 1,2, Rust ổn định ≥ 1,85 và
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) cho hệ thống của bạn.

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Mọi PR đều chạy CI trên Windows, macOS và Linux. `fix`, `feat` thông thường và các cam kết vi phạm được hợp nhất thành `main`
nhận thẻ SemVer, ghi chú phát hành được tạo và trình cài đặt đã ký được xây dựng song song; bản phát hành được xuất bản sau khi xác minh (chi tiết trong
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 Giấy phép

[MIT](LICENSE) © Antonio Carlos

<div align="center"><sub>Được tạo bằng 🦀 Rust, ⚛️ React và ☕ dành cho những người sống giữa các cuộc họp.</sub></div>
