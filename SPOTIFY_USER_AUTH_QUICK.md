# Spotify User Authentication - Quick Start Guide

## What This Adds

With user authentication, your app can now:
- ✅ Show user's top tracks
- ✅ Create playlists
- ✅ Save/like songs
- ✅ Get user's saved library
- ✅ Access user profile info

## Setup Steps

### 1. Update `.env`

Add your redirect URI:
```env
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### 2. Update Spotify App Settings

1. Go to https://developer.spotify.com/dashboard
2. Click your app
3. Edit Settings
4. Add Redirect URI: `http://localhost:3000/callback`
5. Save

### 3. Update HTML

Add to your header in `public/index.html`:

```html
<!-- Login/Logout buttons -->
<button id="spotifyLoginBtn" class="login-btn">Login with Spotify</button>
<div id="userInfo" style="display:none; gap: 10px; align-items: center;">
  <img id="userAvatar" src="" alt="User" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
  <span id="userName"></span>
  <button id="logoutBtn" class="logout-btn">Logout</button>
</div>
```

### 4. Add Scripts to HTML

In your `<head>` or before closing `</body>`:

```html
<script src="/js/SpotifyAuth.js"></script>
```

### 5. Restart Server

```bash
npm start
```

## Usage Examples

### Get User's Top Tracks

```javascript
// In your JS code
const topTracks = await spotifyAuth.getTopTracks(10);
console.log(topTracks.items.map(t => t.name));
```

Output:
```javascript
[
  { name: "Song 1", artists: [...], id: "..." },
  { name: "Song 2", artists: [...], id: "..." }
]
```

### Create a Playlist

```javascript
const playlist = await spotifyAuth.createPlaylist(
  'My Top Tracks',
  'Auto-generated playlist'
);

console.log(playlist.id);   // Playlist ID
console.log(playlist.external_urls.spotify); // Spotify link
```

### Add Tracks to Playlist

```javascript
const trackUris = [
  'spotify:track:3zSSCPpLZ5Oc8nelhhGjKz',
  'spotify:track:0tGKiUgSYn5cskE4GRo8dR',
  'spotify:track:181JY171jp6jFNkU2U2qQJ'
];

await spotifyAuth.addTracksToPlaylist(playlist.id, trackUris);
```

### Save Tracks to User's Library

```javascript
const trackIds = [
  '3zSSCPpLZ5Oc8nelhhGjKz',
  '0tGKiUgSYn5cskE4GRo8dR'
];

await spotifyAuth.saveTracks(trackIds);
```

### Get User's Saved Tracks

```javascript
const savedTracks = await spotifyAuth.getSavedTracks(50);
console.log(savedTracks.items.map(item => item.track.name));
```

### Create Playlist from Your Queue

```javascript
// Your player tracks format
const myTracks = player.songs; // Array of track objects with .id

// Convert and create playlist
const playlist = await spotifyAuth.createPlaylistFromTracks(
  myTracks,
  'My S-Music Playlist'
);
```

### Get User Info

```javascript
const user = spotifyAuth.getUser();
console.log(user.display_name);
console.log(user.email);
console.log(user.images[0].url); // Avatar URL
```

## API Endpoints

### Backend Endpoints

```
GET  /api/spotify/login                           - Redirect to Spotify login
GET  /callback                                     - Spotify callback (internal)
GET  /api/spotify/me?session=:id                   - Get user profile
GET  /api/spotify/me/tracks?session=:id            - Get saved tracks
GET  /api/spotify/me/top/tracks?session=:id        - Get top tracks
POST /api/spotify/me/playlists?session=:id         - Create playlist
POST /api/spotify/playlists/:id/tracks?session=:id - Add tracks to playlist
POST /api/spotify/me/tracks?session=:id            - Save tracks
POST /api/spotify/logout                           - Logout
```

### Frontend Methods (SpotifyAuth class)

```javascript
spotifyAuth.login()                                   // Login with Spotify
spotifyAuth.logout()                                  // Logout
spotifyAuth.getUser()                                // Get user profile
spotifyAuth.isLoggedIn()                             // Check auth status
spotifyAuth.getTopTracks(limit, timeRange)          // Get top tracks
spotifyAuth.getSavedTracks(limit)                   // Get liked songs
spotifyAuth.createPlaylist(name, description)       // Create playlist
spotifyAuth.addTracksToPlaylist(playlistId, uris)   // Add songs
spotifyAuth.saveTracks(trackIds)                    // Like songs
spotifyAuth.createPlaylistFromTracks(tracks, name)  // Create from array
```

