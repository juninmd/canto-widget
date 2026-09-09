# Homologacao visual: sobe o widget, exercita o fluxo e grava prints em shots/.
param(
  [string]$Exe = "src-tauri\target\debug\canto-widget.exe",
  [string]$OutDir = "shots",
  [string]$Senha = "senha-de-homologacao"
)
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\ui.ps1"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Start-Process $Exe
Start-Sleep -Seconds 6
$w = Get-CantoWindow
"janela: x=$($w.X) y=$($w.Y) w=$($w.W) h=$($w.H)"
Save-Screen "$OutDir\01-canto-inferior-direito.png"
Save-Screen "$OutDir\02-criar-cofre.png" -WindowOnly

[void][Win]::SetForegroundWindow($w.Handle)
Click-Widget 0.5 0.46
Type-Text $Senha
Type-Text "{TAB}"
Type-Text $Senha
Type-Text "{ENTER}"
Start-Sleep -Seconds 2
Save-Screen "$OutDir\03-tarefas-vazio.png" -WindowOnly
