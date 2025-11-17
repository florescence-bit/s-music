# 🚀 Quick Setup Guide - S-Music

Your `.env` file has been created! Follow these steps to get everything working.

## Step 1: Get Spotify Credentials (5 minutes)

### A. Create a Spotify Account
1. Visit: https://www.spotify.com/signup
2. Create a free account (or use existing)
3. Save your email & password

### B. Register Your App
1. Go to: https://developer.spotify.com/dashboard
2. Sign in with your Spotify account
3. Click "Create an App"
4. Fill in app name: `S-Music`
5. Check the terms box
6. Click "Create"
7. Accept the agreements
8. You'll see your **Client ID** and **Client Secret**

### C. Set Redirect URI
1. In your app on the Spotify Dashboard
2. Click "Edit Settings"
3. Under "Redirect URIs" add: `http://localhost:3000/callback`
4. Click "Add" then "Save"

### D. Update `.env` File
Copy your credentials into `.env` in the project root:

```bash
# Open the .env file
nano .env
```

Replace these lines:
```
SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

Save the file (Ctrl+X, then Y, then Enter in nano)

---

## Step 2: Start the Server

```bash
npm start
```

Expected output:
```
✅ Server running at http://localhost:3000
📡 Spotify API: ✅ Connected
🔐 User Auth: ✅ Configured
```

If you see ❌ marks, your `.env` is missing values. Go back to Step 1.

---

## Step 3: Test the App

### Open in Browser
Visit: http://localhost:3000

### Test Firebase Authentication (Sign In/Up)
1. Click **"Sign Up"** button (top right)
2. Enter an email and password
3. Click "Create"
4. You should see your email in the header
5. Click "Sign Out" to logout
6. Click "Sign In" and log back in

✅ Firebase auth is working!

### Test Spotify User Login (Optional - requires Spotify account)
1. Click **"Get Top Tracks"** button (top right)
2. It will say "You must login with Spotify first"
3. (Advanced) Create a Spotify login button to test OAuth flow:
   - We'll add this in the next section

### Test Spotify Search (No login needed)
1. Use the search box to find songs by artist/track name
2. Results appear from Spotify API
3. Click to see song details

✅ Basic app is working!

---

## Step 4: Optional - Add Spotify Login Button

To enable full Spotify user features (save songs, create playlists), we can add a login button. Edit `public/index.html`:

Find the line:
```html
<button id="spotifyTopBtn" ...>Get Top Tracks</button>
```

Add this button right after it:
```html
<button id="spotifyLoginBtn" style="padding:6px 10px; border-radius:6px; background:#1db954; color:#000; border:none; cursor:pointer; font-weight:600;">Login with Spotify</button>
```

Then create a file `public/js/SpotifyAuth.js` with the OAuth logic (we can provide this).

---

## Troubleshooting

### ❌ "📡 Spotify API: Not configured"
**Solution**: Check `.env` has `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` with no empty values

### ❌ "🔐 User Auth: Not configured"  
**Solution**: Check `.env` has `SPOTIFY_REDIRECT_URI=http://localhost:3000/callback`

### ❌ Firebase Sign Up fails
**Solution**: Check browser console (F12) for errors. Firebase is already configured, just needs valid email/password.

### ❌ Search doesn't work
**Solution**: Make sure `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct in `.env`

### 🔴 Port 3000 already in use
**Solution**: Change `PORT` in `.env` to another number (e.g., 3001) then restart

---

## What's Working Now

| Feature | Status | How to Test |
|---------|--------|------------|
| Server | ✅ | `npm start` shows ready |
| Spotify Search | ✅ | Search box at top right |
| Spotify Featured Playlists | ✅ | Home page |
| Firebase Sign In/Up | ✅ | "Sign In" / "Sign Up" buttons |
| Spotify User Login | ⏳ | Need to complete Step 1 |
| Spotify Create Playlists | ⏳ | Need Spotify login |
| Spotify Save Songs | ⏳ | Need Spotify login |

---

## Next Steps

1. ✅ Complete Step 1: Get Spotify credentials
2. ✅ Complete Step 2: Start server
3. ✅ Complete Step 3: Test in browser
4. (Optional) Complete Step 4: Add Spotify login

---

## Files Created/Modified

- ✅ `.env` - Your credentials (in .gitignore, won't be committed)
- ✅ `public/index.html` - Added Sign In/Up and Get Top Tracks buttons
- ✅ `public/js/firebase-config.js` - Firebase already configured
- ✅ `server.js` - All endpoints ready

---

## Support

For detailed documentation:
- **START_HERE.md** - Project overview
- **SPOTIFY_COMPLETE_GUIDE.md** - Full Spotify API docs
- **SPOTIFY_USER_AUTH_QUICK.md** - User login details
- **README.md** - Complete feature list

---

**You're ready to go!** 🎵

Follow Steps 1-3 above and open http://localhost:3000 in your browser.
