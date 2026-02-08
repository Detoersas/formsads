# Live Support (Next.js + Firebase)

A functional live chat support system with real-time messaging, typing indicators, and multi-device support.

**Status:** ✅ **Complete and Ready for Deployment**

**Features:**
- ✅ Host (username `dex`, passcode `1982`) can view all support requests and respond to them
- ✅ Regular users can create support sessions and chat with the host in real-time
- ✅ Typing indicators show when someone is typing
- ✅ Host online/offline status visible to users
- ✅ Works across multiple devices via Firebase Realtime Database
- ✅ Modern, responsive UI with gradient design
- ✅ Standalone pages (no shared components) for simplicity

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Set up .env.local with your Firebase config (see Setup section below)
# Copy from .env.local.example and fill in your Firebase credentials

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:3000
# Host login: username=dex, passcode=1982
# User login: any username, any 4 digits
```

## Project Structure

```
pages/
  index.js          - Login page (shows host status, passcode validation)
  chat.js           - User chat interface
  host.js           - Host dashboard (sessions list + chat)
lib/
  firebase.js       - Firebase SDK initialization & helpers
components/
  ChatWindow.jsx    - (Optional reusable chat component)
styles/
  globals.css       - Global styles (minimal)
.env.local          - Firebase credentials (NOT in git)
.env.local.example  - Template for environment variables
```

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

### Prerequisites
- GitHub repository with your code pushed
- Firebase project with Realtime Database configured
- All 7 `NEXT_PUBLIC_FIREBASE_*` environment variables ready

### Steps

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "ready for vercel deployment"
   git push origin main
   ```

2. **Import on Vercel**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your GitHub repository

3. **Add Environment Variables**
   - In Vercel project settings → **Environment Variables**
   - Add all 7 variables (must be checked for production, preview, AND development):
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### After Deployment
- Test on your Vercel URL in multiple browsers or devices
- Users should see "🟢 Host is online" if host is logged in
- Messages between users and host should sync in real-time

## Testing

### Local Testing
1. Make sure `.env.local` is set up with your Firebase config
2. Run: `npm install && npm run dev`
3. Open http://localhost:3000 in two different browsers/tabs:
   - Tab A: Log in as host (`dex` / `1982`) → redirects to `/host`
   - Tab B: Log in as user → creates a chat session
4. Send messages—they should appear in real-time on both tabs
5. Typing indicator should show when someone is typing

### Testing on Different Devices
- Host: Open your Vercel URL and log in as `dex` / `1982`
- User device: Open the same Vercel URL and log in with any username and 4-digit passcode
- Messages and typing should sync across devices in real-time

### Troubleshooting

**Messages not appearing / Chat not working:**
- Verify `.env.local` (local) or Vercel environment variables have correct Firebase config
- Check that `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is exactly correct
- In Firebase Console, check Realtime Database exists and has test mode enabled
- Check browser console for errors (F12 → Console tab)

**Host status not showing:**
- Make sure the `presence/host` path can be read in your Realtime Database
- Check that database rules allow read/write (test mode does by default)

**App only works on one device:**
- Firebase config must be set for cross-device support
- Verify all 7 `NEXT_PUBLIC_FIREBASE_*` environment variables are set on Vercel

**Build errors on Vercel:**
- Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel project settings
- Try redeploying after updating variables (sometimes Vercel needs a force redeploy)

## How It Works

- **Login Page** (`/`): Shows host online status and allows username + 4-digit passcode login
- **User Chat Page** (`/chat?session=ID&user=NAME`): Regular users chat here; each session is a separate conversation
- **Host Dashboard** (`/host`): Only accessible with credentials `dex`/`1982`; lists all active sessions and allows the host to respond to users
- **Real-time Sync**: All messages and typing state stored in Firebase Realtime Database under `chats/{sessionId}`
- **Presence**: Host status kept in `presence/host`; set to true when host logs in, false when logs out or closes the page

## Latest Changes (v2.0)

**Complete Rebuild for Simplicity & Reliability:**
- ✅ Pure Firebase architecture (no fallback complexity)
- ✅ Standalone pages - each route is self-contained (chat.js, host.js, index.js)
- ✅ Fixed Firebase SDK initialization (no more "ref is not a function" errors)
- ✅ Proper use of `set()` for booleans, `update()` for objects
- ✅ Real-time typing indicators and presence detection
- ✅ Modern gradient UI with responsive design
- ✅ All 7 Firebase environment variables properly configured
- ✅ Host presence managed automatically on login/logout

**Next.js Version:** 14.1.0  
**Firebase SDK:** 10.7.0  
**React:** 18.2.0

## File Reference

| File | Purpose |
|------|---------|
| `pages/index.js` | Login page with host status indicator |
| `pages/chat.js` | User chat interface for regular users |
| `pages/host.js` | Host dashboard with sessions list and chat |
| `lib/firebase.js` | Firebase SDK initialization and database helpers |
| `.env.local` | Environment variables (not committed to git) |
| `package.json` | Dependencies and build scripts |
| `firebase.json` | Firebase CLI configuration |
| `firebase.rules.json` | Realtime Database security rules |

## Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review browser console for error messages (F12 → Console)
3. Verify all environment variables are set correctly
4. Check Firebase Console to ensure Realtime Database is in test mode
5. Ensure you're using the correct host credentials: `dex` / `1982`
