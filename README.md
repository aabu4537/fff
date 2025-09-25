# EduSnap (GitHub Pages ready)

A single-folder, static web app you can deploy to **GitHub Pages**. It lets students capture slide photos, stores them locally (IndexedDB), and provides lightweight AI notes & vocab (client-side).

## How to use

1. Create a new GitHub repo (public).
2. Download and unzip this folder, then upload all files to the repo root (or drag-drop in GitHub).
3. Enable GitHub Pages:
   - Go to **Settings → Pages**
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or `master`) / `/root`
   - Save — wait for the green check and use the Pages URL.

The camera works over HTTPS (GitHub Pages is HTTPS), so it should prompt for permission on first use.

## Local preview

Just open `index.html` directly in a browser **or** serve with a tiny static server:
```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Files

- `index.html` — UI + Tailwind CDN
- `assets/style.css` — minimal extra styles
- `assets/db.js` — IndexedDB helpers
- `assets/ai.js` — small client-side keyword/notes helper
- `app.js` — camera capture, enhancement, rendering
- `sw.js` — basic offline caching
- `manifest.webmanifest` — PWA manifest
- `icon-192.png`, `icon-512.png` — app icons

## Notes

- This prototype stores images **locally** to save phone storage/server costs.
- To truly keep phone storage minimal, hook up cloud storage and delete local images after upload (requires a backend/API; not included here).
