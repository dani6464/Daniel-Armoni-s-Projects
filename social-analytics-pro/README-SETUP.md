# Social Analytics Pro — Live Meta API MVP

This build adds real OAuth + a small backend. The extension never contains the Meta App Secret.

## 1) Install the extension

Load the `social-analytics-pro` folder as an unpacked extension at `chrome://extensions` with Developer mode enabled.

## 2) Create a Meta developer app

Create/configure a Meta app for the products/APIs you are allowed to use. Add the redirect URLs below to the corresponding OAuth configuration:

- Instagram: `http://localhost:8787/oauth/instagram/callback`
- Facebook: `http://localhost:8787/oauth/facebook/callback`

The exact products, permission names, review requirements and available metrics depend on the Meta APIs enabled for the app/account. Verify the current requirements in Meta's developer documentation before production use.

## 3) Start the backend

Open a terminal in `backend/`:

```bash
npm install
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`.

Edit `.env` and set:

- `META_APP_ID`
- `META_APP_SECRET`
- redirect URIs if you deploy the backend somewhere else
- scopes required by the Meta products you enabled

Then:

```bash
npm start
```

You should have `http://localhost:8787/health` available.

## 4) Connect from Chrome

Open the extension popup and click **Connect Instagram** or **Connect Facebook**.

Instagram path: use a supported Instagram Professional account/API setup.
Facebook path: this MVP connects a Facebook Page returned from the authenticated account; it is not a personal-profile analytics scraper.

After OAuth finishes, the popup polls the backend and switches from `DEMO DATA` to `LIVE API DATA`.

## 5) What is live vs. unavailable

The backend fetches permitted profile/page counts and post/media interaction data where the configured API returns them.

This MVP intentionally does not fabricate profile-viewer identities or exact individual viewer counts. It also cannot reconstruct old follower/unfollower history that was not observed by the application. Follower snapshots begin when the backend is connected and can become a real 7-day history after enough daily snapshots are collected.

## 6) Production deployment

For a public deployment, replace localhost with an HTTPS backend, add the production backend origin to the extension's `host_permissions`, use a secure session store, encrypt/token-protect stored Meta credentials, and implement the exact current Meta permissions/review requirements for the products you use.
