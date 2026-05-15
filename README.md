[![The Book of Mormon Reader](public/mormon.jpg)](https://book-of-mormon-tan.vercel.app/)

# 📖 Book of Mormon Reader

**🔗 Live app:** [https://book-of-mormon-tan.vercel.app/](https://book-of-mormon-tan.vercel.app/)

A beautiful, responsive **Next.js** web app for reading the **Book of Mormon** (Lamoni Edition). Browse all books and chapters, search every verse, and switch between warm **beige** and **dark brown** themes.

---

## ✨ Features

- 📚 **15 books** — Small Plates & Mormon’s Record, with clear chapter navigation
- 🔢 **Verse numbering** — Show or hide verse numbers while you read
- 🔍 **Full-text search** — Find words across all chapters and jump straight to results
- 🌓 **Light & dark themes** — Beige gradients (light) and dark brown gradients (dark)
- 📱 **Fully responsive** — Sidebar menu on desktop, mobile-friendly navigation
- ✨ **Polished UI** — Lucide icons, Playfair Display & Merriweather typography, linear gradients

---

## 📜 Source text

Content is extracted from the **Lamoni Edition** (Reorganized Church of Jesus Christ of Latter Day Saints, 1917/1933), digitized from [Internet Archive](https://www.archive.org/details/bookofmormon00lamo).

> **Note:** This edition uses **fewer, longer chapters** than the modern LDS edition (e.g. 1 Nephi has 7 chapters here, not 22). Numbering matches the source PDF.

---

## 🚀 Getting started

### Prerequisites

- **Node.js** 18+ (20+ recommended for latest Next.js)
- **pdftotext** (poppler-utils) — only if re-extracting from the PDF

### Install & run

```bash
git clone https://github.com/raimonvibe/book-of-mormon.git
cd book-of-mormon
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Re-extract from PDF

Place `bookofmormon00lamo_bw.pdf` in the project root, then:

```bash
npm run extract
```

This regenerates `data/book-of-mormon-data.json` and `data/search-index.json`.

### Production build

```bash
npm run build
npm start
```

---

## 🗂️ Project structure

```
book-of-mormon/
├── app/                 # Next.js App Router (pages, API, styles)
├── components/          # UI: hero, menu, reader, search, theme
├── data/                # Extracted scripture JSON + search index
├── public/mormon.jpg    # Cover image (hero, loading, social preview)
├── scripts/             # PDF extraction script (Python)
└── package.json
```

---

## 🛠️ Tech stack

- [Next.js](https://nextjs.org/) 14 · React 18 · TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) icons

---

## 📄 License

MIT © [raimonvibe](https://github.com/raimonvibe)

See [LICENSE](LICENSE) for details.
