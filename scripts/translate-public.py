"""Translate public repository text; never pass vault contents or credentials."""
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".translations-cache.tmp"
PROTECTED = re.compile(
    r"```[\s\S]*?```|`[^`]+`|!?\[[^\]]*\]\([^)]*\)|<[^>]+>|"
    r"(?<=\]\()[^)]*(?=\))|\{\w+\}|\n|Daily at 9:30 !high|(?i:\bcanto\b)|"
    r"\b(?:Canto|Steam|SteamID64|GitHub|GitLab|Google|Windows Hello|Meet|OAuth|PKCE|DNS|TCP|HTTPS?|API|"
    r"Ctrl|Alt|Shift|Cmd|Enter|Escape|Tab|Backspace|Delete|Space|F[1-9]\d?|PRs?|MRs?|"
    r"Rust|React|Tauri|Bun|Electron|TypeScript|Argon2id|AES-256-GCM)\b"
)


def request(text, target):
    query = urllib.parse.urlencode({"client": "gtx", "sl": "en", "tl": target, "dt": "t", "q": text})
    url = "https://translate.googleapis.com/translate_a/single?" + query
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=40) as response:
                result = json.load(response)
            return "".join(part[0] for part in result[0] if part[0])
        except (OSError, ValueError):
            if attempt == 4:
                raise
            time.sleep(2 ** attempt)


def mask(text):
    tokens = []

    def replace(match):
        tokens.append(match[0])
        return f"__CANTO_{len(tokens) - 1}__"

    return PROTECTED.sub(replace, text), tokens


def restore(text, tokens):
    for index, original in enumerate(tokens):
        pattern = rf"__\s*[^_\d]+?\s*_\s*{index}\s*__"
        if len(re.findall(pattern, text, re.I)) != 1:
            raise ValueError(f"lost protected token {index}")
        text = re.sub(pattern, lambda _: original, text, flags=re.I)
    if "__CANTO" in text.upper():
        raise ValueError("unrestored token")
    return text.strip()


def translate(values, target):
    active = [value for value in values if re.search(r"[a-zA-Z]", re.sub(r"__CANTO_\d+__", "", mask(value)[0]))]
    if len(active) != len(values):
        translated = dict(zip(active, translate(active, target), strict=True))
        return [translated.get(value, value) for value in values]
    prepared = [mask(value) for value in values]
    translated = []
    start = 0
    while start < len(prepared):
        stop = start + 1
        while stop < len(prepared) and sum(len(item[0]) + 1 for item in prepared[start:stop + 1]) < 3500:
            stop += 1
        batch = prepared[start:stop]
        result = request("\n".join(item[0] for item in batch), target).split("\n")
        if len(result) != len(batch):
            result = [request(text, target) for text, _ in batch]
        for text, (source, tokens) in zip(result, batch, strict=True):
            try:
                translated.append(restore(text, tokens))
            except ValueError:
                try:
                    translated.append(restore(request(source, target), tokens))
                except ValueError:
                    pieces = re.split(r"(__CANTO_\d+__)", source)
                    output = []
                    for piece in pieces:
                        token = re.fullmatch(r"__CANTO_(\d+)__", piece)
                        if token:
                            output.append(tokens[int(token[1])])
                        elif re.search(r"[a-zA-Z]", piece):
                            prefix = " " if piece.startswith(" ") else ""
                            suffix = " " if piece.endswith(" ") else ""
                            output.append(prefix + request(piece.strip(), target).strip() + suffix)
                        else:
                            output.append(piece)
                    translated.append("".join(output).strip())
        start = stop
    return translated


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
