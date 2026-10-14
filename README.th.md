<div align="center">

<img src="docs/prints/readme/banner.webp" alt="Canto: your whole day in the corner of the screen. Tasks, GitHub and meeting alerts in widget windows." width="100%">

<br><br>

[![Download](https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Download-Windows%20%C2%B7%20macOS%20%C2%B7%20Linux-4ade80?style=for-the-badge&labelColor=0f172a)](https://github.com/juninmd/canto-widget/releases)

[![CI](https://img.shields.io/github/actions/workflow/status/juninmd/canto-widget/ci.yml?branch=main&style=for-the-badge&label=CI&labelColor=0f172a)](https://github.com/juninmd/canto-widget/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-4ade80?style=for-the-badge&labelColor=0f172a)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24c8db?style=for-the-badge&logo=tauri&logoColor=white&labelColor=0f172a)](https://v2.tauri.app)
[![Rust](https://img.shields.io/badge/Rust-encrypted%20core-f74c00?style=for-the-badge&logo=rust&logoColor=white&labelColor=0f172a)](src-tauri)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0f172a)](src)




<sub>[English](README.md) · [Português](README.pt-BR.md) · [Español](README.es.md) · [Français](README.fr.md) · [Italiano](README.it.md) · [日本語](README.ja.md) · [中文](README.zh.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Türkçe](README.tr.md) · [हिन्दी](README.hi.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [فارسی](README.fa.md) · [한국어](README.ko.md) · [Nederlands](README.nl.md) · [Polski](README.pl.md) · [Українська](README.uk.md) · [Čeština](README.cs.md) · [Slovenčina](README.sk.md) · [Română](README.ro.md) · [Magyar](README.hu.md) · [Svenska](README.sv.md) · [Dansk](README.da.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Ελληνικά](README.el.md) · [Български](README.bg.md) · [Hrvatski](README.hr.md) · [Српски](README.sr.md) · [Slovenščina](README.sl.md) · [Lietuvių](README.lt.md) · [Latviešu](README.lv.md) · [Eesti](README.et.md) · [Bahasa Indonesia](README.id.md) · [Bahasa Melayu](README.ms.md) · [Tiếng Việt](README.vi.md) · **ไทย** · [বাংলা](README.bn.md) · [தமிழ்](README.ta.md) · [Kiswahili](README.sw.md) · [Català](README.ca.md)</sub>

</div>

<br>

> **งานที่มีการเตือนความจำ บันทึกย่อ ประวัติคลิปบอร์ด วาระการประชุมพร้อมการแจ้งเตือนการประชุม ข้อความถอดเสียง และ GitHub PRs ของคุณ
> ในหน้าต่างเล็กๆ ที่ปักหมุดไว้ที่มุมหน้าจอ** ปรากฏขึ้นพร้อมกับ `Ctrl+Alt+Space` ซ่อนเมื่อคุณไม่ต้องการ
> และเก็บทุกอย่างเข้ารหัสไว้บนเครื่องของคุณ โดยไม่มีบัญชีและไม่มีเซิร์ฟเวอร์

## 🌐 ภาษา

Canto มี **ภาษาอินเทอร์เฟซ 42 ภาษา** โดยแต่ละภาษามี README ของตัวเอง เลือกของคุณใน **การตั้งค่า → ภาษา**;
เครื่องมือเลือกที่ค้นหาได้จะใช้ชื่อภาษาท้องถิ่น และโหมดอัตโนมัติจะเป็นไปตามภาษาระบบหลักของคุณ
ภาษาอาหรับ ฮีบรู และเปอร์เซียใช้ข้อความที่อ่านจากขวาไปซ้าย แคตตาล็อกภาษาเพิ่มเติมโหลดได้ตามความต้องการ

แค็ตตาล็อกอินเทอร์เฟซใหม่ 40 รายการและการแปล README ใหม่ 31 รายการเป็นการแปลด้วยคอมพิวเตอร์และยังไม่มี
ตรวจสอบโดยเจ้าของภาษา ภาษาโปรตุเกสและอังกฤษยังคงเป็นแค็ตตาล็อกอินเทอร์เฟซดั้งเดิม ฉลากถาดและ
หัวข้อการแจ้งเตือนเป็นไปตามภาษาที่เลือก รายละเอียดการแจ้งเตือนการรวมระบบบางส่วนกลับไปเป็นภาษาอังกฤษ
และข้อผิดพลาดของแบ็กเอนด์ยังคงเป็นภาษาโปรตุเกส ไวยากรณ์ชื่องานจะเก็บคำสำคัญภาษาโปรตุเกสและอังกฤษที่มีอยู่

![Searchable language picker](docs/prints/languages-picker.png)
![Arabic interface with right-to-left text](docs/prints/languages-ar.png)

## ✨ ทำไม Canto

<table>
<tr>
<td width="44%" align="center"><img src="docs/prints/readme/tour.gif" alt="Tour through the Tasks, Notes, Clipboard, Agenda and GitHub tabs, the meeting alert and the skins" width="300"></td>
<td>

หากคุณอยู่ระหว่างการประชุม PRs และรายการที่ค้างอยู่เล็กน้อย คุณจะเปิดแอปได้ห้าแอป Canto ใส่ทุกอย่างลงไป
ที่เดียว

🔒 **เข้ารหัสโดยค่าเริ่มต้น** Argon2id + AES-256-GCM พร้อมรหัสผ่านหลัก กุญแจนั้นมีอยู่ใน RAM เท่านั้น
Windows Hello optional.

🏠 **ข้อมูลของคุณอยู่กับคุณ** ไม่ต้องใช้การวัดทางไกล เซิร์ฟเวอร์เป็นศูนย์ ไม่ต้องใช้บัญชี การสำรองข้อมูลเป็นการเข้ารหัสเดียว
`.canto` ไฟล์

⏰ **คุณจะไม่พลาด** 1 นาทีก่อนการประชุมและเมื่อถึงเวลาเตือน วิดเจ็ตจะปรากฏขึ้น เล่นเสียง และ
ส่งการแจ้งเตือนโดย **เลื่อน 10 นาที**

🪶 **Light.** Tauri v2 (Rust + webview ของระบบ) แทน Electron: ตัวติดตั้ง 3.5 MB
[Measured numbers](docs/benchmark.md#footprint-medido).

🔄 **อัปเดตอยู่เสมอ** อัปเดตจากภายในแอปและติดตั้งเฉพาะสิ่งที่ลงนามโดยคีย์ของโปรเจ็กต์เท่านั้น

</td>
</tr>
</table>

## 🧰 Features

<table>
<tr>
<td width="36%"><img src="docs/prints/app/01-tarefas.png" alt="Today's tasks with time and recurrence"></td>
<td>

### ✅ งานที่เตือนคุณ

รายการตรวจสอบรายวันพร้อมเวลาและการเกิดซ้ำ (ทุกวัน วันธรรมดา หรือรายสัปดาห์) พิมพ์ **`Daily at 9:30am`** และ
reminder is already set; เพิ่ม **`!high`** (หรือ `!alta`, `!média`, `!baixa`) สำหรับลำดับความสำคัญ หรือคลิกจุดบนแถวเพื่อวนรอบ ชื่อยาวตัดกันแทนที่จะถูกตัดออก **ตัวจับเวลาโฟกัส** ในงานใดๆ: ให้ค่าประมาณ กด ▶ และแถบที่ปักหมุดไว้ข้างใต้ทุกแท็บจะนับเวลาเทียบกับงานนั้น (สีแดงเมื่อคุณข้ามไป) เวลาจะถูกบันทึกไว้ในห้องนิรภัยทุกนาที **สรุปวัน** พร้อมที่จะวาง (งาน เวลาที่มุ่งเน้น การประชุมพร้อมเวลาทั้งหมด PRs/MRs เปิด ผสาน ตรวจสอบ และปิดโดยไม่ต้องรวมเข้าด้วยกัน) **รายงานรายสัปดาห์และรายเดือน** ในมาร์กดาวน์ และ **ดึงรายการที่ค้างอยู่** จากเมื่อวาน

</td>
</tr>
<tr>
<td>

### 📅 เริ่มประชุมแล้วเหรอ? It tells you.

เข้าร่วมการประชุมครั้งถัดไปกับ `Ctrl+Alt+M` (`Ctrl+Cmd+M` บน macOS) หากการลงทะเบียนล้มเหลว Canto จะพยายาม
`Ctrl+Alt+Shift+M` (`Ctrl+Cmd+Shift+M` บน macOS); เมนูถาดจะยังคงใช้งานได้หากทั้งสองรายการไม่พร้อมใช้งาน

กิจกรรมวันนี้มาจาก Google ปฏิทิน (อ่านอย่างเดียว) หนึ่งนาทีก่อนหน้า วิดเจ็ตจะกระโดดขึ้นไปบนหน้าจอด้วย
**เข้าร่วม Meet** เล่นเสียงและส่งการแจ้งเตือนของระบบ ไม่ว่าคุณจะอยู่บนแท็บใดก็ตาม หรือแม้แต่แท็บนั้นถูกซ่อนอยู่ก็ตาม
การ์ดแต่ละใบจะแสดงป้ายพร้อมคำตอบของคุณ (ยอมรับ อาจ ปฏิเสธ กำลังรอ) คลิกกิจกรรมเพื่อดูว่าใครเป็นผู้จัด
มัน กำหนดการ แขกทุกคนที่มีอวตารย่อและคำตอบของพวกเขา และไฟล์แนบ เช่น บันทึกของราศีเมถุน
บรรทัดบนสุดจะบอกคุณถึง **ช่วงว่างถัดไป** อย่างน้อย 15 นาที (คำเชิญที่ถูกปฏิเสธและกิจกรรมตลอดทั้งวันจะไม่
นับ) และเหตุการณ์ที่ทับซ้อนกันจะได้รับป้าย **ข้อขัดแย้ง** เพื่อตั้งชื่อกิจกรรมอื่น มุมมอง **วันนี้** นำไปสู่การประชุมที่กำลังดำเนินอยู่ (เวลาที่เหลือ ปุ่มเข้าร่วม การเตือนการปะทะกัน) หรือรายการถัดไป จากนั้น **วันในบรรทัดเดียว** (การประชุม งาน และเวลาว่างตลอดชั่วโมงทำงาน พร้อมเวลาประชุม เวลาว่าง และข้อขัดแย้งที่นับไว้) และไทม์ไลน์เดียวที่การประชุม งานที่มีเวลา และช่องว่างที่ว่างเป็นแถวของตัวเอง: ช่องว่างเสนอให้เหมาะกับงานที่ไม่มีเวลา และสิ่งที่เกินพับไปแล้ว

</td>
<td width="36%"><img src="docs/prints/app/22-agenda-detalhes-evento.png" alt="Event details with your answer badge, organizer avatar, guest list with answers and Gemini notes"></td>
</tr>
<tr>
<td><img src="docs/prints/app/02-notas.png" alt="Note cards with tags and a pinned note"></td>
<td>

### 🗒️ บันทึกเป็นการ์ด

การ์ดที่ค้นหาได้ด้วย `#tags` ปักหมุดไว้ด้านบนและตัวกรองแท็กเพียงคลิกเดียว การ์ดแต่ละใบจะแสดงจุดเริ่มต้นของบันทึก **แสดงผล** (ชื่อ รายการตรวจสอบ รหัส ลิงก์) ไม่ใช่การมาร์กดาวน์แบบดิบ **โปรแกรมแก้ไขแบบ WYSIWYG** พร้อมขนาดกะทัดรัด
แถบการจัดรูปแบบ (ตัวหนา ตัวเอียง รหัส หัวเรื่อง รายการ รายการตรวจสอบที่คุณทำเครื่องหมายในข้อความ บล็อกโค้ดพร้อมไวยากรณ์
การไฮไลต์ ลิงก์ รูปภาพ) และทางลัดมาร์กดาวน์ในขณะที่คุณพิมพ์ (`# `, `- `, `[ ] `, ` ``` `); การสลับ **MD**
แสดงมาร์กดาวน์แบบ Raw ซึ่งยังคงเป็นวิธีการจัดเก็บ ค้นหา ซิงค์ และส่งออกโน้ต ลิงค์เปิดด้วย
`Ctrl`+คลิก http เท่านั้น วาง วาง หรือแนบรูปภาพ (PNG, JPEG, GIF, WebP สูงสุด 2 MB) แต่ละภาพปิดผนึกอยู่ในตัวของมันเอง
ไฟล์ที่เข้ารหัสซึ่งแสดงอยู่ภายในบันทึกย่อและเป็นรูปขนาดย่อบนการ์ด พวกเขาอยู่บนเครื่องนี้ ข้างนอก `.canto`
การสำรองข้อมูล จัดการบันทึกย่อนับพันรายการ: รายการมีเพจและการค้นหาครอบคลุมทั้งหมด

</td>
</tr>
<tr>
<td>

### 📋 คลิปบอร์ดที่ไม่เคยลืม (หรือรั่วไหล)

ประวัติที่เข้ารหัสพร้อมการค้นหาและพิน จดจำลิงก์ สี และรหัส เลื่อนรายการเพื่อ **คัดลอกรายการที่เขียนใหม่**:
JSON อยู่ในรูปแบบหรือกะทัดรัด ข้อความในบรรทัดเดียว ตัวพิมพ์ใหญ่หรือตัวพิมพ์เล็ก (รายการประวัติจะคงอยู่เหมือนเดิม) สำเนาขนาดยักษ์ (บันทึกขนาด 100 MB) ไม่มี
หยุดทุกอย่าง: มันจะสตาร์ทและเตือนคุณ บน Windows มันจะข้ามสิ่งที่ผู้จัดการรหัสผ่านทำเครื่องหมายเป็น
ละเอียดอ่อน

</td>
<td><img src="docs/prints/app/03-clipboard.png" alt="Clipboard history with a link, a large log and code"></td>
</tr>
<tr>
<td><img src="docs/prints/app/05-github.png" alt="GitHub tab with review requested, assigned and a stalled PR"></td>
<td>

### 🐙 GitHub ของคุณโดยสรุป

**ขอการตรวจสอบจากฉัน** มอบหมายให้ฉัน PRs และปัญหาที่ฉันเปิด โดยมี PR หรือไอคอนปัญหา และใครเป็นผู้เปิด
มัน. ฉบับร่าง PRs **กำลังรอการตรวจทานของคุณ** และ PRs **จนตรอก** เป็นเวลาหนึ่งสัปดาห์โดดเด่น และ PR แต่ละรายการจะมีขนาดเล็ก
**ตรา CI** (ผ่าน ล้มเหลว กำลังทำงาน หรือไม่มี CI) จากการตรวจสอบของหัวหน้า เมื่อมีคน**ร้องขอของคุณ
ตรวจสอบ** การแจ้งเตือนของระบบปฏิบัติการจะแจ้งให้คุณทราบ (เปิดโดยค่าเริ่มต้น ให้ปิดในการตั้งค่า) กรองตามข้อความ `repo:` หรือ `label:`, PRs เท่านั้นหรือเฉพาะประเด็นเท่านั้น จัดเรียงตามการอัปเดต การสร้าง หรือความคิดเห็น และ
เลื่อนด้วย **แสดงเพิ่มเติม** นอกจากนี้ยังสนับสนุน **GitLab.com และ GitLab** ที่โฮสต์เองด้วยแคช 5 นาทีที่
เคารพขีดจำกัดอัตรา ลงชื่อเข้าใช้ด้วยโทเค็นส่วนตัวแบบอ่านอย่างเดียวหรือจากเบราว์เซอร์ (การไหลของอุปกรณ์)

</td>
</tr>
<tr>
<td>

### ⚙️ การตั้งค่าและการอัปเดตอัตโนมัติ

การเปลี่ยนรหัสผ่านหลัก, Windows Hello, การสำรองข้อมูล `.canto`, โฟลเดอร์ที่ซิงค์พร้อมการรวมอัตโนมัติ (Dropbox,
OneDrive, Syncthing...) เริ่มต้นด้วยระบบและส่วน **อัปเดต** พร้อมด้วย **เวอร์ชันที่ติดตั้ง** และ
**เผยแพร่ล่าสุด** เคียงข้างกัน และปุ่มสำหรับอัปเดตและรีสตาร์ท

</td>
<td><img src="docs/prints/app/18-atualizacoes.png" alt="Settings showing installed version, latest published version and the update button"></td>
</tr>
</table>

นอกจากนี้ยังมี 🎙️ **การประชุม** ซึ่งเป็นแท็บย่อยของวาระการประชุมถัดจากรายการและวัน: บันทึกและการถอดเสียงของราศีเมถุนจาก
สองสัปดาห์ที่ผ่านมา บวกกับการถอดเสียง `.vtt`, `.srt`, `.txt` และ `.md` จากโฟลเดอร์ในเครื่อง ทำความสะอาดและค้นหาได้

🤖 **โมเดล AI** (บนแถบแท็บโดยค่าเริ่มต้น **ไม่มีคีย์หรือบัญชี API**): LLM จัดอันดับโดย
[Artificial Analysis](https://artificialanalysis.ai) **ดัชนีสติปัญญา** อ่านจากหน้ากระดานผู้นำสาธารณะ
ด้วยแถบคะแนน ผู้สร้าง ราคาต่อโทเค็น 1M และความเร็ว จัดเรียงตามสติปัญญา ราคา หรือความเร็ว มันรับที่
มากที่สุดทุกๆ 3 ชั่วโมง และการเลือกใช้ 🔔 จะแจ้งให้คุณทราบเมื่อ
รุ่น **เข้าสู่ 10 อันดับแรก** หรือ **ปีนเข้าไปข้างใน** (ตรวจสอบทุกๆ 6 ชั่วโมงในขณะที่ห้องนิรภัยถูกปลดล็อค) ด้วย
ป้าย "ใหม่" และ "ขึ้น" เป็นเวลาหนึ่งสัปดาห์

🌙 **ห้ามรบกวน:** ในการตั้งค่าหรือถาด ปิดเสียงการแจ้งเตือนการประชุม การแจ้งเตือนงาน การแจ้งเตือนสถานะ และทุก ๆ
การแจ้งเตือนระบบเป็นเวลา 30 นาที 1 ชั่วโมง 2 ชั่วโมง จนถึงวันพรุ่งนี้หรือจนกว่าคุณจะปิด พระจันทร์ในแถบด้านบนปรากฏขึ้น
เมื่อมันจบลง; คลิกเพียงครั้งเดียวก็จะปิดอีกครั้ง มันรอดจากการรีสตาร์ทและจบลงด้วยตัวเอง

⌨️ **ทุกอย่างด้วยแป้นพิมพ์:** `Alt+1`…`Alt+7` สลับแท็บ, `N` สร้าง, `/` การค้นหา, `F11` เต็มหน้าจอ, `Alt+L`
ล็อคและ `?` แสดงรายการทางลัด `Ctrl+Shift+P` (`Cmd+Shift+P` บน macOS) เปิด **ชุดคำสั่ง** ด้วยทุก ๆ
การดำเนินการตามชื่อ: ไปที่แท็บ งานใหม่หรือบันทึกย่อ เข้าร่วมการประชุมครั้งถัดไป คัดลอกสรุปของวัน สลับสกิน ล็อค

## 🎨 ห้าสกิน

<table>
<tr>
<td align="center"><img src="docs/prints/app/01-tarefas.png" alt="Default skin" width="200"><br><b>ค่าเริ่มต้น</b></td>
<td align="center"><img src="docs/prints/app/17-skin-hueco-mundo.png" alt="Hueco Mundo skin" width="200"><br><b>ฮูเอโก มุนโด</b></td>
<td align="center"><img src="docs/prints/app/14-skin-dracula.png" alt="Dracula skin" width="200"><br><b>แดร็กคูล่า</b></td>
<td align="center"><img src="docs/prints/app/11-skin-clara.png" alt="Light skin" width="200"><br><b>แสง</b></td>
</tr>
</table>

และ **ติดตามระบบ** ซึ่งจะสลับระหว่างแสงและความมืดพร้อมกับระบบปฏิบัติการ ผ่านคอนทราสต์ AA ทั้งหมด

<details>
<summary>🖥️ หน้าจอเพิ่มเติม: การเริ่มต้นใช้งาน การค้นหาทั่วโลก ชุดคำสั่ง GitLab งานย่อย โปรแกรมแก้ไขบันทึก ความปลอดภัย การซิงค์ ความหนาแน่น และอื่นๆ อีกมากมาย</summary>

<br>

![GitHub tab in fullscreen](docs/prints/app/12-tela-cheia.png)

| ยินดีต้อนรับรันครั้งแรก | ค้นหาทั่วโลก (`Ctrl+K`) | แท็บ GitLab ที่โฮสต์เอง | แจ้งเตือนการประชุม |
|---|---|---|---|
| ![Onboarding with the essential shortcuts](docs/prints/app/19-onboarding.png) | ![Search across tasks, notes and clipboard at once](docs/prints/app/20-busca-global.png) | ![Review requested, assigned and issues on self-hosted GitLab](docs/prints/app/21-gitlab.png) | ![Meeting alert with join Meet and snooze](docs/prints/app/07-aviso-reuniao.png) |

| งานที่มีงานย่อย ลำดับความสำคัญ และ PR | ตัวแก้ไขบันทึกย่อ | ประเภทคลิปบอร์ดเพิ่มเติม | ความปลอดภัย: ล็อคอัตโนมัติและปลดล็อค |
|---|---|---|---|
| ![Checklist, priority and PR link on a task](docs/prints/app/23-tarefas-detalhes.png) | ![Note editor with a checklist and a highlighted SQL block](docs/prints/app/24-notas-markdown.png) | ![Clipboard recognizing link, color, json, e-mail and phone](docs/prints/app/25-clipboard-tipos.png) | ![Configurable auto-lock and a log of the latest unlocks](docs/prints/app/26-ajustes-seguranca.png) |

| โฟลเดอร์ที่ซิงค์ | ความหนาแน่นกะทัดรัด | ห้องนิรภัยที่ถูกล็อค | เชื่อมต่อ GitHub |
|---|---|---|---|
| ![Settings pointing at a Dropbox folder](docs/prints/app/27-ajustes-sync.png) | ![Compact interface on the Tasks tab](docs/prints/app/28-densidade-compacta.png) | ![Password screen with Windows Hello](docs/prints/app/09-cofre-trancado.png) | ![Connect with a token or from the browser](docs/prints/app/10-github-conectar.png) |

| โหมด: มินิ, ซ่อน, ปกติ, ขยายใหญ่สุด | โหมดมินิ: แจ้งเตือนที่ขอบหน้าจอ |
|---|---|
| ![The mode icon in the header opens a menu with Mini, Hidden, Normal and Maximized](docs/prints/app/62-modos-menu.png) | ![The edge dock: one colored bar per pending alert, with icons on hover and the text of the one under the pointer](docs/prints/app/63-modo-mini.png) |

| คลิกการแจ้งเตือนใน Dock | ขยายใหญ่สุด: งานและการแจ้งเตือน พร้อมตัวแบ่งแบบลากได้ |
|---|---|
| ![The normal window opens with the meeting alert on top: join Meet, snooze and close](docs/prints/app/64-aviso-em-foco.png) | ![Fullscreen with the task list on the left, a draggable divider and the notifications column on the right: pending alerts with their actions and what was resolved today](docs/prints/app/65-modo-maximizado.png) |

| มินิ: เมนูโหมดจะเปิดขึ้นภายในหน้าต่างท่าเรือ |
|---|
| ![The mode menu in the dock window: Mini, Hidden, Normal and Maximized, fully visible beside the alert icons](docs/prints/app/67-modo-mini-menu.png) |

| แท็บที่ไม่พอดีจะรออยู่ในเมนู "เพิ่มเติม" |
|---|
| ![On a narrow window the last tabs go to a more menu instead of being cut; the open tab always stays on the bar](docs/prints/app/66-abas-mais.png) |

| เกมและเต็มหน้าจอ: การแจ้งเตือนรอจนกว่าคุณจะออก |
|---|
| ![Settings with the Games and full screen option: wait for full screen to end before alerting, so a pop-up or toast never minimizes a game](docs/prints/app/68-ajustes-tela-cheia.png) |

| เลื่อน: 1, 5 หรือ 10 นาที |
|---|
| ![Task reminder with a snooze button split in two: the main value and a dropdown with 1, 5 and 10 minutes](docs/prints/app/58-adiar-opcoes.png) |

| การแจ้งเตือนงาน | เปลี่ยนรหัสผ่านหลัก | สถานะ API (แท็บเลือกใช้) | ภาษา: อังกฤษหรือโปรตุเกส |
|---|---|---|---|
| ![Reminder with complete and snooze](docs/prints/app/08-lembrete-tarefa.png) | ![Password change form](docs/prints/app/13-trocar-senha.png) | ![Status API as a grid of mini cards: down, degraded, maintenance and operational services, with a bell to get notified, Magalu Cloud included](docs/prints/app/29-status-api.png) | ![Settings in English with the language picker: automatic, Português (Brasil), English](docs/prints/app/30-idioma-ingles.png) |

| คัดลอกคลิปที่เขียนใหม่ | แจ้งเตือนการประชุมด้วย เตรียม |
|---|---|
| ![Hovering a text clip offers one line, UPPERCASE and lowercase](docs/prints/app/29-clipboard-transformar.png) | ![The meeting alert lists earlier notes with the same title and offers to create today's note](docs/prints/app/07-aviso-reuniao.png) |

| ออกแบบใหม่: แท็บงาน ก่อนและหลัง |
|---|
| ![Before and after of the Tasks tab: header with icons, tabs with an underline, progress bar, round checkbox, priority rail and metadata pills](docs/prints/app/59-antes-depois-tarefas.png) |

| ออกแบบใหม่: ทุกแท็บ ก่อน (บน) และหลัง (ล่าง) |
|---|
| ![Tasks, Notes, Clipboard, Agenda, GitHub, Status, Models and Settings before and after the redesign](docs/prints/app/60-antes-depois-todas-as-abas.png) |

| CI ล้มเหลวด้วยงานพัง | มีคนพูดถึงฉัน | สวิตช์ของพวกเขาอยู่ในการตั้งค่า |
|---|---|---|
| ![Pop-up with a pull request whose CI failed, listing the failed jobs and their steps](docs/prints/app/55-aviso-meus-prs.png) | ![Pop-up when someone mentions me on GitLab, with the text and the link](docs/prints/app/57-aviso-mencao.png) | ![Settings: CI failed, PR without a review for 24, 48 or 72 hours, and mentions](docs/prints/app/56-ajustes-meus-prs.png) |

| เปลี่ยนรหัสผ่านแล้ว มีหนึ่งไฟล์ที่รอดำเนินการ | สรุปวัน |
|---|---|
| ![Toast asking to lock and unlock to finish updating one file](docs/prints/app/31-senha-pendente.png) | ![Day summary with tasks, meetings and their total time, opened, merged and reviewed PRs/MRs](docs/prints/app/32-resumo-do-dia.png) |

| รายงานประจำสัปดาห์ | วาระการประชุม: เวลาว่างและข้อขัดแย้งครั้งต่อไป |
|---|---|
| ![Weekly report in markdown: totals, one line per workday, tasks done, notes, meetings grouped by title and PRs/MRs](docs/prints/app/40-relatorio-semanal.png) | ![Agenda with "next free time: 09:45–10:00 (15 min)" on top and two overlapping events marked as conflict](docs/prints/app/33-agenda-tempo-livre.png) |

| วาระการประชุม: ฟรีตอนนี้ | ชุดคำสั่ง (`Ctrl+Shift+P`) |
|---|---|
| ![Agenda saying "free now until 13:00" because the lunch invite was declined](docs/prints/app/34-agenda-livre-agora.png) | ![Command palette listing tabs, new task, global search, join the next meeting and skins, with their shortcuts](docs/prints/app/38-paleta-comandos.png) |

| ห้ามรบกวน | รูปภาพในบันทึกย่อ |
|---|---|
| ![Top-bar moon showing the end time and the Do not disturb section in Settings, on until 15:30](docs/prints/app/39-nao-perturbe.png) | ![Note editor with an attached whiteboard sketch between the text and a checklist](docs/prints/app/37-notas-imagem.png) |

| ป้าย CI ทุกๆ PR | การแจ้งเตือนคำขอตรวจสอบ |
|---|---|
| ![GitHub tab where each PR shows a CI badge: passed, running and failed](docs/prints/app/35-ci-no-card.png) | ![Settings with the switch to be notified when someone requests your review on GitHub](docs/prints/app/36-ajustes-revisao.png) |

| หมายเหตุภาพเป็นภาพขนาดย่อ | โปรแกรมแก้ไขบันทึกย่อแบบ WYSIWYG |
|---|---|
| ![Notes list where cards show their attached images as thumbnails under the text](docs/prints/app/41-notas-miniaturas.png) | ![Note editor with the formatting bar, a heading, a checklist, a SQL block and an attached sketch](docs/prints/app/42-notas-editor.png) |

| ตัวแก้ไขหมายเหตุ: raw markdown (MD) | แก้ไขหมายเหตุบนผิวสีอ่อน |
|---|---|
| ![The same note in the raw markdown mode, with the image reference and its thumbnail](docs/prints/app/43-notas-editor-markdown.png) | ![The WYSIWYG note editor on the light skin](docs/prints/app/44-notas-editor-claro.png) |

| งาน: ลำดับความสำคัญในแถว, หัวเรื่องยาวตัด | รายการบันทึกย่อพร้อมมาร์กดาวน์ที่แสดงผล |
|---|---|
| ![Task list where each row shows its priority dot, a long title wraps over several lines and the time sits under the title](docs/prints/app/45-tarefas-prioridade.png) | ![Note cards showing a heading, a checklist, a code block and a numbered list rendered instead of raw markdown](docs/prints/app/46-notas-card-markdown.png) |

| โมเดล AI จัดอันดับโดย Intelligence Index |
|---|
| ![AI models tab with fictitious models ranked by Intelligence Index: rank, creator, "new" and "up" badges, score bar, price per 1M tokens and tokens per second, sort toggle and alert bell](docs/prints/app/47-modelos-ia.png) |

| การแจ้งเตือนซ้อนทับสำหรับทุกสิ่งที่ค้างอยู่: การหยุดทำงาน การประชุม งาน และโมเดล AI ใหม่ |
|---|
| ![Alert overlay with mini cards for a service outage, a meeting starting and a new model; the outage is detailed with its state, since when and the status page button](docs/prints/app/51-avisos-pendentes.png) |

</details>

| จุดสิ้นสุดของฉัน: เรียงต่อกันด้วยเวลาแฝงล่าสุด | จุดสิ้นสุดแบบเปิด: แผนภูมิเวลาแฝง ขีดจำกัด และการตั้งค่าการแจ้งเตือน | การเพิ่ม DNS + ตรวจสอบใบรับรอง |
|---|---|---|
| ![Status API, My endpoints sub-tab: a grid of tiles with latency, recent readings and certificate days](docs/prints/app/76-endpoints-grade.png) | ![An endpoint open over the whole row with the latency chart, the limit line and the stats](docs/prints/app/77-endpoints-aberto.png) | ![The new endpoint form with the DNS + certificate kind selected](docs/prints/app/78-endpoints-novo.png) |

| กำหนดการของวันใดๆ: ลูกศรก่อนหน้าและถัดไป ตัวเลือกวันที่ และปุ่มย้อนกลับไปยังวันนี้ |
|---|
| ![Agenda tab on tomorrow with the day stepper, the first meeting and the day in one line](docs/prints/app/75-agenda-dia.png) |

| งาน: งานปัจจุบันพร้อมตัวจับเวลาและรายการที่จัดกลุ่ม | GitHub: แถบสรุปเหนือรายการ | GitLab: แถบเดียวกัน โดยไม่มีไทล์ CI |
|---|---|---|
| ![Tasks tab with a card for the next task, its timer and estimate, and the list split into pending and done](docs/prints/app/72-tarefas-agora.png) | ![GitHub tab with reviews, my PRs, failed CI and my issues counted above the lists](docs/prints/app/73-github-resumo.png) | ![GitLab tab with the same summary strip, without CI](docs/prints/app/74-gitlab-resumo.png) |

| ตัวจับเวลาโฟกัสถูกปักหมุดไว้ใต้ทุกแท็บ | วาระการประชุมรายวันงานนอกเหนือจากการประชุม |
|---|---|
| ![Task list with estimates, the time spent on each and a bar pinned at the bottom counting the task in focus](docs/prints/app/47-tarefas-foco.png) | ![Agenda Today view: the meeting in progress with time left and a conflict warning, then the day in one line with meeting time, free time and conflicts](docs/prints/app/54-agenda-hoje.png) |

| มุมมองวัน: เหตุการณ์ที่ทับซ้อนกันจะใช้ความกว้างร่วมกัน |
|---|
| ![Agenda timeline: meetings, a task with a time and the free gaps as rows, each gap offering to fit an untimed task](docs/prints/app/55-agenda-linha.png) |

| ตรวจสอบเรดาร์: คำขอที่เก่าที่สุดก่อน เลยกำหนดเป็นสีแดง เลื่อน |
|---|
| ![GitHub tab where review requests are listed oldest first, the one past 48 hours in red, each with a snooze 4 h link](docs/prints/app/54-radar-de-revisao.png) |

| การประชุมเป็นแท็บย่อยของวาระ ถัดจากรายการและวัน |
|---|
| ![Agenda tab with the Today and Meetings sub-tabs, the Meetings one selected: folder, search box and three fictitious transcripts](docs/prints/app/52-agenda-reunioes.png) |

| แท็บกิจกรรม (ปิดโดยค่าเริ่มต้น) | สรุปพร้อมเวลาที่โฟกัสและปิด PRs/MRs |
|---|---|
| ![Activity tab redesigned: a donut by category with the total inside and a legend that filters, the daily code-focus goal with its streak dots, three highlights, a timeline on one time axis and the lists of applications and tasks, marked as local-only](docs/prints/app/49-atividade.png) | ![Day summary listing focused time per task and the PRs/MRs opened, merged, reviewed and closed without merging](docs/prints/app/50-resumo-encerrados.png) |

| แทป กิจกรรม 7 วันที่ผ่านมา | แท็บกิจกรรม ปิด | แท็บกิจกรรมบนหน้าต่างกว้าง |
|---|---|---|
| ![Activity tab on the week view: stacked columns per day with the average line and a dot under each day that met the goal, then the hour heat map](docs/prints/app/69-atividade-semana.png) | ![Activity tab turned off: what is kept and what never is, then the button to turn tracking on](docs/prints/app/70-atividade-desligada.png) | ![Activity tab on a wide window: summary and goal on the left, timeline and lists on the right](docs/prints/app/71-atividade-janela-larga.png) |

แท็บ **กิจกรรม** เริ่มซ่อน (เปิดได้ในการตั้งค่า → แท็บที่มองเห็นได้) จะบันทึกเฉพาะชื่อเท่านั้น
แอปพลิเคชันที่เน้นในขณะที่คุณใช้คอมพิวเตอร์ในไฟล์ในเครื่องที่ปิดผนึกซึ่งไม่เคยเข้าถึงการสำรองข้อมูลหรือซิงค์ (Wayland
ไม่สามารถรายงานหน้าต่างที่โฟกัสได้ ดังนั้นจึงใช้งานไม่ได้อยู่ที่นั่น) ปิดจนกว่าคุณจะเลือก และหน้าจอแรกบอกว่าอะไร
ถูกเก็บไว้และสิ่งที่ไม่เคยเป็น

- **วัน**: โดนัทตามหมวดหมู่ที่มียอดรวมอยู่ภายใน ซึ่งมีคำอธิบายซ่อนหมวดหมู่ไว้ โดยการเปลี่ยนแปลงเทียบกับวัน
ก่อนและเวลาว่าง (ไม่ใช้แป้นพิมพ์หรือเมาส์เป็นเวลา 2 นาที) ด้านล่างคือเป้าหมายการเน้นโค้ดรายวันพร้อมแนวและ
หนึ่งจุดต่อวัน ไฮไลท์สามจุด (ความยาวที่ยาวที่สุดในแอปเดียว การสลับแอป ชั่วโมงเร่งด่วน) ไทม์ไลน์โดยรวม
วัน ช่วงที่ไม่ได้ใช้งานและแอปที่ยุ่งที่สุดจะแชร์แกนเวลาเดียวกับเครื่องหมาย "ตอนนี้" และรายการแอปพลิเคชัน
(แตะหนึ่งรายการเพื่อเปลี่ยนหมวดหมู่) หรืองานที่ตัวจับเวลาโฟกัสทำงานอยู่
- **สัปดาห์**: คอลัมน์แบบเรียงซ้อนต่อวันโดยมีเส้นเฉลี่ยและจุดใต้แต่ละวันที่บรรลุเป้าหมาย แผนที่ความร้อนหนึ่งชั่วโมง
ด้วยจุดสูงสุดของคุณและรายการเดิมตลอดทั้งสัปดาห์
- **เค้าโครงและสกิน**: หนึ่งคอลัมน์ในหน้าต่างเริ่มต้น สองคอลัมน์เมื่อมีความกว้าง (ขยายใหญ่สุด) ทุกผิวมีของตัวเอง
หมวดหมู่สี ตรวจสอบคอนทราสต์แล้ว เมนูถัดจากวันจะคัดลอกเป็นข้อความ

<sub>ภาพหน้าจอทั้งหมดใช้ข้อมูลสมมติ</sub>

## ⚖️ เทียบกับสิ่งที่อยู่ข้างนอกแล้ว

ไม่มีเครื่องมือใดที่วิจัยครอบคลุมมากกว่าสองด้านเหล่านี้ในคราวเดียว ที่มาและรายละเอียดใน
[docs/benchmark.md](docs/benchmark.md).

| | งาน + การแจ้งเตือน | หมายเหตุ | คลิปบอร์ด | การประชุม | GitHub | การเข้ารหัสภายในเครื่องตามค่าเริ่มต้น |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Canto** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| สิ่งที่ต้องทำ / TickTick | ✅ | ➖ | — | — | — | — |
| ออบซิเดียน / จอปลิน | ➖ | ✅ | — | — | — | ➖ ซิงค์เท่านั้น |
| เรย์แคสต์ | ➖ | ✅ | ✅ | ➖ | ➖ | ? |
| CopyQ / เหมือนกัน | — | — | ✅ | — | — | ➖ ตัวเลือก |
| มีทติ้งบาร์ | — | — | — | ✅ | — | ไม่มี |
| กิตติฟาย | — | — | — | — | ✅ | ไม่มี |

<sub>✅ เนทิฟ · ➖ บางส่วน ผ่านส่วนขยาย หรือทางเลือก · — ไม่มี · ? ไม่ได้เผยแพร่ · ไม่มี ไม่จัดเก็บข้อมูลผู้ใช้</sub>

สิ่งที่เกณฑ์มาตรฐานนำมาที่นี่: **เวลาที่ถูกต้องในชื่องาน** (Todoist/TickTick) **เลื่อนการแจ้งเตือน**
(TickTick) และ **คลิปบอร์ดที่เคารพผู้จัดการรหัสผ่าน** (CopyQ/Ditto)

## ⬇️ ติดตั้ง

ดาวน์โหลดตัวติดตั้งสำหรับแพลตฟอร์มของคุณจาก **[Releases](https://github.com/juninmd/canto-widget/releases)**:

| ระบบ | ไฟล์ |
|---|---|
| 🪟 วินโดว์ 10/11 | `Canto_x.y.z_x64-setup.exe` (แนะนำ) หรือ `.msi` |
| 🍎 macOS | `.dmg` สำหรับ Apple Silicon หรือ Intel |
| 🐧 ลินุกซ์ | `.AppImage`, `.deb` หรือ `.rpm` |

1. ในการรันครั้งแรก คุณจะต้องสร้าง **รหัสผ่านหลัก** ไม่มีการกู้คืน: ลืมรหัสผ่าน สูญเสียข้อมูล
2. `Ctrl+Alt+Space` (`Cmd+Shift+Space` บน macOS) แสดงและซ่อนวิดเจ็ต
3. เสร็จแล้ว. เมื่อมีการจัดส่งเวอร์ชันใหม่ Canto จะแจ้งให้คุณทราบ และ **การตั้งค่า → อัปเดต** จะอัปเดตได้ในคลิกเดียว

> [!หมายเหตุ]
> ตัวติดตั้งยังไม่ได้ลงนามด้วยรหัส: SmartScreen (Windows) และ Gatekeeper (macOS) เตือนเมื่อเปิดตัวครั้งแรก
> การอัปเดตอัตโนมัติได้รับการตรวจสอบตามลายเซ็นของโปรเจ็กต์ก่อนดำเนินการ

รายการสำเร็จรูปสำหรับ winget และ Homebrew (รวมถึงโครงกระดูกสำหรับ Flatpak ซึ่งปัจจุบันถูกบล็อก) อาศัยอยู่ใน
[`packaging/`](packaging/README.md) — จัดทำและตรวจสอบภายในเครื่อง แต่ยังไม่ได้เผยแพร่ไปยังสิ่งเหล่านั้น
repositories: publishing is a manual decision and action by the maintainer.

## 🔒 สรุปความปลอดภัย

| เลเยอร์ | การป้องกัน |
|---|---|
| ห้องนิรภัย | Argon2id (19 MiB, t=2) → AES-256-GCM, nonce ใหม่ในทุกการเขียน, การเขียนแบบอะตอมมิกด้วย `fsync` |
| คีย์ | RAM เท่านั้น ล็อคเป็นศูนย์ ล็อคอัตโนมัติที่กำหนดค่าได้ (ไม่ได้ใช้งาน 5 ถึง 60 นาที โดยค่าเริ่มต้น 15 นาที) |
| เครือข่าย | เฉพาะกระบวนการ Rust เท่านั้นที่พูดคุยกับเครือข่าย webview ไม่มีต้นกำเนิดระยะไกล (CSP) และไม่เคยเห็นโทเค็น |
| Google | ตัวเลือก เฉพาะ `calendar.events.readonly`, `directory.readonly` (รูปภาพของเพื่อนร่วมงาน Workspace ในรายชื่อแขก) พร้อมโปรไฟล์ OAuth พร้อม PKCE และ loopback |
| GitHub | โทเค็นที่เข้ารหัสหรือไม่ก็ได้ รายการจะเปิดเฉพาะในกรณีที่ลิงก์เป็น `https://github.com/` |
| GitLab | ที่อยู่และโทเค็นที่เข้ารหัสหรือไม่ก็ได้ `https://` เท่านั้น ไม่มีการเปลี่ยนเส้นทาง ลิงก์จากอินสแตนซ์ที่กำหนดค่าเท่านั้น |
| อัพเดท | ติดตั้งเฉพาะแพ็คเกจที่ลงนามโดยรหัสของโครงการ การดาวน์โหลดที่ถูกดัดแปลงจะถูกยกเลิกก่อนที่จะรัน |

โมเดลเต็ม สำรองข้อมูล ผสานข้ามเครื่อง และตำแหน่งที่แต่ละไฟล์อยู่: [docs/seguranca.md](docs/seguranca.md)
พบข้อบกพร่อง? [SECURITY.md](SECURITY.md).

## 📚 เอกสารประกอบ

| เอกสาร | มีอะไรอยู่ในนั้น |
|---|---|
| 📖 [User guide](docs/uso.md) | tabs, recurring tasks, shortcuts, skins, accessibility, window, updates and start with the system |
| 🔌 [Integrations](docs/integracoes.md) | Google agenda and GitHub (personal token or device flow) |
| 🛡️ [Security and data](docs/seguranca.md) | threat model, `.canto` backup, merge, password change, files on disk |
| 📊 [Benchmark](docs/benchmark.md) | Todoist, TickTick, Obsidian, Joplin, Raycast, PowerToys, CopyQ, Ditto, MeetingBar, Gitify และการทดสอบระดับเสียง |
| 📸 [CHANGELOG](CHANGELOG.md) | สิ่งที่เปลี่ยนแปลงไปในแต่ละเวอร์ชั่น |
| 🤝 [How to contribute](CONTRIBUTING.md) | สภาพแวดล้อม การทดสอบ PRs และวิธีการเผยแพร่รุ่น |
| 🤖 [Agent guide](AGENTS.md) | สัญญาและกับดักสำหรับใครก็ตามที่แก้ไขโค้ดด้วย AI |

## 🛠️ การพัฒนา

ข้อกำหนดเบื้องต้น: [Bun](https://bun.sh) ≥ 1.2, เสถียร Rust ≥ 1.85 และ
[Tauri v2 dependencies](https://v2.tauri.app/start/prerequisites/) สำหรับระบบของคุณ

```bash
bun install
bun run tauri dev                                        # app with hot reload
bun run lint && bun test                                 # types and UI tests
bun run build && cd src-tauri && cargo clippy --all-targets -- -D warnings && cargo test
bun run tauri build                                      # installer for the current platform
```

Every PR runs CI on Windows, macOS and Linux. `fix` แบบธรรมดา, `feat` และการทำลายคอมมิตถูกรวมเข้ากับ `main`
get a SemVer tag, generated release notes and signed installers built in parallel; การเผยแพร่เผยแพร่หลังจากการตรวจสอบแล้ว (รายละเอียดใน
[CONTRIBUTING.md](CONTRIBUTING.md#publicar-uma-versão)).

## 📄 ใบอนุญาต

[MIT](LICENSE) © อันโตนิโอ คาร์ลอส

<div align="center"><sub>Made with 🦀 Rust, ⚛️ React and ☕ for those who live between meetings.</sub></div>
