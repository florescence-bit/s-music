# 🎵 Spotify User Authentication - Complete Implementation

## What's Been Added

Your S-Music app now has **full user authentication** with Spotify! Users can:

✅ Login with their Spotify account  
✅ View their top tracks  
✅ Create playlists  
✅ Save songs to their library  
✅ Get their saved tracks  
✅ Access their profile info  

## Files Created/Modified

### New Backend Endpoints (10 total)
```
GET  /api/spotify/login                    - Redirect to Spotify OAuth
GET  /callback                              - OAuth callback handler
GET  /api/spotify/me                        - Get user profile
GET  /api/spotify/me/top/tracks             - Get user's top tracks
GET  /api/spotify/me/tracks                 - Get user's saved tracks
POST /api/spotify/me/playlists              - Create new playlist
POST /api/spotify/playlists/:id/tracks      - Add songs to playlist
POST /api/spotify/me/tracks                 - Save tracks to library
POST /api/spotify/logout                    - Logout & clear session
```

### New Files
```
public/js/SpotifyAuth.js                    - Frontend auth manager class
SPOTIFY_USER_AUTH.md                        - Comprehensive implementation guide
SPOTIFY_USER_AUTH_QUICK.md                  - Quick start guide (5-10 min)
```

### Modified Files
```
server.js                                   - Added 10 new endpoints + auth logic
```

## Quick Setup (5 Steps)

### Step 1: Update `.env`
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Step 2: Update Spotify App Dashboard
1. Go to https://developer.spotify.com/dashboard
2. Edit your app settings
3. Add Redirect URI: `http://localhost:3000/callback`
4. Save

### Step 3: Add HTML Buttons

In `public/index.html`, add to your header:

```html
<button id="spotifyLoginBtn" class="login-btn">Login with Spotify</button>
<div id="userInfo" style="display:none; gap: 10px; align-items: center;">
  <img id="userAvatar" src="" alt="User" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
  <span id="userName"></span>
  <button id="logoutBtn" class="logout-btn">Logout</button>
</div>
```

### Step 4: Include SpotifyAuth.js

In `public/index.html`, add before closing `</body>`:

```html
<script src="/js/SpotifyAuth.js"></script>
```

### Step 5: Restart Server

```bash
npm start
```

Done! Users can now login with Spotify. 🎉

## Code Examples

### Get Top Tracks
```javascript
const topTracks = await spotifyAuth.getTopTracks(10);
console.log(topTracks.items.map(t => t.name));
```

### Create Playlist
```javascript
const playlist = await spotifyAuth.createPlaylist(
  'My Top Tracks',
  'Created by S-Music'
);
```

### Add Tracks to Playlist
```javascript
const trackUris = ['spotify:track:id1', 'spotify:track:id2'];
await spotifyAuth.addTracksToPlaylist(playlist.id, trackUris);
```

### Save Tracks to Library
```javascript
const trackIds = ['id1', 'id2'];
await spotifyAuth.saveTracks(trackIds);
```

### Get User Info
```javascript
const user = spotifyAuth.getUser();
console.log(user.display_name); // e.g., "John Doe"
```

## SpotifyAuth Class API

### Methods

```javascript
// Authentication
spotifyAuth.login()                              // Redirect to Spotify login
spotifyAuth.logout()                             // Logout
spotifyAuth.isLoggedIn()                         // Check if authenticated

// User Data
spotifyAuth.getUser()                            // Get profile object
spotifyAuth.getSessionId()                       // Get current session

// Top Tracks
spotifyAuth.getTopTracks(limit, timeRange)      // Get top tracks
// timeRange: 'short_term', 'medium_term', 'long_term'

// Saved Tracks
spotifyAuth.getSavedTracks(limit)               // Get liked songs

// Playlists
spotifyAuth.createPlaylist(name, description)   // Create playlist
spotifyAuth.addTracksToPlaylist(id, uris)       // Add songs to playlist
spotifyAuth.createPlaylistFromTracks(tracks)    // Create from array

// Library
spotifyAuth.saveTracks(ids)                     // Save tracks to library
```

## Integration Examples

### Add "Save to Spotify" Button to Track Card

```javascript
async function onSaveTrack(track) {
  if (!spotifyAuth.isLoggedIn()) {
    spotifyAuth.login();
    return;
  }
  
  await spotifyAuth.saveTracks([track.id]);
  alert('✅ Saved to Spotify!');
}
```

### Show Top Tracks on Home Page

```javascript
if (spotifyAuth.isLoggedIn()) {
  const topTracks = await spotifyAuth.getTopTracks(10);
  
  topTracks.items.forEach(track => {
    // Render track in your grid
  });
}
```

