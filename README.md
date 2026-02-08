# Live Support (Next.js + Firebase)

This is a minimal live support demo intended to be deployed on Vercel. It uses Firebase Realtime Database for realtime messaging and typing indicators.

Important: You must create a Firebase project and provide the Realtime Database URL and other config via environment variables in Vercel or a local `.env.local`.

Local fallback: If you don't provide Firebase config the app will use a local fallback (BroadcastChannel + `localStorage`) so you can test realtime behaviour across browser tabs without Firebase. This is intended for development only — for production deploy a real Firebase project and set the `NEXT_PUBLIC_FIREBASE_*` variables.

Environment variables (set these in Vercel or `.env.local`):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

How it works
- Login at `/` with a username and a 4-digit numeric passcode.
- Host credentials: username `dex` and passcode `1982` — this account can see all sessions at `/host?user=dex`.
- Regular users are routed to `/chat?session=<id>&user=<name>` which creates a session and allows messaging.
- Typing state and messages are stored in Firebase under `sessions/{sessionId}`.

Run locally

```bash
npm install
npm run dev
```

Deploy to Vercel

1. Create Firebase project and a Realtime Database (set rules as needed for testing).
1. Create Firebase project and a Realtime Database (set rules as needed for testing). For quick testing you can use `firebase.rules.json` included at the repo root — replace with secure rules before production.
2. Copy `.env.local.example` to `.env.local` and fill the values, or add the same variables in Vercel.
3. Add this project to Vercel and set the environment variables there.
4. Push this repository to GitHub and import to Vercel.

Notes & limitations
- This demo uses simple client-side role checks (username+pass); for production, replace with secure auth and server-side rules.
- Realtime behavior depends on Firebase; no server sockets are required so Vercel works fine.
# formsads
sd
