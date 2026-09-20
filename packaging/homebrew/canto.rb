cask "canto" do
  arch arm: "aarch64", intel: "x64"

  version "0.1.0"
  sha256 arm:   "c98d4288bf322bee7ab8f7e635749f8712d1d3f447c344ccf3d6cafc9dae5fa3",
         intel: "20f6548dd384d719081d7ad4b5f688bd9afa60d5a605165da988ba05d5056ed1"

  url "https://github.com/juninmd/canto-widget/releases/download/v#{version}/Canto_#{version}_#{arch}.dmg"
  name "Canto"
  desc "Encrypted desktop widget for tasks, notes, clipboard history and agenda"
  homepage "https://github.com/juninmd/canto-widget"

  auto_updates true

  app "Canto.app"

  zap trash: [
    "~/Library/Application Support/com.junin.canto",
    "~/Library/Caches/com.junin.canto",
    "~/Library/Saved Application State/com.junin.canto.savedState",
  ]
end
