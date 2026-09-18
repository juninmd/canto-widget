# Visual smoke: starts the widget, walks the vault flow and saves screenshots to shots/.
param(
  [string]$Exe = "src-tauri\target\debug\canto-widget.exe",
  [string]$OutDir = "shots",
  [string]$Password = "smoke-test-password"
)
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\ui.ps1"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Start-Process $Exe
Start-Sleep -Seconds 6
$w = Get-CantoWindow
"window: x=$($w.X) y=$($w.Y) w=$($w.W) h=$($w.H)"
Save-Screen "$OutDir\01-bottom-right-corner.png"
Save-Screen "$OutDir\02-create-vault.png" -WindowOnly

[void][Win]::SetForegroundWindow($w.Handle)
Click-Widget 0.5 0.46
Type-Text $Password
Type-Text "{TAB}"
Type-Text $Password
Type-Text "{ENTER}"
Start-Sleep -Seconds 2
Save-Screen "$OutDir\03-empty-tasks.png" -WindowOnly
