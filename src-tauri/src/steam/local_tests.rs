use super::*;

const VDF: &str = r#""libraryfolders"
{
	"0"
	{
		"path"		"C:\\Program Files (x86)\\Steam"
		"apps"
		{
			"228980"		"0"
		}
	}
	"1"
	{
		"path"		"D:\\SteamLibrary"
	}
}"#;

fn manifest(appid: u32, name: &str, flags: u32) -> String {
    format!(
        "\"AppState\"\n{{\n\t\"appid\"\t\t\"{appid}\"\n\t\"name\"\t\t\"{name}\"\n\t\"StateFlags\"\t\t\"{flags}\"\n\t\"SizeOnDisk\"\t\t\"1500000000\"\n\t\"LastPlayed\"\t\t\"1761170000\"\n}}"
    )
}

#[test]
fn every_library_path_is_read_and_unescaped() {
    assert_eq!(library_paths(VDF), vec![r"C:\Program Files (x86)\Steam".to_string(), r"D:\SteamLibrary".to_string()]);
    assert!(library_paths("").is_empty());
}

#[test]
fn a_manifest_gives_the_game_its_size_and_when_it_ran() {
    let game = parse_manifest(&manifest(1086940, "Baldur's Gate 3", 4)).expect("installed");
    assert_eq!(
        game,
        Installed {
            appid: 1086940,
            name: "Baldur's Gate 3".into(),
            size_bytes: 1_500_000_000,
            last_played: 1761170000
        }
    );
}

#[test]
fn tools_runtimes_and_unfinished_downloads_are_not_games() {
    assert_eq!(parse_manifest(&manifest(228980, "Steamworks Common Redistributables", 4)), None);
    assert_eq!(parse_manifest(&manifest(2805730, "Proton 9.0", 4)), None);
    assert_eq!(parse_manifest(&manifest(570, "Dota 2", 1026)), None, "flag 4 missing: still downloading");
    assert!(parse_manifest(&manifest(570, "Dota 2", 1030)).is_some(), "installed and updating is installed");
    assert_eq!(parse_manifest("garbage"), None);
}
