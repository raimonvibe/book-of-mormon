#!/usr/bin/env python3
"""Extract Book of Mormon text from pdftotext output into structured JSON."""

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "bookofmormon00lamo_bw.pdf"
TEXT_FILE = ROOT / "data" / "bom-raw.txt"
OUT_DATA = ROOT / "data" / "book-of-mormon-data.json"
OUT_SEARCH = ROOT / "data" / "search-index.json"

BOOKS = [
    {
        "id": "1NE",
        "name": "1 Nephi",
        "abbreviation": "1 Ne",
        "section": "Small Plates",
        "start": r"THE FIRST BOOK OF NEPHI\.\s*\n",
    },
    {
        "id": "2NE",
        "name": "2 Nephi",
        "abbreviation": "2 Ne",
        "section": "Small Plates",
        "start": r"THE SECOND BOOK OF NEPHI\.\s*\n",
    },
    {
        "id": "JAC",
        "name": "Jacob",
        "abbreviation": "Jacob",
        "section": "Small Plates",
        "start": r"THE BOOK OF JACOB\.\s*\n",
    },
    {
        "id": "ENO",
        "name": "Enos",
        "abbreviation": "Enos",
        "section": "Small Plates",
        "start": r"THE BOOK OF ENOS\.\s*\n",
    },
    {
        "id": "JAR",
        "name": "Jarom",
        "abbreviation": "Jarom",
        "section": "Small Plates",
        "start": r"THE BOOK OF [lJ]AROM\.\s*\n",
    },
    {
        "id": "OMN",
        "name": "Omni",
        "abbreviation": "Omni",
        "section": "Small Plates",
        "start": r"THE BOOK OF OMNI\.\s*\n",
    },
    {
        "id": "WOM",
        "name": "Words of Mormon",
        "abbreviation": "W of M",
        "section": "Small Plates",
        "start": r"THE WORDS OF MORMON\.\s*\n",
    },
    {
        "id": "MOS",
        "name": "Mosiah",
        "abbreviation": "Mosiah",
        "section": "Mormon's Record",
        "start": r"THE BOOK OF MOSIAH\.\s*\n",
    },
    {
        "id": "ALM",
        "name": "Alma",
        "abbreviation": "Alma",
        "section": "Mormon's Record",
        "start": r"THE BOOK OF ALMA\.\s*\n",
    },
    {
        "id": "HEL",
        "name": "Helaman",
        "abbreviation": "Hel.",
        "section": "Mormon's Record",
        "start": r"THE BOOK OF HELAMAN\.\s*\n",
    },
    {
        "id": "3NE",
        "name": "3 Nephi",
        "abbreviation": "3 Ne",
        "section": "Mormon's Record",
        "start": r"THE SON OF NEPHI, WHO WAS THE SON OF HELAMAN\.\s*\n",
    },
    {
        "id": "4NE",
        "name": "4 Nephi",
        "abbreviation": "4 Ne",
        "section": "Mormon's Record",
        "start": r"THE BOOK OF NEPHI\s*\nWHO IS THE SON OF NEPHI",
    },
    {
        "id": "MOR",
        "name": "Mormon",
        "abbreviation": "Morm.",
        "section": "Mormon's Record",
        "start": r"THE BOOK OF MORMON\.\s*\nCHAPTER 1\.",
    },
    {
        "id": "ETH",
        "name": "Ether",
        "abbreviation": "Ether",
        "section": "Mormon's Record",
        "start": r"BOOK OF ETHER\.\s*\nCHAPTER 1\.",
    },
    {
        "id": "MNI",
        "name": "Moroni",
        "abbreviation": "Moro.",
        "section": "Mormon's Record",
        "start": r"THE BOOK OF MORONI\.\s*\nCHAPTER 1\.",
    },
]

CHAPTER_RE = re.compile(
    r"CHAPTER\s+(\d+)\s*\.|"
    r"CHAPTER\s*\n+\s*(\d+)\s*\.|"
    r"CHAPTER\s*\n\s*(\d+)\s*\n+\s*(\d+)\s*\.|"
    r"CHAPTER\s*\n+\s*([iIvVxX]+)\s*\n+\s*(\d+)\s*\.",
    re.IGNORECASE,
)

ROMAN_MAP = {"i": "1", "ii": "2", "iii": "3", "iv": "4", "v": "5"}


def chapter_number_from_match(match: re.Match) -> str:
    if match.group(4):
        return match.group(4)
    if match.group(5) and match.group(6):
        roman = match.group(5).lower()
        return ROMAN_MAP.get(roman, match.group(6))
    if match.group(3) and not match.group(1) and not match.group(2):
        return match.group(3)
    return match.group(1) or match.group(2) or ""
