# Helpers de homologação visual: captura de tela e input sintético no widget.
Add-Type -AssemblyName System.Drawing, System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public struct RECT { public int Left, Top, Right, Bottom; }
public class Win {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, int x, int y, uint d, IntPtr e);
  [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p, IntPtr c, string cls, string win);
}
"@

function Get-CantoWindow {
  $p = Get-Process canto-widget -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { throw "processo canto-widget sem janela visivel" }
  $r = New-Object RECT
  [void][Win]::GetWindowRect($p.MainWindowHandle, [ref]$r)
  [pscustomobject]@{ Handle = $p.MainWindowHandle; X = $r.Left; Y = $r.Top; W = $r.Right - $r.Left; H = $r.Bottom - $r.Top }
}

function Save-Screen([string]$Path, [switch]$WindowOnly) {
  $b = [System.Windows.Forms.SystemInformation]::VirtualScreen
  $x = $b.X; $y = $b.Y; $w = $b.Width; $h = $b.Height
  if ($WindowOnly) { $win = Get-CantoWindow; $x = $win.X; $y = $win.Y; $w = $win.W; $h = $win.H }
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($x, $y, 0, 0, $bmp.Size)
  $g.Dispose()
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  "$Path ($w x $h)"
}

# Clique em coordenada relativa (0..1) da janela do widget.
function Click-Widget([double]$fx, [double]$fy) {
  $w = Get-CantoWindow
  [void][Win]::SetForegroundWindow($w.Handle)
  [void][Win]::SetCursorPos([int]($w.X + $w.W * $fx), [int]($w.Y + $w.H * $fy))
  Start-Sleep -Milliseconds 120
  [Win]::mouse_event(0x02, 0, 0, 0, [IntPtr]::Zero)
  [Win]::mouse_event(0x04, 0, 0, 0, [IntPtr]::Zero)
  Start-Sleep -Milliseconds 250
}

function Type-Text([string]$text) {
  [System.Windows.Forms.SendKeys]::SendWait($text)
  Start-Sleep -Milliseconds 200
}
