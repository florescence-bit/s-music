# Firebase Integration Guide for S-Music

This document explains how Firebase is integrated into the S-Music app and how to configure it.

## 📋 Overview

S-Music uses Firebase for:
- **Analytics** — Track user engagement and behavior
- **Authentication** — User login/signup (future feature)
- **Cloud Storage** — Store user playlists and preferences
- **Realtime Database** — Sync playlists across devices (future)

## 🔐 Firebase Credentials

Your Firebase project credentials are stored in:

### Client-side (`public/js/firebase-config.js`)
- Contains the public Firebase config (safe to expose in frontend)
- Initializes Firebase SDK from CDN
- Sets up Analytics and Auth

### Server-side (`api/utils/firebase-config.js`)
- Contains the same public config
- For backend Firebase Admin operations, use a service account key

## 🚀 Getting Started

### 1. Verify Firebase Setup

Firebase is already initialized via CDN in `public/index.html`. The Firebase SDKs are loaded from:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js"></script>
```

### 2. Check Firebase Console

Visit [Firebase Console](https://console.firebase.google.com/) and select the **smusic-8db74** project.

### 3. Current Features Enabled

✅ **Analytics** — Automatically tracking page views and user events
✅ **Authentication** — Ready for email/password, Google, GitHub logins

## 💻 Using Firebase in Code

### Analytics

```javascript
// Log custom event
firebase.analytics().logEvent('play_song', {
  song_name: 'Carrying You',
  artist: 'Joe Hisaishi'
});

// Log page view
firebase.analytics().logEvent('page_view', {
  page_title: 'Playlists',
  page_location: window.location.href
});
```

### Authentication (Frontend)

```javascript
// Sign up with email
firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(userCredential => console.log('User created:', userCredential.user))
  .catch(error => console.error('Signup error:', error));

// Sign in with email
firebase.auth().signInWithEmailAndPassword(email, password)
  .then(userCredential => console.log('Logged in:', userCredential.user))
  .catch(error => console.error('Login error:', error));

// Sign out
firebase.auth().signOut();

// Listen for auth state changes
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user.uid);
  } else {
    console.log('User logged out');
  }
});
```

## 🔐 Security Rules

### Firestore Rules (for database access)
Set these in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own playlists
    match /users/{userId}/playlists/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Public playlists
    match /publicPlaylists/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 📦 Server-Side Setup (Optional)

For backend Firebase operations, install Firebase Admin SDK:

```bash
npm install firebase-admin
```

Then initialize in your backend:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smusic-8db74.firebaseio.com"
});

const db = admin.firestore();
```

**Getting Service Account Key:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click Project Settings (gear icon)
3. Go to "Service Accounts" tab
4. Click "Generate New Private Key"
5. Save as `service-account-key.json` in project root
6. **⚠️ Never commit this file to Git! Add to `.gitignore`**

## 🔄 Integration Checklist

- [ ] Firebase SDKs loaded in HTML
- [ ] Firebase config initialized on app load
- [ ] Analytics tracking page views
- [ ] (Optional) Setup Authentication UI
- [ ] (Optional) Enable Firestore Database
- [ ] (Optional) Enable Cloud Storage
- [ ] (Optional) Setup security rules
- [ ] (Optional) Download and setup service account key

## 📊 Monitoring

View real-time analytics:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **smusic-8db74** project
3. Click **Analytics** in left sidebar
4. Monitor user engagement, events, and behavior

## 🚨 Troubleshooting

### Firebase not initializing
- Check browser console for errors
- Verify Firebase SDKs are loaded (check Network tab in DevTools)
- Ensure config is correct

### Analytics not tracking
- Check if user has allowed tracking (privacy settings)
- Wait 24 hours for data to appear in dashboard
- Use `firebase.analytics().logEvent()` for custom events

### Auth errors
- Check Firebase Console > Authentication > Settings
- Verify email/password auth is enabled
- Check security rules in Firestore/Storage

## 🔗 Useful Links

- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)

## 📝 Next Steps

1. **Setup User Authentication** — Add login/signup pages
2. **Enable Firestore** — Store user playlists in cloud
3. **Enable Cloud Storage** — Store user avatars and profile data
4. **Implement Real-time Sync** — Keep playlists synced across devices
5. **Add Offline Support** — Sync when user comes back online

---

For questions or issues, check the [Firebase Documentation](https://firebase.google.com/docs).
