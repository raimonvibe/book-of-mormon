#!/usr/bin/env python3
"""Extract Book of Mormon text from the LDS missionary edition PDF."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "book_of_mormon_missionary_english.pdf"
TEXT_FILE = ROOT / "data" / "missionary-raw.txt"
OUT_DATA = ROOT / "data" / "book-of-mormon-data.json"
OUT_SEARCH = ROOT / "data" / "search-index.json"

FORM_FEED = "\x0c"

BOOKS = [
    {
        "id": "1NE",
        "name": "1 Nephi",
        "abbreviation": "1 Ne",
        "section": "Small Plates",
        "start": r"The First Book of Nephi\s*\nHis Reign and Ministry",
        "single_chapter": False,
    },
    {
        "id": "2NE",
        "name": "2 Nephi",
        "abbreviation": "2 Ne",
        "section": "Small Plates",
        "start": r"The Second Book of Nephi\s*\nAn account of the death of Lehi",
        "single_chapter": False,
    },
    {
        "id": "JAC",
        "name": "Jacob",
        "abbreviation": "Jacob",
        "section": "Small Plates",
        "start": r"The Book of Jacob\s*\n",
        "single_chapter": False,
    },
    {
        "id": "ENO",
        "name": "Enos",
        "abbreviation": "Enos",
        "section": "Small Plates",
        "start": r"The Book of Enos\s*\nEnos prays mightily",
        "single_chapter": True,
    },
    {
        "id": "JAR",
        "name": "Jarom",
        "abbreviation": "Jarom",
        "section": "Small Plates",
        "start": r"The Book of Jarom\s*\nThe Nephites keep",
        "single_chapter": True,
    },
    {
        "id": "OMN",
        "name": "Omni",
        "abbreviation": "Omni",
        "section": "Small Plates",
        "start": r"The Book of Omni\s*\nOmni, Amaron",
        "single_chapter": True,
    },
    {
        "id": "WOM",
        "name": "Words of Mormon",
        "abbreviation": "W of M",
        "section": "Small Plates",
        "start": r"The Words of Mormon\s*\nMormon abridges the large plates",
        "single_chapter": True,
    },
    {
        "id": "MOS",
        "name": "Mosiah",
        "abbreviation": "Mosiah",
        "section": "Mormon's Record",
        "start": r"The Book of Mosiah\s*\nChapter 1\s*\nKing Benjamin",
        "single_chapter": False,
    },
    {
        "id": "ALM",
        "name": "Alma",
        "abbreviation": "Alma",
        "section": "Mormon's Record",
        "start": r"The Book of Alma\s*\n",
        "single_chapter": False,
    },
    {
        "id": "HEL",
        "name": "Helaman",
        "abbreviation": "Hel.",
        "section": "Mormon's Record",
        "start": r"The Book of Helaman\s*\nAn account of the Nephites",
        "single_chapter": False,
    },
    {
        "id": "3NE",
        "name": "3 Nephi",
        "abbreviation": "3 Ne",
        "section": "Mormon's Record",
        "start": r"Third Nephi\s*\nThe Book of Nephi\s*\n",
        "single_chapter": False,
    },
    {
        "id": "4NE",
        "name": "4 Nephi",
        "abbreviation": "4 Ne",
        "section": "Mormon's Record",
        "start": r"Fourth Nephi\s*\nThe Book of Nephi\s*\n",
        "single_chapter": True,
    },
    {
        "id": "MOR",
        "name": "Mormon",
        "abbreviation": "Morm.",
        "section": "Mormon's Record",
        "start": r"The Book of Mormon\s*\nChapter 1\s*\nAmmaron instructs Mormon",
        "single_chapter": False,
    },
    {
        "id": "ETH",
        "name": "Ether",
        "abbreviation": "Ether",
        "section": "Mormon's Record",
        "start": r"The Book of Ether\s*\nThe record of the Jaredites",
        "single_chapter": False,
    },
    {
        "id": "MNI",
        "name": "Moroni",
        "abbreviation": "Moro.",
        "section": "Mormon's Record",
        "start": r"The Book of Moroni\s*\nChapter 1\s*\nMoroni writes for the benefit",
        "single_chapter": False,
    },
]

EXPECTED_CHAPTERS = {
    "1NE": 22,
    "2NE": 33,
    "JAC": 7,
    "ENO": 1,
    "JAR": 1,
    "OMN": 1,
    "WOM": 1,
    "MOS": 29,
    "ALM": 63,
    "HEL": 16,
    "3NE": 30,
    "4NE": 1,
    "MOR": 9,
    "ETH": 15,
    "MNI": 10,
}

CHAPTER_RE = re.compile(r"^Chapter\s+(\d+)\s*$", re.IGNORECASE | re.MULTILINE)
VERSE_RE = re.compile(r"^(\d+)\s+(.+)$")
FOOTNOTE_KEY_RE = re.compile(r"^\d+\s+\d+\s+[a-z]\s")
PAGE_HEADER_RE = re.compile(
    r"^(?:\d+\s+)?(?:[1-4]?\s?Nephi|Jacob|Enos|Jarom|Omni|Words of Mormon|Mosiah|Alma|"
    r"Helaman|3 Nephi|4 Nephi|Ether|Mormon|Moroni|W of M)\s+\d+\s*:\s*\d+",
    re.IGNORECASE,
)
PAGE_NUM_RE = re.compile(r"^\d{1,3}$")
BOOK_TAG_RE = re.compile(r"^\[(?:Ether|Words of Mormon)\]\s*$")
INTRO_DATE_RE = re.compile(
    r"About\s+(?:\d+\s+)?[ab]\.?\s*[cd]\.?|\bAbout\s+a\.d\.|\bAbout\s+\d+\s+b\.c\.",
    re.IGNORECASE,
)
BACK_MATTER_RE = re.compile(r"\n\s*INDEX\s*\n", re.IGNORECASE)

_DICTIONARY: frozenset[str] | None = None


def load_dictionary() -> frozenset[str]:
    global _DICTIONARY
    if _DICTIONARY is not None:
        return _DICTIONARY
    words: set[str] = set()
    for path in ("/usr/share/dict/words", "/usr/dict/words"):
        dict_path = Path(path)
        if dict_path.is_file():
            words.update(w.strip().lower() for w in dict_path.read_text(encoding="utf-8", errors="ignore").splitlines())
            break
    _DICTIONARY = frozenset(words)
    return _DICTIONARY


def ensure_text() -> str:
    TEXT_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not PDF.exists():
        print(f"ERROR: PDF not found at {PDF}", file=sys.stderr)
        sys.exit(1)
    if not TEXT_FILE.exists() or TEXT_FILE.stat().st_mtime < PDF.stat().st_mtime:
        print("Extracting PDF text with pdftotext...")
        subprocess.run(["pdftotext", str(PDF), str(TEXT_FILE)], check=True)
    return TEXT_FILE.read_text(encoding="utf-8", errors="replace")


def normalize_text(text: str) -> str:
    text = text.replace(FORM_FEED, "\n")
    return re.sub(r"\r\n?", "\n", text)


def trim_back_matter(text: str) -> str:
    match = BACK_MATTER_RE.search(text)
    return text[: match.start()] if match else text


def is_noise_line(line: str) -> bool:
    if not line.strip():
        return True
    if PAGE_NUM_RE.match(line.strip()):
        return True
    if PAGE_HEADER_RE.match(line.strip()):
        return True
    if BOOK_TAG_RE.match(line.strip()):
        return True
    if line.strip() in {"INDEX", "Abound"}:
        return True
    if re.match(r"^See\s+", line.strip()):
        return True
    if re.match(r"^Painting by ", line.strip()):
        return True
    return False


def is_footnote_line(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if FOOTNOTE_KEY_RE.match(s):
        return True
    if s.startswith("\t") or s.startswith("tg "):
        return True
    if re.match(r"^[a-z]\s+tg\s", s):
        return True
    if re.match(r"^[a-z]\s*$", s):
        return True
    if re.match(r"^\d+\s+[a-z]\s+tg\s", s):
        return True
    if re.match(r"^[a-z]\s+\d+:\d+", s):
        return True
    if re.match(r"^[a-z]\s+[A-Z]", s) and re.search(r"\d:\d+", s):
        return True
    if re.match(r"^\d+\s+[a-z]\s+", s) and re.search(r"\d:\d+", s):
        return True
    if re.match(r"^[a-z]\s+(?:\d\s)?[A-Z][a-z]+\.", s):
        return True
    if re.match(r"^[A-Z][a-z]+\s+\d+:\d+", s) and ";" in s:
        return True
    if re.match(r"^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\.$", s) and len(s) < 60:
        return True
    if re.match(r"^[A-Z][a-z]+,\s", s) and len(s) < 80 and "tg " not in s:
        return True
    if re.match(r"^D&C\s+\d", s):
        return True
    return False


def is_intro_line(line: str) -> bool:
    s = line.strip()
    if CHAPTER_RE.match(s):
        return True
    if INTRO_DATE_RE.search(s):
        return True
    if re.match(r"^[A-Z][a-z].*—$", s):
        return True
    if re.match(r"^[a-z].*—$", s):
        return True
    if re.match(r"^[A-Z][a-z].*—[A-Z]", s):
        return True
    if s.endswith("—") and len(s) < 120:
        return True
    if re.match(r"^W ho I s t h e", s):
        return True
    if re.match(r"^t h e ", s, re.I):
        return True
    if re.match(r"^Di s c i pl e s", s):
        return True
    if re.match(r"^An account of", s):
        return True
    if re.match(r"^The record of the Jaredites", s):
        return True
    if re.match(r"^people of Limhi", s):
        return True
    return False


def is_footnote_verse_content(rest: str) -> bool:
    if re.match(r"^[a-z]\s", rest):
        return True
    if "tg " in rest:
        return True
    if re.match(r"^\(\d+", rest):
        return True
    if re.search(r"\d:\d+", rest) and len(rest) < 160:
        return True
    return False


def is_scripture_continuation(line: str) -> bool:
    if is_footnote_line(line) or is_verse_start(line):
        return False
    if re.match(r"^\d+\s+[a-z]\s", line):
        return False
    if re.search(r"\d:\d+", line) and len(line) < 100:
        return False
    if "tg " in line or re.match(r"^[A-Z][a-z]+,\s", line):
        return False
    if re.match(r"^[a-z]{1,8}\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*;?\s*$", line):
        return False
    if line[0].islower() and re.match(r"^[a-z]+(?:\s+[a-z]+){0,2}\s*$", line) is None:
        return True
    return bool(
        re.match(
            r"^(And|But|Yea|For|Wherefore|Now|Therefore|Behold|Read|He|She|They|It|With)\b",
            line,
        )
    )


def is_verse_start(line: str) -> bool:
    m = VERSE_RE.match(line.strip())
    if not m:
        return False
    if FOOTNOTE_KEY_RE.match(line.strip()):
        return False
    num, rest = m.group(1), m.group(2).strip()
    if not rest or rest.isdigit():
        return False
    if is_footnote_verse_content(rest):
        return False
    return True


def strip_glued_footnote_markers(text: str, dictionary: frozenset[str]) -> str:
    def repl(match: re.Match[str]) -> str:
        full = match.group(0)
        marker = match.group(1).lower()
        rest = match.group(2)
        if full.lower() in dictionary:
            return full
        if rest.lower() in dictionary and marker != rest[0].lower():
            return rest
        return full

    return re.sub(r"\b([a-f])([a-z]{3,})\b", repl, text)


def strip_footnote_markers(text: str) -> str:
    """Remove LDS inline footnote letter markers from running text."""
    dictionary = load_dictionary()
    text = re.sub(r"\b([a-f])\s+(?=[a-z])", "", text)
    text = re.sub(r"\b([a-f])([A-Z][a-z]+)", r"\2", text)
    if dictionary:
        text = strip_glued_footnote_markers(text, dictionary)
    return text


def trim_trailing_footnote_junk(text: str) -> str:
    """Drop footnote cross-reference tails accidentally merged into a verse."""
    text = re.sub(
        r"\s+\d+\s+[a-z]\s+(?:tg\s+)?[A-Z][a-z].*$",
        "",
        text,
    )
    text = re.sub(r"\s+[a-z]\s+tg\s+.+$", "", text)
    return text.strip()


def clean_verse_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    text = strip_footnote_markers(text)
    text = re.sub(r"\b([a-z])([A-Z])", r"\2", text)
    text = trim_trailing_footnote_junk(text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    text = re.sub(r"\s*—\s*", "—", text)
    return text


def scripture_start_index(lines: list[str]) -> int:
    """Return index of first line after chapter intro (date line)."""
    for i, raw in enumerate(lines):
        if INTRO_DATE_RE.search(raw):
            return i + 1
    for i, raw in enumerate(lines):
        if CHAPTER_RE.match(raw.strip()):
            return i + 1
    return 0


def parse_verses(chapter_body: str) -> list[dict]:
    lines = [ln.rstrip() for ln in chapter_body.split("\n")]
    start_at = scripture_start_index(lines)
    verses: list[dict] = []
    current_num: str | None = None
    current_parts: list[str] = []
    orphan_letter = ""
    in_footnote_block = False

    def flush() -> None:
        nonlocal current_num, current_parts, orphan_letter
        if current_num is None or not current_parts:
            current_num = None
            current_parts = []
            orphan_letter = ""
            return
        text = clean_verse_text(" ".join(current_parts))
        if text and not is_footnote_verse_content(text):
            verses.append({"number": current_num, "text": text})
        current_num = None
        current_parts = []
        orphan_letter = ""

    for raw in lines[start_at:]:
        line = raw.strip()
        if not line or is_noise_line(line):
            continue
        if CHAPTER_RE.match(line):
            break
        if is_footnote_line(line) or (raw.startswith("\t") and line):
            in_footnote_block = True
            continue
        if in_footnote_block:
            if is_verse_start(line):
                in_footnote_block = False
            elif current_num is not None and is_scripture_continuation(line):
                in_footnote_block = False
                current_parts.append(line)
                continue
            else:
                continue

        if len(line) == 1 and line.isalpha():
            if current_num == "1" and current_parts:
                current_parts[0] = line + current_parts[0]
            else:
                orphan_letter = line
            continue

        if is_verse_start(line):
            in_footnote_block = False
            flush()
            m = VERSE_RE.match(line)
            current_num = m.group(1)
            rest = m.group(2).strip()
            if orphan_letter:
                rest = orphan_letter + rest
                orphan_letter = ""
            current_parts = [rest]
            continue

        if current_num is not None:
            current_parts.append(line)
            continue

        if orphan_letter:
            line = orphan_letter + line
            orphan_letter = ""
        current_num = "1"
        current_parts = [line]

    flush()
    return verses


CH26_MALACHI_START_RE = re.compile(r"^For behold, the day cometh", re.IGNORECASE | re.MULTILINE)
CH26_MALACHI_SPLIT_RE = re.compile(
    r"(?=And now it came to pass that when\s+Jesus had told these things)",
    re.IGNORECASE,
)


def fix_3nephi_25_26(chapters: list[tuple[str, str]]) -> list[tuple[str, str]]:
    """Missionary PDF places 3 Nephi 25 (Malachi 4) under the Chapter 26 header."""
    fixed: list[tuple[str, str]] = []
    i = 0
    while i < len(chapters):
        num, body = chapters[i]
        if num == "26" and fixed and fixed[-1][0] == "25":
            parts = CH26_MALACHI_SPLIT_RE.split(body, maxsplit=1)
            if len(parts) == 2:
                preamble, ch26_body = parts
                malachi_match = CH26_MALACHI_START_RE.search(preamble)
                if malachi_match:
                    malachi_body = preamble[malachi_match.start() :]
                    prev_num, prev_body = fixed[-1]
                    fixed[-1] = (prev_num, prev_body + "\n" + malachi_body)
                    fixed.append(("26", preamble[: malachi_match.start()] + ch26_body))
                else:
                    fixed.append((num, body))
                i += 1
                continue
        fixed.append((num, body))
        i += 1
    return fixed


def split_chapters(book_text: str, single_chapter: bool, book_id: str = "") -> list[tuple[str, str]]:
    if single_chapter:
        return [("1", book_text)]

    matches = list(CHAPTER_RE.finditer(book_text))
    if not matches:
        return [("1", book_text)]

    chapters: list[tuple[str, str]] = []
    for i, match in enumerate(matches):
        num = match.group(1)
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(book_text)
        chapters.append((num, book_text[start:end]))
    if book_id == "3NE":
        chapters = fix_3nephi_25_26(chapters)
    return chapters


def find_book_sections(text: str) -> list[tuple[dict, int, int]]:
    found: list[tuple[dict, int]] = []
    for book in BOOKS:
        match = re.search(book["start"], text, re.IGNORECASE)
        if not match:
            print(f"WARNING: Could not find start for {book['name']}", file=sys.stderr)
            continue
        found.append((book, match.start()))
    found.sort(key=lambda item: item[1])
    sections: list[tuple[dict, int, int]] = []
    for i, (book, start) in enumerate(found):
        end = found[i + 1][1] if i + 1 < len(found) else len(text)
        sections.append((book, start, end))
    return sections


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def format_content(verses: list[dict]) -> str:
    parts = [
        f'<span class="verse"><sup class="verse-num">[{v["number"]}]</sup> '
        f"{escape_html(v['text'])}</span>"
        for v in verses
    ]
    return "\n     ".join(parts)


def build_search_index(books: list[dict]) -> list[dict]:
    index = []
    for book in books:
        for chapter in book["chapters"]:
            for verse in chapter.get("verses", []):
                index.append(
                    {
                        "bookId": book["id"],
                        "bookName": book["name"],
                        "chapterId": chapter["id"],
                        "chapterNumber": chapter["number"],
                        "reference": chapter["reference"],
                        "verse": verse["number"],
                        "text": verse["text"],
                    }
                )
    return index


def main() -> None:
    text = trim_back_matter(normalize_text(ensure_text()))
    sections = find_book_sections(text)
    books_out: list[dict] = []

    for book_meta, start, end in sections:
        book_text = text[start:end]
        chapter_blocks = split_chapters(
            book_text, book_meta["single_chapter"], book_meta["id"]
        )
        chapters_out = []

        for ch_num, ch_body in chapter_blocks:
            verses = parse_verses(ch_body)
            if not verses:
                continue
            ch_id = f"{book_meta['id']}.{ch_num}"
            chapters_out.append(
                {
                    "id": ch_id,
                    "number": ch_num,
                    "reference": f"{book_meta['name']} {ch_num}",
                    "content": format_content(verses),
                    "verses": verses,
                    "plainText": " ".join(v["text"] for v in verses),
                }
            )

        books_out.append(
            {
                "id": book_meta["id"],
                "name": book_meta["name"],
                "abbreviation": book_meta["abbreviation"],
                "section": book_meta["section"],
                "chapters": chapters_out,
            }
        )
        expected = EXPECTED_CHAPTERS.get(book_meta["id"])
        actual = len(chapters_out)
        flag = "OK" if expected == actual else "MISMATCH"
        total_v = sum(len(c["verses"]) for c in chapters_out)
        print(f"  {book_meta['name']:20} {actual:3} chapters ({expected:2} expected)  {total_v:4} verses  [{flag}]")

    data = {
        "title": "The Book of Mormon",
        "edition": "Missionary Edition — The Church of Jesus Christ of Latter-day Saints (2025)",
        "source": "book_of_mormon_missionary_english.pdf",
        "books": books_out,
    }

    OUT_DATA.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_DATA, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    search_index = build_search_index(books_out)
    with open(OUT_SEARCH, "w", encoding="utf-8") as f:
        json.dump(search_index, f, ensure_ascii=False)

    total_ch = sum(len(b["chapters"]) for b in books_out)
    print(f"\nWrote {OUT_DATA} ({len(books_out)} books, {total_ch} chapters)")
    print(f"Wrote {OUT_SEARCH} ({len(search_index)} verses)")


if __name__ == "__main__":
    main()