### Export Queue to Spotify Playlist

```javascript
async function exportToSpotify() {
  if (!spotifyAuth.isLoggedIn()) {
    spotifyAuth.login();
    return;
  }

  const playlist = await spotifyAuth.createPlaylistFromTracks(
    player.songs,
    `S-Music Export - ${new Date().toDateString()}`
  );

  // Open in Spotify
  window.open(playlist.external_urls.spotify, '_blank');
}
```

## How It Works

### 1. User Clicks Login
```
User → Clicks "Login with Spotify"
```

### 2. Redirect to Spotify
```
App → Redirects to: https://accounts.spotify.com/authorize?...
```

### 3. User Authorizes
```
Spotify → Shows permission dialog
User → Approves scopes (top tracks, create playlists, etc.)
```

### 4. Spotify Redirects Back
```
Spotify → Redirects to: http://localhost:3000/callback?code=...
```

### 5. Exchange Code for Token
```
Backend → Exchanges authorization code for access token
Backend → Stores token in session (memory/database)
Backend → Redirects to: http://localhost:3000/?session=abc123
```

### 6. User is Logged In
```
Frontend → Detects session ID in URL
Frontend → Shows user profile
Frontend → Can now use authenticated endpoints
```

## Session Management

### Current Implementation
- Sessions stored in memory (`.userSessions` object)
- Good for development
- Lost on server restart

### For Production
Use a database like Redis or PostgreSQL:

```javascript
// Example with Redis
const redis = require('redis');
const client = redis.createClient();

// Store session
await client.setex(sessionId, 3600, JSON.stringify(sessionData));

// Retrieve session
const sessionData = await client.get(sessionId);
```

## Security Features

✅ **Access tokens** - Auto-refreshed after 1 hour  
✅ **Refresh tokens** - Used to get new access tokens  
✅ **Session validation** - Checks session exists before API calls  
✅ **HTTPS ready** - Change redirect URI for production  
✅ **No token in frontend** - All API calls through backend  

## Spotify Scopes

Your app requests these permissions:
- `user-read-private` - Read user profile
- `user-read-email` - Read user email
- `user-top-read` - Read top tracks/artists
- `playlist-modify-public` - Create public playlists
- `playlist-modify-private` - Create private playlists
- `user-library-modify` - Save/unsave tracks
- `user-library-read` - Get saved tracks
- `user-read-playback-state` - Check playback status
- `user-modify-playback-state` - Control playback

## Error Handling

All methods throw errors if they fail:

```javascript
try {
  await spotifyAuth.createPlaylist('My Playlist');
} catch (error) {
  console.error('Failed:', error);
  alert('❌ Could not create playlist');
}
```

## Testing Checklist

- [ ] User can click "Login with Spotify"
- [ ] Redirected to Spotify authorization page
- [ ] User approves permissions
- [ ] Redirected back to app with session ID
- [ ] Profile name and avatar display
- [ ] Can click "Logout"
- [ ] Session cleared after logout
- [ ] Can get top tracks
- [ ] Can create playlist
- [ ] Can add tracks to playlist
- [ ] Can save tracks
- [ ] Can view saved tracks

## Deployment

### Localhost
```env
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Production (e.g., Vercel)
```env
SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
```

Also update in Spotify Dashboard:
1. https://developer.spotify.com/dashboard
2. Edit your app
3. Update Redirect URI
4. Save

## Documentation

- **[SPOTIFY_USER_AUTH.md](./SPOTIFY_USER_AUTH.md)** - Full implementation details (45 min)
- **[SPOTIFY_USER_AUTH_QUICK.md](./SPOTIFY_USER_AUTH_QUICK.md)** - Quick setup guide (10 min)
- **[SPOTIFY_COMPLETE_GUIDE.md](./SPOTIFY_COMPLETE_GUIDE.md)** - Full API reference
- **[server.js](./server.js)** - Backend implementation

## Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid redirect_uri" | Update Spotify dashboard + .env |
| "Not authenticated" | User needs to login |
| "Session not found" | Session expired, login again |
| 401 error | Token expired, auto-refresh should handle |

## What's Next

1. ✅ Setup (follow Quick Setup above)
2. ✅ Test login (click "Login with Spotify")
3. ✅ Integrate into your UI (add buttons, etc.)
4. ✅ Show user data (top tracks, playlists)
5. ✅ Deploy to production

---

**You're all set!** Your app now has full user authentication with Spotify. 🎉

For questions, check the documentation files or review the code in `server.js` and `public/js/SpotifyAuth.js`.