## Time Ranges

For `getTopTracks()`:
- `short_term` - Last 4 weeks
- `medium_term` - Last 6 months (default)
- `long_term` - All time

```javascript
// Get your all-time top tracks
const allTimeTop = await spotifyAuth.getTopTracks(20, 'long_term');
```

## Track Format

### From Spotify API
```javascript
{
  id: "3zSSCPpLZ5Oc8nelhhGjKz",
  name: "God's Plan",
  artists: [{name: "Drake"}],
  album: {name: "Scorpion", images: [...]},
  preview_url: "https://...",
  uri: "spotify:track:3zSSCPpLZ5Oc8nelhhGjKz"
}
```

### For Your Player
```javascript
{
  n: "God's Plan",  // name
  a: "Drake",       // artist
  i: "https://...", // image
  s: "https://...", // preview URL
  d: 238,           // duration
  id: "3zSSCPpLZ5Oc8nelhhGjKz" // Spotify ID (for creating playlists)
}
```

## Integration with Your Player

### Add "Save to Spotify" Button

```javascript
// In your track card
const onSaveToSpotify = async (track) => {
  if (!spotifyAuth.isLoggedIn()) {
    spotifyAuth.login();
    return;
  }

  try {
    await spotifyAuth.saveTracks([track.id]);
    alert('✅ Saved to Spotify!');
  } catch (error) {
    alert('❌ Failed to save');
  }
};
```

### Create Playlist from Queue

```javascript
const onExportPlaylist = async () => {
  if (!spotifyAuth.isLoggedIn()) {
    spotifyAuth.login();
    return;
  }

  try {
    const playlist = await spotifyAuth.createPlaylistFromTracks(
      player.songs,
      `S-Music Export - ${new Date().toDateString()}`
    );
    
    window.open(playlist.external_urls.spotify, '_blank');
  } catch (error) {
    alert('❌ Failed to export');
  }
};
```

### Add Top Tracks to Home Page

```javascript
// In your Pages.js renderHome() method
async function loadAndShowTopTracks() {
  if (!spotifyAuth.isLoggedIn()) return;

  const topTracks = await spotifyAuth.getTopTracks(10);
  const container = document.getElementById('topTracksSection');
  
  topTracks.items.forEach(track => {
    const card = createTrackCard({
      n: track.name,
      a: track.artists[0].name,
      i: track.album.images[0].url,
      s: track.preview_url,
      d: track.duration_ms / 1000,
      id: track.id
    });
    container.appendChild(card);
  });
}
```

## Troubleshooting

### "Not authenticated" error
- Make sure user clicked "Login with Spotify"
- Verify session ID is in URL after redirect
- Check `.env` has correct `SPOTIFY_REDIRECT_URI`

### "Invalid redirect_uri"
- Update `.env` with correct redirect URI
- Update Spotify app dashboard settings
- Must match exactly (including protocol and port)

### "401 Unauthorized"
- Session expired, user needs to login again
- Token refresh is automatic, but only for 1 hour

### Tracks won't save
- Check track IDs are correct (not URIs)
- For playlists, use URIs: `spotify:track:id`
- For library save, use just IDs: `id`

## Production Checklist

- [ ] Update `.env` with production redirect URI
- [ ] Update Spotify app dashboard with production redirect URI
- [ ] Implement persistent session storage (database, not in-memory)
- [ ] Add HTTPS
- [ ] Encrypt stored tokens
- [ ] Implement token rotation
- [ ] Add error handling UI
- [ ] Test login flow
- [ ] Test playlist creation
- [ ] Test save tracks
- [ ] Deploy!

## Files Created

```
public/js/SpotifyAuth.js           - Authentication manager class
SPOTIFY_USER_AUTH.md               - Full implementation guide
SPOTIFY_USER_AUTH_QUICK.md         - This file
```

## Next Steps

1. ✅ Update `.env` with redirect URI
2. ✅ Update Spotify app dashboard
3. ✅ Add HTML buttons
4. ✅ Include SpotifyAuth.js script
5. ✅ Restart server
6. ✅ Test login by clicking "Login with Spotify"
7. ✅ Integrate with your app (add buttons, etc.)
8. ✅ Deploy!

---

**Happy building!** 🎵✨
