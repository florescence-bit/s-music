// Firebase Admin Configuration (for server-side use)
// Install: npm install firebase-admin

const firebaseConfig = {
  apiKey: "AIzaSyCmeGLMVe_H3Aqmsih3E-lJ_iczwHW1Yrw",
  authDomain: "smusic-8db74.firebaseapp.com",
  projectId: "smusic-8db74",
  storageBucket: "smusic-8db74.firebasestorage.app",
  messagingSenderId: "441440445858",
  appId: "1:441440445858:web:3bcf250c95952e2dbb7efb",
  measurementId: "G-QFST25GZ44"
};

// Note: For production, use Firebase Admin SDK with service account key
// Download from: Firebase Console > Project Settings > Service Accounts
// Place the service-account-key.json file in the project root
// Then initialize with:
// const admin = require('firebase-admin');
// const serviceAccount = require('./service-account-key.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

module.exports = { firebaseConfig };
