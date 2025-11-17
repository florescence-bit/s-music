# Spotify API Setup Checklist

Follow these steps to get S-Music running with Spotify Web API:

## ✅ Step 1: Get Spotify Credentials (5 min)
- [ ] Go to https://developer.spotify.com/dashboard
- [ ] Sign in with your Spotify account (or create free account)
- [ ] Click "Create an App"
- [ ] Accept terms and create app
- [ ] Copy **Client ID** and **Client Secret**

## ✅ Step 2: Setup Environment (2 min)
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
# or use your favorite editor
```

Add to `.env`:
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

⚠️ **Important**: Never share or commit `.env` to git!

## ✅ Step 3: Install Dependencies (3 min)
```bash
npm install
```

## ✅ Step 4: Start Server (1 min)
```bash
# Development with auto-reload
npm run dev

# Or production
npm start
```

Visit: http://localhost:3000

## ✅ Step 5: Test Features (5 min)

### Test Search
1. Click the search icon (top right)
2. Type "Drake" or any artist
3. See results from Spotify
4. Click "Play" to preview

### Test Featured Playlists
1. Go to Home tab
2. See featured playlists from Spotify

### Test New Releases
1. Check Home page
2. See latest album releases

### Test Playlists
1. Click "Add" on any song
2. Go to "Playlists" tab
3. Create a new playlist
4. Add songs to it
5. Refresh page - playlist persists!

### Test Favorites
1. Click the heart icon on any song
2. Go to "Favourites" tab
3. See your liked songs

## 🎵 Common Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Install new dependencies
npm install <package-name>

# Test API endpoint
curl "http://localhost:3000/api/spotify/search?q=adele"
```

## 🔍 Troubleshooting

### Error: "Cannot find module 'axios'"
**Fix**: Run `npm install`

### Error: "Failed to get Spotify token"
**Check**:
1. `.env` file exists with correct credentials
2. `SPOTIFY_CLIENT_ID` is set
3. `SPOTIFY_CLIENT_SECRET` is set
4. Values have no extra spaces or quotes

### Error: "ECONNREFUSED" when accessing http://localhost:3000
**Check**:
1. Server is running: `npm start`
2. Port 3000 is not in use: `lsof -i :3000`
3. Try different port: `PORT=8000 npm start`

### Search returns empty results
**Check**:
1. Spotify token is valid (check server logs)
2. Query is not empty
3. Check browser console for errors

## 📚 Next Steps

1. **Read Full Documentation**: See [SPOTIFY_API_SETUP.md](./SPOTIFY_API_SETUP.md)
2. **Add Firebase**: See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for user auth
3. **Deploy**: Follow [README.md](./README.md) deployment section
4. **Customize**: Modify `public/style/style.css` for your design

## ✨ You're Ready!

Your Spotify-integrated music player is ready to use. Enjoy! 🎵

For issues or questions, check:
- [SPOTIFY_API_SETUP.md](./SPOTIFY_API_SETUP.md) - Detailed API guide
- [README.md](./README.md) - Full documentation
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase integration guide
