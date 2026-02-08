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

1. Create a Firebase project at https://console.firebase.google.com and enable a Realtime Database.
2. In the Realtime Database rules editor you can paste the provided `firebase.rules.json` for testing. Important: these rules are permissive for demo purposes — secure them before production (use Firebase Authentication and rule checks).
3. Install the Firebase CLI (optional, for deploying rules):

```bash
npm install -g firebase-tools
firebase login
firebase use --add your-project-id
```

4. Deploy database rules (optional):

```bash
firebase deploy --only database
```

5. Add the Firebase config values shown in Project Settings → Your apps to Vercel environment variables or locally in `.env.local` (copy `.env.local.example`). Set the following names exactly:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

6. Push the repo to GitHub and import into Vercel. In Vercel project settings add the same environment variables (set them for Production and Preview as needed).

Notes & limitations
- This demo uses simple client-side role checks (username+pass); for production, replace with secure auth and server-side rules.
- Realtime behavior depends on Firebase; no server sockets are required so Vercel works fine.
# formsads
sd
