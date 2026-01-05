# SeizoWatch Dashboard - Firebase Integration

## Overview
Real-time seizure monitoring dashboard integrated with Firebase Realtime Database. The dashboard automatically updates as new seizure events are detected by the Python backend.

## Architecture

### Data Flow
```
Python Backend → Firebase Realtime Database → React Dashboard
```

### Firebase Structure
```
seizure_events/
  └── {auto_generated_id}/
       ├── timestamp (string)
       ├── duration_seconds (number)
       ├── avg_motion (number)
       ├── max_motion (number)
       ├── dominant_frequency (number)
       ├── rule_based (boolean)
       ├── dl_verified (boolean)
```

## Setup Instructions

### 1. Firebase Configuration

Update `src/firebase.js` with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**To get your Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Scroll to "Your apps" section
5. Click on the web app or create one
6. Copy the configuration object

### 2. Install Dependencies

```bash
cd dashboard
npm install
```

### 3. Run the Dashboard

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000` (or the port Vite assigns).

## Features

### Dashboard Page
- **Total Events**: Count of all detected seizure events
- **DL Verified**: Number of deep learning verified events
- **Last Event**: Timestamp of most recent event
- **System Status**: Active/Inactive indicator (active if data received in last 5 minutes)
- **Recent Events Preview**: Shows last 5 events with key metrics

### Events Page
- **Complete Event List**: All seizure events sorted by latest first
- **Filtering**: Filter by All, DL Verified, or Rule-Based events
- **Event Details**: Each card displays:
  - Timestamp
  - Duration (seconds)
  - Dominant frequency (Hz)
  - Average motion
  - Maximum motion
  - Verification badges

### Analytics Page
- **Events Per Day**: Average event frequency
- **Average Duration**: Mean duration across all events
- **Peak Frequency**: Highest dominant frequency recorded
- **Verification Rate**: Percentage of DL-verified events
- **7-Day Activity Chart**: Bar chart showing daily event counts
- **Motion Statistics**: Aggregate motion metrics

## Real-Time Updates

The dashboard uses Firebase's `onValue` listeners to automatically update when:
- New seizure events are added
- Existing events are modified
- Events are removed

No page refresh is required - the UI updates instantly.

## Custom Hook: useSeizureEvents

Located at `src/hooks/useSeizureEvents.js`, this hook:
- Fetches data from Firebase Realtime Database
- Listens for real-time updates
- Sorts events by timestamp (latest first)
- Handles loading and error states
- Cleans up listeners on component unmount

**Usage:**
```javascript
import { useSeizureEvents } from '../hooks/useSeizureEvents';

function MyComponent() {
  const { events, loading, error } = useSeizureEvents();
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return <div>{events.map(e => ...)}</div>;
}
```

## State Management

- **Loading State**: Displayed while fetching initial data
- **Error State**: Shows error message if Firebase connection fails
- **Empty State**: Friendly message when no events exist

## Styling

Each page has its own CSS file:
- `Dashboard.css` - Dashboard page styles
- `Events.css` - Events page styles
- `Analytics.css` - Analytics page styles

All styles follow a modern, clean design with:
- Card-based layouts
- Smooth transitions and hover effects
- Responsive grid systems
- Consistent color scheme
- Loading spinners and animations

## Production Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy
The `dist` folder can be deployed to:
- Firebase Hosting
- Vercel
- Netlify
- Any static hosting service

## Security Considerations

1. **Firebase Rules**: Set up proper security rules in Firebase Console:
```json
{
  "rules": {
    "seizure_events": {
      ".read": true,
      ".write": false  // Only backend can write
    }
  }
}
```

2. **Environment Variables**: In production, use environment variables for Firebase config:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
# ... etc
```

## Troubleshooting

### No Data Showing
1. Check Firebase configuration in `firebase.js`
2. Verify Firebase Realtime Database rules allow read access
3. Confirm Python backend is writing to correct path (`seizure_events/`)
4. Check browser console for errors

### Real-Time Updates Not Working
1. Ensure you're using Firebase Realtime Database (not Firestore)
2. Check network tab for active websocket connection
3. Verify Firebase project has Realtime Database enabled

### Permission Denied Error
- Update Firebase security rules to allow read access
- Check if API key is correct

## Dependencies

- **react**: ^18.2.0
- **react-dom**: ^18.2.0
- **firebase**: ^10.7.1
- **react-router-dom**: ^6.21.1
- **lucide-react**: ^0.303.0 (for icons)
- **framer-motion**: ^10.16.16 (for animations)

## File Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   └── Sidebar.css
│   ├── hooks/
│   │   └── useSeizureEvents.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── Events.jsx
│   │   ├── Events.css
│   │   ├── Analytics.jsx
│   │   └── Analytics.css
│   ├── App.jsx
│   ├── App.css
│   ├── firebase.js
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

## Support

For issues or questions, check:
- Firebase Console logs
- Browser console errors
- Network tab for API calls
- Firebase Realtime Database data viewer
