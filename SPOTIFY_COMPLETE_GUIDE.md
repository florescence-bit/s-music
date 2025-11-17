# 🎵 Spotify Web API Integration - Complete Guide

## ✅ What's Been Done

Your S-Music application now has **complete Spotify Web API backend integration**. Here's what was implemented:

### Backend Enhancements
✅ **7 Spotify API Endpoints** with full error handling and caching  
✅ **OAuth2 Client Credentials Flow** - Secure server-to-server authentication  
✅ **Smart Token Caching** - Auto-refresh after 1 hour  
✅ **In-Memory Caching** - Reduce API calls, improve performance  
✅ **Error Handling** - Graceful failures with meaningful error messages  
✅ **Rate Limiting Ready** - Foundation for handling 429 responses  

### New Files Created
- **`SPOTIFY_API_SETUP.md`** - 300+ line comprehensive guide with code examples
- **`SPOTIFY_SETUP_QUICK.md`** - Quick 5-10 minute setup checklist
- **`SPOTIFY_INTEGRATION_SUMMARY.md`** - Overview and troubleshooting
- **`.env.example`** - Template for your credentials

### Files Updated
- **`server.js`** - Added 8 Spotify endpoints
- **`README.md`** - Updated with Spotify setup and API documentation
- **`package.json`** - Added `axios` and `dotenv` dependencies

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Spotify Credentials (5 minutes)
1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Sign in or create a free Spotify account
3. Create a new app
4. Copy your **Client ID** and **Client Secret**

### Step 2: Create `.env` File (1 minute)
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
SPOTIFY_CLIENT_ID=your_actual_client_id
SPOTIFY_CLIENT_SECRET=your_actual_client_secret
PORT=3000
```

⚠️ **IMPORTANT**: 
- The `.env` file is in `.gitignore` - never commit it!
- Keep Client Secret private
- Don't share this file

### Step 3: Install & Run (2 minutes)
```bash
# Install dependencies (if not done already)
npm install

# Start the server
npm start

# Visit http://localhost:3000
```

---

## 🔌 Available API Endpoints

All endpoints are proxied through your backend for security:

### 1. Search for Tracks
```bash
GET /api/spotify/search?q=drake&type=track&limit=20

curl "http://localhost:3000/api/spotify/search?q=adele&limit=10"
```

Response includes track name, artist, album art, preview URL, duration, and Spotify link.

### 2. Featured Playlists
```bash
GET /api/spotify/featured?limit=20

curl "http://localhost:3000/api/spotify/featured"
```

Get Spotify's curated featured playlists.

### 3. New Releases
```bash
GET /api/spotify/new-releases?limit=20

curl "http://localhost:3000/api/spotify/new-releases"
```

Get latest album releases on Spotify.

### 4. Get Playlist Tracks
```bash
GET /api/spotify/playlist/{playlistId}/tracks?limit=50

curl "http://localhost:3000/api/spotify/playlist/37i9dQZF1DXcBWIGoYBM5M/tracks"
```

### 5. Get Track Details
```bash
GET /api/spotify/track/{trackId}

curl "http://localhost:3000/api/spotify/track/11dFghVXANMlKmJXsNCQvb"
```

### 6. Artist Top Tracks
```bash
GET /api/spotify/artist/{artistId}/top-tracks

curl "http://localhost:3000/api/spotify/artist/4q3ewBGtreuKH4mWScXaguP/top-tracks"
```

### 7. Get Recommendations
```bash
GET /api/spotify/recommendations?seed_tracks={trackId}&limit=20

curl "http://localhost:3000/api/spotify/recommendations?seed_tracks=11dFghVXANMlKmJXsNCQvb"
```

### 8. Audio Features
```bash
GET /api/spotify/audio-features/{trackId}

