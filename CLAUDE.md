# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lin Sweets (Lin Yifrach - עוגיות, עוגות ומתוקים) is a Hebrew-language bakery website with a Firebase-backed CMS. It's a static site with no build system — all code runs directly in the browser.

## Development

No build step. Serve files locally with:

```bash
python3 -m http.server 8080
```

Deployment is automatic: push to `main` → GitHub Actions deploys to `gh-pages` branch.

## Architecture

Two separate HTML entry points, each with its own JS/CSS:

- **`index.html` + `js/app.js` + `css/style.css`** — Public-facing SPA (Hebrew RTL). Fetches content from Firestore on load and renders menu tabs, gallery, and hero section dynamically.
- **`admin.html` + `js/admin.js` + `css/admin.css`** — Authenticated admin panel for CRUD operations on menu items, gallery images, and site settings.

**Data layer (`js/menu.js`)** — Firestore query helpers used by `app.js` for reading menu items, gallery entries, and the `settings/main` document.

**Firebase (`js/firebase-config.js`)** — Initializes Auth, Firestore, and Storage. Project ID: `lin-sweets`. Auth uses email/password. Firestore rules: public read, authenticated write.

### Firestore Collections

| Collection | Purpose |
|---|---|
| `settings` (doc: `main`) | Site config: heroTitle, aboutText, contactEmail, phone, hours |
| `menu_items` | Products with fields: name, description, price, category, imageUrl, order |
| `gallery` | Gallery images with: imageUrl, caption, order |

Categories for menu items: `עוגיות`, `עוגות`, `מתוקים`, `עונתי`

### CDN Dependencies (no npm)

- Firebase SDK v10.7.0 (Auth, Firestore, Storage)
- SimpleLightbox v2.14.2 (gallery lightbox)
- Sortable.js v1.15.2 (drag-to-reorder in admin)
- Google Fonts: Frank Ruhl Libre (Hebrew display), Rubik (body)
- Formspree (contact form, configured in `index.html` form action)

## RTL / Hebrew

The entire public site is RTL (`dir="rtl"`). All CSS should account for RTL layout. Hebrew fonts (Frank Ruhl Libre) are used for headings.
