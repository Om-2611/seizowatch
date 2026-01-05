# Quick Start: Firebase Setup

## Step 1: Update Firebase Configuration

Open `src/firebase.js` and replace the placeholder values with your actual Firebase credentials.

### Where to find your credentials:
1. Go to https://console.firebase.google.com/
2. Select your SeizoWatch project
3. Click the gear icon ⚙️ → Project settings
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" → Web
6. Copy the configuration object

### Example (replace with your values):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABCDEFGH_example123456789",
  authDomain: "seizowatch-12345.firebaseapp.com",
  databaseURL: "https://seizowatch-12345-default-rtdb.firebaseio.com",
  projectId: "seizowatch-12345",
  storageBucket: "seizowatch-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 2: Configure Firebase Security Rules

In Firebase Console:
1. Go to Realtime Database
2. Click on "Rules" tab
3. Set these rules:

```json
{
  "rules": {
    "seizure_events": {
      ".read": true,
      ".write": false
    }
  }
}
```

This allows:
- ✅ Dashboard to read events (frontend read-only)
- ✅ Python backend to write events (if using Firebase Admin SDK with service account)
- ❌ Frontend cannot write (security)

## Step 3: Start the Dashboard

```bash
cd dashboard
npm run dev
```

Visit the URL shown in terminal (usually http://localhost:5173)

## Step 4: Test with Sample Data

You can manually add test data in Firebase Console:
1. Go to Realtime Database
2. Click on the "+" icon
3. Add this structure:

```
seizure_events/
  - test_event_1:
      timestamp: "2026-01-04T15:30:00"
      duration_seconds: 5.2
      avg_motion: 0.45
      max_motion: 0.82
      dominant_frequency: 4.5
      rule_based: true
      dl_verified: true
```

The dashboard should update immediately!

## Troubleshooting

### "Permission Denied" error
→ Update Firebase security rules (see Step 2)

### "Failed to fetch" error
→ Check if `databaseURL` is correct in `firebase.js`

### Dashboard shows "No events"
→ Check Firebase Console to confirm data exists under `seizure_events/`

### Changes not appearing in real-time
→ Ensure you're using Realtime Database, not Firestore

## Next Steps

Once configured:
- Dashboard will auto-update when Python backend writes events
- No page refresh needed
- All three pages (Dashboard, Events, Analytics) will show live data