curl "http://localhost:3000/api/spotify/audio-features/11dFghVXANMlKmJXsNCQvb"
```

Returns: danceability, energy, key, loudness, mode, speechiness, acousticness, instrumentalness, liveness, valence, tempo.

---

## 📊 Response Format Example

### Search Response
```json
{
  "tracks": {
    "items": [
      {
        "id": "11dFghVXANMlKmJXsNCQvb",
        "name": "God's Plan",
        "artists": [
          {
            "name": "Drake",
            "id": "4q3ewBGtreuKH4mWScXaguP"
          }
        ],
        "album": {
          "name": "Scorpion",
          "images": [
            {
              "url": "https://i.scdn.co/image/...",
              "height": 300,
              "width": 300
            }
          ]
        },
        "preview_url": "https://p.scdn.co/preview/...",
        "duration_ms": 238000,
        "external_urls": {
          "spotify": "https://open.spotify.com/track/11dFghVXANMlKmJXsNCQvb"
        }
      }
    ]
  }
}
```

---

## 🔒 Security

### How It Works
1. Your backend has the Spotify credentials (Client ID & Secret)
2. Frontend calls your backend endpoints (e.g., `/api/spotify/search`)
3. Backend authenticates with Spotify securely
4. Backend returns data to frontend
5. **Secrets never exposed to browser**

### Best Practices
✅ Keep `.env` in `.gitignore`  
✅ Never commit `.env` to git  
✅ Use environment variables in production  
✅ Rotate credentials if accidentally exposed  
✅ Use HTTPS in production  

---

## 🧪 Testing

### Test 1: Server Health
```bash
curl "http://localhost:3000/api/health"
# Should return: {"status":"ok"}
```

### Test 2: Search API
```bash
curl "http://localhost:3000/api/spotify/search?q=drake"
# Should return Spotify tracks
```

### Test 3: Featured Playlists
```bash
curl "http://localhost:3000/api/spotify/featured?limit=5"
# Should return Spotify featured playlists
```

### Test 4: New Releases
```bash
curl "http://localhost:3000/api/spotify/new-releases?limit=5"
# Should return latest albums
```

---

## 🔧 Advanced Configuration

### Change Cache Duration
In `server.js`, adjust `CACHE_TTL`:
```javascript
const CACHE_TTL = 3600000; // 1 hour in milliseconds
// Change to: 1800000 for 30 minutes
// or: 7200000 for 2 hours
```

### Change Token Buffer
For more aggressive token refresh:
```javascript
tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 300000; // 5 min buffer
```

### Add Rate Limiting
Install package:
```bash
npm install express-rate-limit
```

Add to `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📱 Frontend Integration (Next Step)

You'll need to update `public/js/App.js` and `public/js/Pages.js` to:

1. Call `/api/spotify/search` instead of `/api/search`
2. Convert Spotify track format to player format:
```javascript
function spotifyToPlayer(track) {
  return {
    n: track.name,
    a: track.artists[0]?.name,
    i: track.album.images[0]?.url,
    s: track.preview_url,
    d: track.duration_ms / 1000
  };
}
```

3. Update featured/new releases to call Spotify endpoints
4. Update player to handle 30-second Spotify previews

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'axios'"
**Solution**: Run `npm install axios dotenv`

### Error: "SPOTIFY_CLIENT_ID is not defined"
**Solution**: 
1. Create `.env` file
2. Add your credentials
3. Restart server

### Error: "401 Unauthorized"
**Troubleshooting**:
- Check Client ID is correct
- Check Client Secret is correct
- Verify no extra spaces in `.env`
- Make sure you're using Client ID & Secret, not Access Token

### Error: "429 Too Many Requests"
**Solution**: You've hit rate limits. The cache helps prevent this. Try:
1. Wait 1 minute before retrying
2. Implement exponential backoff
3. Reduce request frequency

### Search returns no results
**Check**:
1. Is the search query valid? (not empty)
2. Are you connected to the internet?
3. Check browser console for errors
4. Check server logs for API errors

### Preview doesn't play
**Note**: Not all Spotify tracks have preview URLs. Some may return `null` for `preview_url`.

---

## 📚 Additional Resources

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Spotify API Reference](https://developer.spotify.com/documentation/web-api/reference)
- [Rate Limiting Guide](https://developer.spotify.com/documentation/web-api/guides/rate-limits)
- [Authorization Guide](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)

---

## 🎯 Next Steps

1. ✅ **Complete Setup** - Follow steps above
2. 📝 **Update Frontend** - Modify `App.js` and `Pages.js` to use Spotify endpoints
3. 🧪 **Test Features** - Search, featured, new releases, playback
4. 🔐 **Add Firebase Auth** - Optional user authentication (see FIREBASE_SETUP.md)
5. 🚀 **Deploy** - Push to Vercel, Heroku, or your host

---

## 📞 Support

If you encounter issues:
1. Check `SPOTIFY_SETUP_QUICK.md` for quick troubleshooting
2. Review `SPOTIFY_API_SETUP.md` for detailed setup
3. Check server logs: `npm start` (shows all errors)
4. Verify `.env` file exists and has correct credentials
5. Test with `curl` commands above

---

**Congratulations!** Your Spotify-integrated music player backend is ready. Next step: Update the frontend! 🎵