VERSE_START_RE = re.compile(r"^(\d+)\s*[\^♦IJTl]?\s*")
PAGE_HEADER_RE = re.compile(
    r"^(?:THE |FIRST |SECOND |THIRD |FOURTH |BOOK OF |WORDS OF |CHAP\.|"
    r"\[chap\.|\d+\s*$|SOOK OF|NEFHl|THE SON OF|WHO IS THE)",
    re.IGNORECASE,
)
FORM_FEED = "\x0c"


def ensure_text() -> str:
    TEXT_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not TEXT_FILE.exists() or TEXT_FILE.stat().st_mtime < PDF.stat().st_mtime:
        print("Extracting PDF text with pdftotext...")
        subprocess.run(
            ["pdftotext", str(PDF), str(TEXT_FILE)],
            check=True,
        )
    return TEXT_FILE.read_text(encoding="utf-8", errors="replace")


def clean_line(line: str) -> str:
    line = line.strip()
    if not line:
        return ""
    if PAGE_HEADER_RE.match(line):
        return ""
    if re.match(r"^\d+$", line):
        return ""
    return line


def normalize_text(text: str) -> str:
    text = text.replace(FORM_FEED, "\n")
    text = re.sub(r"\r\n?", "\n", text)
    return text


def find_book_positions(text: str) -> list[tuple[dict, int]]:
    positions = []
    for book in BOOKS:
        match = re.search(book["start"], text, re.IGNORECASE | re.MULTILINE)
        if not match:
            print(f"WARNING: Could not find start for {book['name']}", file=sys.stderr)
            continue
        positions.append((book, match.start()))
    positions.sort(key=lambda x: x[1])
    return positions


def extract_chapter_blocks(book_text: str) -> list[tuple[str, str]]:
    """Return list of (chapter_num, body_text), deduplicated by chapter number."""
    matches = list(CHAPTER_RE.finditer(book_text))
    if not matches:
        return []

    unique: list[tuple[int, str, re.Match]] = []
    seen: set[str] = set()
    for match in matches:
        num = chapter_number_from_match(match)
        if num and num not in seen:
            seen.add(num)
            unique.append((int(num), num, match))
    unique.sort(key=lambda x: x[0])

    chapters: list[tuple[str, str]] = []
    for i, (_, num, match) in enumerate(unique):
        start = match.end()
        end = unique[i + 1][2].start() if i + 1 < len(unique) else len(book_text)
        chapters.append((num, book_text[start:end]))
    return chapters


def parse_verses(chapter_body: str) -> list[dict]:
    lines = []
    for raw in chapter_body.split("\n"):
        cleaned = clean_line(raw)
        if cleaned:
            lines.append(cleaned)

    merged: list[str] = []
    for line in lines:
        if VERSE_START_RE.match(line) or not merged:
            merged.append(line)
        else:
            merged[-1] += " " + line

    verses = []
    current_num = None
    current_parts: list[str] = []

    for line in merged:
        m = VERSE_START_RE.match(line)
        if m:
            if current_num is not None:
                verses.append(
                    {
                        "number": current_num,
                        "text": " ".join(current_parts).strip(),
                    }
                )
            current_num = m.group(1)
            rest = line[m.end() :].strip()
            current_parts = [rest] if rest else []
        elif current_num is not None:
            current_parts.append(line)

    if current_num is not None:
        verses.append(
            {"number": current_num, "text": " ".join(current_parts).strip()}
        )

    return [v for v in verses if v["text"]]


def format_content(verses: list[dict]) -> str:
    parts = []
    for v in verses:
        parts.append(
            f'<span class="verse"><sup class="verse-num">[{v["number"]}]</sup> {escape_html(v["text"])}</span>'
        )
    return "\n     ".join(parts)


def escape_html(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


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


def main():
    text = normalize_text(ensure_text())
    positions = find_book_positions(text)

    if len(positions) < len(BOOKS):
        print(f"Found {len(positions)}/{len(BOOKS)} books", file=sys.stderr)

    books_out = []
    search_entries = []

    for i, (book_meta, start) in enumerate(positions):
        end = positions[i + 1][1] if i + 1 < len(positions) else len(text)
        book_text = text[start:end]
        chapter_blocks = extract_chapter_blocks(book_text)

        chapters_out = []
        for ch_num, ch_body in chapter_blocks:
            verses = parse_verses(ch_body)
            if not verses:
                continue
            ch_id = f"{book_meta['id']}.{ch_num}"
            reference = f"{book_meta['name']} {ch_num}"
            chapters_out.append(
                {
                    "id": ch_id,
                    "number": ch_num,
                    "reference": reference,
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
        print(f"  {book_meta['name']}: {len(chapters_out)} chapters")

    data = {
        "title": "The Book of Mormon",
        "edition": "Lamoni Edition (1917/1933) — Reorganized Church of Jesus Christ of Latter Day Saints",
        "source": "Internet Archive",
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
