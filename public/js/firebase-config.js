// Firebase Configuration
// Import required Firebase modules (loaded via CDN in HTML)

const firebaseConfig = {
  apiKey: "AIzaSyCmeGLMVe_H3Aqmsih3E-lJ_iczwHW1Yrw",
  authDomain: "smusic-8db74.firebaseapp.com",
  projectId: "smusic-8db74",
  storageBucket: "smusic-8db74.firebasestorage.app",
  messagingSenderId: "441440445858",
  appId: "1:441440445858:web:3bcf250c95952e2dbb7efb",
  measurementId: "G-QFST25GZ44"
};

// Initialize Firebase (will be done after Firebase SDK loads)
let firebaseApp = null;
let firebaseAnalytics = null;
let firebaseAuth = null;

// Initialize Firebase when DOM is ready and Firebase SDK is loaded
const initFirebase = async () => {
  try {
    // Initialize the app
    firebaseApp = firebase.initializeApp(firebaseConfig);
    
    // Initialize Analytics
    firebaseAnalytics = firebase.analytics();
    
    // Initialize Auth
    firebaseAuth = firebase.auth();
    
    console.log('✅ Firebase initialized successfully');
    
    // Log page view
    firebase.analytics().logEvent('page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
    
    return firebaseApp;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    return null;
  }
};

// Wait for Firebase SDK to be available
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase !== 'undefined') {
      initFirebase();
    }
  });
} else {
  // DOM is already loaded
  if (typeof firebase !== 'undefined') {
    initFirebase();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, initFirebase };
}
