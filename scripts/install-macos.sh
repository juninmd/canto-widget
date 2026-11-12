#!/usr/bin/env bash
# Installs the latest Canto release on macOS without the Gatekeeper quarantine flag.
set -euo pipefail
[ "$(uname -s)" = Darwin ] || { echo "macOS only" >&2; exit 1; }
case "$(uname -m)" in arm64) arch=aarch64 ;; *) arch=x64 ;; esac
tmp="$(mktemp -d)"; trap 'hdiutil detach "$tmp/mnt" -quiet 2>/dev/null || true; rm -rf "$tmp"' EXIT
url="$(curl -fsSL https://api.github.com/repos/juninmd/canto-widget/releases/latest \
  | grep -o "https://[^\"]*_${arch}\.dmg" | head -1)"
[ -n "$url" ] || { echo "no .dmg found for $arch" >&2; exit 1; }
curl -fL --progress-bar "$url" -o "$tmp/Canto.dmg"
hdiutil attach "$tmp/Canto.dmg" -nobrowse -quiet -mountpoint "$tmp/mnt"
rm -rf /Applications/Canto.app
cp -R "$tmp/mnt/Canto.app" /Applications/
xattr -cr /Applications/Canto.app
echo "Canto installed in /Applications."
