# Lin Yifrach — static site (GitHub Pages + Firebase)

A single-page site (SPA) in Hebrew (RTL) with an admin panel. Code and comments are in English; all user-facing copy on the site is in Hebrew.

## Prerequisites

- A [Firebase](https://console.firebase.google.com) project with **Firestore**, **Storage**, and **Authentication** (email/password).
- A [Formspree](https://formspree.io) account for the contact form (optional until you replace the form ID).

## Firebase setup

1. Create a project and enable **Firestore** (production mode), **Storage**, and **Authentication** → **Email/Password** provider.
2. Under **Authentication** → **Users**: add one admin user.
3. Copy the `firebaseConfig` object from Project settings → Your apps and paste it into [`js/firebase-config.js`](js/firebase-config.js), replacing the `REPLACE_*` placeholders.
4. Under **Authentication** → **Settings** → **Authorized domains**: add your site domain (for example `YOUR_USER.github.io`).
5. Deploy security rules (adjust to your policy as needed):

**Firestore** — public reads, writes only for signed-in users:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage** — similar:

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

6. Create a `settings/main` document in Firestore (collection `settings`, document `main`) with fields as needed, for example: `heroTitle`, `heroSubtitle`, `heroCtaText`, `heroBgImageUrl`, `aboutText`, `aboutImageUrl`, `phone`, `whatsapp`, `contactEmail`, `instagram`, `facebook`, `serviceArea`. You can fill these via the [admin panel](admin.html) after signing in.

## Formspree

In [`index.html`](index.html), set the form `action` to `https://formspree.io/f/<YOUR_FORM_ID>`. The first submission requires email verification in Formspree.

## Local development

From the project directory:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` — ES modules require a server (not `file://`).

## Deploying to GitHub Pages

1. Push the code to the `main` branch.
2. The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds the `gh-pages` branch.
3. In GitHub: **Settings** → **Pages** → Source: **Deploy from a branch** → `gh-pages` / `/` (root).

Example project URL: `https://<USER>.github.io/<REPO>/`. Use **relative** paths for CSS/JS (as in this project) so the site works under a subpath.

## Main files

| File | Description |
|------|-------------|
| `index.html` | Public site |
| `admin.html` | Admin panel (`noindex` is already set) |
| `js/firebase-config.js` | Firebase configuration |
| `js/app.js` | Public site logic |
| `js/menu.js` | Public Firestore queries |
| `js/admin.js` | Content management |
