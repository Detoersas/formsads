# Live Support (Next.js + Firebase)

A functional live chat support system with real-time messaging, typing indicators, and multi-device support.

**Features:**
- Host (username `dex`, passcode `1982`) can view all support requests and respond to them
- Regular users can create support sessions and chat with the host in real-time
- Typing indicators show when someone is typing
- Host online/offline status visible to users
- Works across multiple devices via Firebase Realtime Database
- Local fallback for testing without Firebase (single-device only)

## Setup Firebase (Required for Multi-Device Support)

### Step 1: Create a Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create Project" and give it a name (e.g., "livesupport")
3. Complete the creation wizard

### Step 2: Enable Realtime Database
1. In Firebase Console, navigate to **Realtime Database**
2. Click **Create Database**
3. Choose your region
4. Select **Start in test mode** (for development; switch to locked mode when ready)
5. Copy the Database URL (looks like `https://your-project-default-rtdb.firebaseio.com`)

### Step 3: Get Firebase Web App Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click on your web app (or add one if needed)
4. Copy the config object with these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
   - `databaseURL` (from Realtime Database section)

### Step 4: Configure Environment Variables

**For Local Development:**
```bash
cp .env.local.example .env.local
# Edit .env.local and paste the Firebase values you copied above
```

**For Vercel Deployment:**
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add each variable (these must be in production, preview, and development):
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = your apiKey
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = your authDomain
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL` = your databaseURL
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = your projectId
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = your storageBucket
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = your messagingSenderId
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = your appId

3. Redeploy your Vercel project after adding environment variables

### Step 5: Deploy Database Rules (Optional but Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy rules: `firebase deploy --only database`

## Deployment to Vercel

1. Push your repo to GitHub
2. In Vercel, click **Import Project**
3. Select your GitHub repository
4. Add the environment variables listed above (Settings → Environment Variables)
5. Click **Deploy**

After deployment, test with the Vercel URL—users on different devices should be able to chat in real-time.

## Testing

### Local Testing
1. Make sure `.env.local` is set up with your Firebase config
2. Run: `npm install && npm run dev`
3. Open http://localhost:3000 in two different browsers/tabs:
   - Tab A: Log in as host (`dex` / `1982`) → redirects to `/host?user=dex`
   - Tab B: Log in as user → creates a chat session
4. Send messages—they should appear in real-time on both tabs
5. Typing indicator should show when someone is typing

### Testing on Different Devices
- Host: Open your Vercel URL and go to `/host?user=dex`
- User device: Open the same Vercel URL and log in with any username and 4-digit passcode
- Messages and typing should sync across devices in real-time

### Troubleshooting

**Messages not appearing / Chat not working:**
- Verify `.env.local` (local) or Vercel environment variables have correct Firebase config
- Check that `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is exactly correct
- In Firebase Console, check Realtime Database exists and has test mode enabled
- Check browser console for errors (F12 → Console tab)

**Host status not showing:**
- Make sure the `presence/dex` path exists in your Realtime Database
- Check that database rules allow read/write (test mode does by default)

**App only works on one device:**
- You're likely using local fallback (no Firebase config). Firebase config must be set for cross-device support.
- Verify all 7 `NEXT_PUBLIC_FIREBASE_*` environment variables are set on Vercel

**Build errors on Vercel:**
- Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel project settings
- Try redeploying after updating variables (sometimes Vercel needs a force redeploy)

## How It Works

- **Login Page** (`/`): Shows host online status and allows username + 4-digit passcode login
- **User Chat Page** (`/chat?session=ID&user=NAME`): Regular users chat here; each session is a separate conversation
- **Host Dashboard** (`/host?user=dex`): Only accessible with credentials `dex`/`1982`; lists all active sessions and allows the host to respond to users
- **Real-time Sync**: All messages and typing state stored in Firebase Realtime Database under `sessions/{sessionId}`
- **Presence**: Host status kept in `presence/dex`; cleared when host disconnects
