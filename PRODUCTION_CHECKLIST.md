# ✅ S-Music Production Deployment Checklist

## Pre-Deployment (Local Testing)

- [ ] **1. Environment Setup**
  - [ ] `.env` file created with `SPOTIFY_CLIENT_ID`
  - [ ] `.env` has `SPOTIFY_CLIENT_SECRET`
  - [ ] `.env` has `SPOTIFY_REDIRECT_URI=http://localhost:3000/callback`
  - [ ] `.env` has `PORT=3000`
  - [ ] `.env` is in `.gitignore` (not pushed to Git)

- [ ] **2. Local Testing**
  - [ ] Run `npm install` (all dependencies installed)
  - [ ] Run `npm start` (server starts without errors)
  - [ ] Console shows `✅ Server running at http://localhost:3000`
  - [ ] Console shows `📡 Spotify API: ✅ Connected`
  - [ ] Console shows `🔐 User Auth: ✅ Configured`

- [ ] **3. Feature Testing (Local)**
  - [ ] Search works (top search box)
  - [ ] Featured playlists load
  - [ ] Trending tracks show
  - [ ] New releases display
  - [ ] Player plays sample songs (preview_url)
  - [ ] Sign Up button opens modal
  - [ ] Can create Firebase account
  - [ ] Can sign in
  - [ ] Can sign out
  - [ ] Get Top Tracks shows error (need to login with Spotify)
  - [ ] All navigation pages load (Playlist, Tracks, Albums, Favorites)

---

## Vercel Deployment

- [ ] **4. Prepare Vercel**
  - [ ] Project already deployed at https://s-music-ki25.vercel.app/
  - [ ] GitHub repo connected (auto-deploy on push)

- [ ] **5. Set Environment Variables on Vercel**
  - [ ] Go to: https://vercel.com/dashboard → s-music → Settings → Environment Variables
  - [ ] Add `SPOTIFY_CLIENT_ID` = your Client ID
  - [ ] Add `SPOTIFY_CLIENT_SECRET` = your Client Secret
  - [ ] Add `SPOTIFY_REDIRECT_URI` = `https://s-music-ki25.vercel.app/callback`
  - [ ] Click "Save"
  - [ ] Vercel starts auto-redeploy

- [ ] **6. Update Spotify Dashboard Redirect URI**
  - [ ] Go to: https://developer.spotify.com/dashboard
  - [ ] Edit your app settings
  - [ ] Add Redirect URI: `https://s-music-ki25.vercel.app/callback`
  - [ ] Keep `http://localhost:3000/callback` for local testing
  - [ ] Click "Save"

- [ ] **7. Push to GitHub** (triggers Vercel redeploy)
  - [ ] Run: `git add -A`
  - [ ] Run: `git commit -m "Deploy: Complete app setup with production credentials"`
  - [ ] Run: `git push origin main`
  - [ ] Check Vercel dashboard for deployment status
  - [ ] Wait ~2-3 minutes for deployment to complete

- [ ] **8. Test on Vercel**
  - [ ] Visit: https://s-music-ki25.vercel.app/
  - [ ] Search for a song (should return results)
  - [ ] Featured playlists show
  - [ ] Trending tracks show
  - [ ] New releases show
  - [ ] Sign Up works
  - [ ] Sign In/Out works
  - [ ] Get Top Tracks button visible

---

## Production Testing (Vercel)

### Search & Discovery
- [ ] Search returns Spotify results
- [ ] Featured playlists load on home
- [ ] Trending section shows tracks
- [ ] New releases section shows albums
- [ ] Clicking a track opens player

### Authentication (Firebase)
- [ ] Sign Up modal appears
- [ ] Can create account with email/password
- [ ] Email displays in header after signup
- [ ] Sign Out button appears
- [ ] Can sign in again with same credentials

### User Features (Spotify OAuth - Optional)
- [ ] Get Top Tracks button visible
- [ ] Clicking it prompts Spotify login (if not signed in)
- [ ] After Spotify login, shows top tracks
- [ ] Session ID in URL: `/?session=...`

### Player
- [ ] Play button works
- [ ] Pause button works
- [ ] Track duration displays
- [ ] Seek bar functional
- [ ] Next/Prev skip songs
- [ ] Shuffle toggles on/off
- [ ] Repeat cycles through modes

### Navigation
- [ ] Playlist page loads
- [ ] Tracks page loads
- [ ] Albums page loads
- [ ] Favorites page loads
- [ ] Home button returns to home

### Responsive Design
- [ ] Desktop (1920px) → No layout breaks
- [ ] Tablet (768px) → Mobile-friendly layout
- [ ] Mobile (375px) → Touch-friendly buttons
- [ ] Landscape mode works on mobile

### Performance
- [ ] Page loads in <3 seconds
- [ ] Search responds in <1 second
- [ ] No console errors in browser dev tools (F12)
- [ ] Images load properly

---

## Post-Deployment

- [ ] **9. Monitor**
  - [ ] Check Vercel logs for errors
  - [ ] Monitor API rate limits
  - [ ] Check Firebase usage quota
  - [ ] Set up error alerts if needed

- [ ] **10. Document**
  - [ ] Update README with production URL
  - [ ] Document known limitations
  - [ ] Create user guide

- [ ] **11. Optional Future Enhancements**
  - [ ] Add user profiles
  - [ ] Add playlist management
  - [ ] Add recommendations
  - [ ] Add offline mode
  - [ ] Add dark/light mode toggle

---

## If Something Breaks

### Vercel Shows Error
1. Check Vercel logs: https://vercel.com/dashboard → s-music → Deployments
2. Look for error messages
3. Common fixes:
   - Missing environment variables → Add to Vercel Settings
   - Node version mismatch → Update vercel.json
   - Port not 3000 → Vercel uses PORT env var (should be fine)

### Features Not Working
1. Open browser dev tools: F12 → Console
2. Look for error messages
3. Check network tab for failed API calls
4. Most likely: Missing Spotify credentials in Vercel env vars

### Search Returns Empty
- Check `SPOTIFY_CLIENT_ID` is correct in Vercel
- Check `SPOTIFY_CLIENT_SECRET` is correct in Vercel
- Try redeploying: Vercel dashboard → Redeploy

### Firebase Auth Not Working
- Check browser console for Firebase errors
- Verify `public/js/firebase-config.js` has correct config
- Firebase is configured and should work out of the box

---

## Deployment Summary

| Step | Status | Time |
|------|--------|------|
| 1. Local setup | ⏳ | 5 min |
| 2. Local testing | ⏳ | 10 min |
| 3. Vercel env vars | ⏳ | 5 min |
| 4. Spotify redirect URI | ⏳ | 2 min |
| 5. Git push | ⏳ | 1 min |
| 6. Vercel deployment | ⏳ | 3 min |
| 7. Production testing | ⏳ | 10 min |
| **Total** | **⏳** | **~36 min** |

---

## Success Criteria

✅ All of these must work:

1. **Homepage loads** with Featured playlists and Trending tracks
2. **Search works** and returns Spotify results
3. **Firebase Sign Up** creates an account and shows email in header
4. **Firebase Sign Out** clears the session
5. **Player works** (play, pause, next, prev, seek)
6. **All pages work** (Playlist, Tracks, Albums, Favorites)
7. **No console errors** in browser dev tools
8. **Mobile responsive** — works on phone/tablet/desktop
9. **Fast loading** — pages load in under 3 seconds

---

Once all checkboxes are ✅, your S-Music app is production-ready! 🚀

**Questions?** See:
- DEPLOYMENT_AND_BUGFIX_GUIDE.md
- QUICK_SETUP_GUIDE.md
- README.md
