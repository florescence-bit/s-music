# 🚀 S-Music Vercel Deployment Guide

## Current Status
- ✅ App deployed at: https://s-music-ki25.vercel.app/
- ⚠️ Missing environment variables (Spotify credentials)
- ⚠️ Home page sections empty (Featured, Trending, New Releases)
- ⚠️ Spotify features not working

## Step 1: Get Your Spotify Credentials

### On Spotify Developer Dashboard
1. Go to: https://developer.spotify.com/dashboard
2. Sign in or create account
3. Click "Create App"
4. Fill in app name: `S-Music Production`
5. Accept terms, click "Create"
6. Copy your **Client ID**
7. Copy your **Client Secret** (click "Show Client Secret")

### Update Spotify App Settings
1. Go to app settings
2. Add Redirect URI: **`https://s-music-ki25.vercel.app/callback`**
   - (NOT localhost - use your actual Vercel domain)
3. Click "Save"

---

## Step 2: Add Environment Variables to Vercel

### Via Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click on your **s-music** project
3. Click **Settings** tab (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add these three variables:

| Key | Value |
|-----|-------|
| `SPOTIFY_CLIENT_ID` | Paste your Client ID |
| `SPOTIFY_CLIENT_SECRET` | Paste your Client Secret |
| `SPOTIFY_REDIRECT_URI` | `https://s-music-ki25.vercel.app/callback` |

6. Click **Save** for each
7. You should see all three listed

### Via Vercel CLI (Alternative)
```bash
vercel env add SPOTIFY_CLIENT_ID
# Paste your Client ID
vercel env add SPOTIFY_CLIENT_SECRET
# Paste your Client Secret
vercel env add SPOTIFY_REDIRECT_URI
# Paste: https://s-music-ki25.vercel.app/callback
```

---

## Step 3: Redeploy Your App

After adding environment variables, Vercel needs to rebuild the app.

### Option A: Automatic (Recommended)
1. Push code to GitHub:
```bash
git add .
git commit -m "fix: improve home page data loading and error handling"
git push origin main
```
2. Vercel automatically redeploys (watch the Deployments tab)
3. Wait for "Ready" status (usually 2-3 minutes)

### Option B: Manual Redeploy
1. Go to Vercel Dashboard
2. Click your **s-music** project
3. Click **Deployments** tab
4. Find the latest deployment
5. Click the **⋮** (three dots) menu
6. Click **Redeploy**
7. Wait for "Ready" status

---

## Step 4: Verify Environment Variables Loaded

### Check Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click **s-music** project
3. Click **Deployments** (latest)
4. Click on the deployment
5. Scroll to "Environment Variables"
6. Verify all three variables are present ✅

### Check App Logs
1. In Vercel Dashboard, click **Functions** tab
2. Watch for any error messages
3. If you see connection errors, credentials might be wrong

### Test in Browser
1. Open: https://s-music-ki25.vercel.app/
2. Open DevTools Console (F12 → Console)
3. Look for messages like:
   - ✅ "Spotify API: Connected" = credentials working
   - ❌ "Spotify API: Not configured" = check env vars

---

## Step 5: Test Features

### Test Featured Playlists
1. Open https://s-music-ki25.vercel.app/
2. Look for "Featured" section on home page
3. Should show album art and track cards
4. If empty, check console for errors (F12)

### Test Search
1. Click search icon (top right)
2. Type song name (e.g., "Drake")
3. Should show results with album art
4. Click "Play" button to hear preview

### Test Spotify User Login
1. Click "Get Top Tracks" button (top right)
2. Should say "You must login with Spotify first"
3. (Optional) Implement Spotify login button

### Test Firebase Sign In/Up
1. Click "Sign In" or "Sign Up" (top right)
2. Enter email and password
3. Click "Create" or "Sign In"
4. Should see email displayed in header
5. Click "Sign Out" to logout

---

## Troubleshooting

### ❌ "Spotify API: Not configured" in console
**Problem:** Environment variables not loaded  
**Solution:**
1. Check Vercel dashboard has all three env vars
2. Verify spelling is EXACT:
   - `SPOTIFY_CLIENT_ID` (not `CLIENT_ID`)
   - `SPOTIFY_CLIENT_SECRET` (not `CLIENT_SECRET`)
   - `SPOTIFY_REDIRECT_URI` (not `REDIRECT_URI`)
3. Redeploy after adding env vars
4. Wait 2-3 minutes for rebuild

### ❌ "No featured playlists available"
**Problem:** API returning empty data  
**Solution:**
1. Check server logs (Vercel dashboard → Functions)
2. Verify `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are correct
3. Try locally: `npm start` and check `/api/featured`
4. Check if Spotify API is down (status.spotify.com)

### ❌ "Invalid redirect_uri"
**Problem:** OAuth callback failing  
**Solution:**
1. Check Spotify app settings: https://developer.spotify.com/dashboard
2. Verify Redirect URI is EXACTLY: `https://s-music-ki25.vercel.app/callback`
3. Make sure it's `https://` (not `http://`)
4. No trailing slashes
5. Save and wait a few seconds
6. Redeploy Vercel app

### ❌ Blank featured/trending sections
**Problem:** No tracks in response  
**Solution:**
1. Open browser console (F12)
2. Look for fetch errors
3. Try localhost first: `npm start`
4. If it works locally but not on Vercel, check env vars
5. If empty on both, try different endpoint

### ❌ Search doesn't work
**Problem:** /api/search returns no results  
**Solution:**
1. Check Spotify API credentials in Vercel env vars
2. Try: `/api/spotify/search?q=drake` (use Spotify endpoint instead)
3. Verify `SPOTIFY_CLIENT_ID` has correct format

---

## Environment Variables Quick Reference

```bash
# Copy this to Vercel Dashboard → Environment Variables

SPOTIFY_CLIENT_ID=your_actual_id_here
SPOTIFY_CLIENT_SECRET=your_actual_secret_here
SPOTIFY_REDIRECT_URI=https://s-music-ki25.vercel.app/callback
PORT=3000
NODE_ENV=production
```

---

## Next Steps

1. ✅ Get Spotify credentials
2. ✅ Add to Vercel Environment Variables
3. ✅ Redeploy the app
4. ✅ Verify in browser
5. (Optional) Improve UI with more features
6. (Optional) Add user accounts (Firebase)
7. (Optional) Deploy to custom domain

---

## Need Help?

- **Spotify Issues?** Check: https://developer.spotify.com/documentation
- **Vercel Issues?** Check: https://vercel.com/docs
- **Code Issues?** Check app logs: Vercel Dashboard → Deployments → Logs

---

**Status:** Your app is live at https://s-music-ki25.vercel.app/ 🎵  
Just need to add Spotify credentials to enable features!
