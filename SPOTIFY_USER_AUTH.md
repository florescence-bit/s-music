# Spotify User Authentication (Authorization Code Flow)

## Overview

This guide shows how to add **user login** to S-Music, allowing users to:
- View their top tracks
- Create and manage playlists
- Save tracks to their library
- Access personalized recommendations
- Control playback on their Spotify devices

## Key Difference: Client Credentials vs Authorization Code Flow

### Current Setup: Client Credentials Flow
```
Your App ──> Spotify API
(Server-to-server, no user login needed)
```
- ✅ Search, featured, new releases
- ❌ Can't access user data
- ❌ Can't create playlists
- ❌ Can't save tracks

### What We'll Add: Authorization Code Flow
```
User ──> Your App ──> Spotify Login ──> User Approves ──> Your App
(User grants permission to access their data)
```
- ✅ Access user's top tracks
- ✅ Create playlists
- ✅ Save/like tracks
- ✅ Get user's library
- ✅ Control playback

---

## Implementation Steps

### Step 1: Update `.env` with Redirect URI

Add to your `.env`:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

In production, change to:
```
SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
```

### Step 2: Add Authentication Endpoints to `server.js`

Add these endpoints to handle OAuth2 flow:

```javascript
// ===== SPOTIFY USER AUTHENTICATION =====

// Session storage for user access tokens
const userSessions = {}; // In production, use Redis or database

// 1. Redirect user to Spotify login
app.get('/api/spotify/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: scopes.join(' ')
  }).toString()}`;

  res.redirect(authUrl);
});

// 2. Handle Spotify callback
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'No authorization code' });
  }

  try {
    // Exchange code for access token
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Generate session ID
    const sessionId = Math.random().toString(36).substring(7);
    
    // Store tokens (in production, use database)
    userSessions[sessionId] = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      createdAt: Date.now()
    };

    // Redirect back to app with session ID
    res.redirect(`/?session=${sessionId}`);
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 3. Refresh user's access token
const refreshUserToken = async (sessionId) => {
  const session = userSessions[sessionId];
  if (!session) throw new Error('Session not found');

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    session.accessToken = response.data.access_token;
    session.expiresIn = response.data.expires_in;
    session.createdAt = Date.now();
  } catch (error) {
    console.error('Token refresh error:', error.message);
    throw error;
  }
};

// 4. Get user's top tracks
app.get('/api/spotify/me/top/tracks', async (req, res) => {
  try {
    const { session } = req.query;
    const { limit = 10 } = req.query;

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];
    if (!sessionData) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Refresh token if needed
    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks',
      {
        params: { limit, time_range: 'medium_term' },
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get top tracks error:', error.message);
    res.status(500).json({ error: 'Failed to get top tracks' });
  }
});

// 5. Get user's profile
app.get('/api/spotify/me', async (req, res) => {
  try {
    const { session } = req.query;

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionData = userSessions[session];
    const response = await axios.get(
      'https://api.spotify.com/v1/me',
      {
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// 6. Create a playlist
app.post('/api/spotify/me/playlists', async (req, res) => {
  try {
    const { session } = req.query;
    const { name, description } = req.body;

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];

    // Refresh if needed
    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    // Get user ID
    const userRes = await axios.get(
      'https://api.spotify.com/v1/me',
      {
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    // Create playlist
    const playlistRes = await axios.post(
      `https://api.spotify.com/v1/users/${userRes.data.id}/playlists`,
      { name, description, public: false },
      {
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    res.json(playlistRes.data);
  } catch (error) {
    console.error('Create playlist error:', error.message);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// 7. Add tracks to playlist
app.post('/api/spotify/playlists/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { session } = req.query;
    const { uris } = req.body; // Array of spotify:track:id

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];

    // Refresh if needed
    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    const response = await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris },
      {
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Add tracks error:', error.message);
    res.status(500).json({ error: 'Failed to add tracks' });
  }
});

// 8. Save tracks to user's library
app.post('/api/spotify/me/tracks', async (req, res) => {
  try {
    const { session } = req.query;
    const { ids } = req.body; // Array of track IDs

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];

    // Refresh if needed
    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    const response = await axios.put(
      `https://api.spotify.com/v1/me/tracks?ids=${ids.join(',')}`,
      {},
      {
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Save tracks error:', error.message);
    res.status(500).json({ error: 'Failed to save tracks' });
  }
});

// 9. Get user's saved tracks
app.get('/api/spotify/me/tracks', async (req, res) => {
  try {
    const { session } = req.query;
    const { limit = 50 } = req.query;

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];

    // Refresh if needed
    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    const response = await axios.get(
      'https://api.spotify.com/v1/me/tracks',
      {
        params: { limit },
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Get saved tracks error:', error.message);
    res.status(500).json({ error: 'Failed to get saved tracks' });
  }
});

// 10. Logout
app.post('/api/spotify/logout', (req, res) => {
  const { session } = req.body;
  if (session && userSessions[session]) {
    delete userSessions[session];
  }
  res.json({ success: true });
});
```

---

## Frontend Implementation

### Add Login Button to HTML

```html
<!-- In public/index.html header -->
<button id="spotifyLoginBtn" class="login-btn">Login with Spotify</button>
<div id="userInfo" style="display:none;">
  <img id="userAvatar" src="" alt="User" style="width:32px; height:32px; border-radius:50%;">
  <span id="userName"></span>
  <button id="logoutBtn" class="logout-btn">Logout</button>
</div>
```

### Add JavaScript to Handle Auth

```javascript
// public/js/SpotifyAuth.js
class SpotifyAuth {
  constructor() {
    this.sessionId = this.getSessionFromURL();
    this.isAuthenticated = !!this.sessionId;
    this.init();
  }

  getSessionFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('session');
  }

  async init() {
    const loginBtn = document.getElementById('spotifyLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (this.isAuthenticated) {
      loginBtn.style.display = 'none';
      userInfo.style.display = 'flex';
      await this.loadUserProfile();
    } else {
      loginBtn.style.display = 'block';
      userInfo.style.display = 'none';
    }

    loginBtn.addEventListener('click', () => this.login());
    logoutBtn?.addEventListener('click', () => this.logout());
  }

  login() {
    window.location.href = '/api/spotify/login';
  }

  async logout() {
    await fetch('/api/spotify/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: this.sessionId })
    });
    window.location.href = '/';
  }

  async loadUserProfile() {
    try {
      const response = await fetch(`/api/spotify/me?session=${this.sessionId}`);
      const user = await response.json();
      
      document.getElementById('userName').textContent = user.display_name;
      if (user.images[0]) {
        document.getElementById('userAvatar').src = user.images[0].url;
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  async getTopTracks(limit = 10) {
    const response = await fetch(`/api/spotify/me/top/tracks?session=${this.sessionId}&limit=${limit}`);
    return response.json();
  }

  async createPlaylist(name, description) {
    const response = await fetch(`/api/spotify/me/playlists?session=${this.sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    return response.json();
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    const response = await fetch(
      `/api/spotify/playlists/${playlistId}/tracks?session=${this.sessionId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: trackUris })
      }
    );
    return response.json();
  }

  async saveTracks(trackIds) {
    const response = await fetch(`/api/spotify/me/tracks?session=${this.sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: trackIds })
    });
    return response.json();
  }
}

// Initialize
const spotifyAuth = new SpotifyAuth();
```

---

## Required Spotify Scopes

Add these to your Spotify app permissions:
- `user-read-private` - Read user profile
- `user-read-email` - Read user email
- `user-top-read` - Read user's top tracks/artists
- `playlist-modify-public` - Create public playlists
- `playlist-modify-private` - Create private playlists
- `user-library-modify` - Save/unsave tracks
- `user-library-read` - Read saved tracks
- `user-read-playback-state` - Get playback info
- `user-modify-playback-state` - Control playback

---

## Testing

### 1. Login
```javascript
spotifyAuth.login();
// User redirected to Spotify, then back to your app with session ID
```

### 2. Get Top Tracks
```javascript
const topTracks = await spotifyAuth.getTopTracks(5);
console.log(topTracks.items.map(t => t.name));
```

### 3. Create Playlist
```javascript
const playlist = await spotifyAuth.createPlaylist(
  'My Top Tracks',
  'Auto-generated playlist'
);
console.log(playlist.id);
```

### 4. Add Tracks
```javascript
const trackUris = [
  'spotify:track:3zSSCPpLZ5Oc8nelhhGjKz',
  'spotify:track:0tGKiUgSYn5cskE4GRo8dR'
];

await spotifyAuth.addTracksToPlaylist(playlist.id, trackUris);
```

---

## Production Considerations

### Session Management
**Current**: In-memory (lost on server restart)
**Production**: Use Redis, PostgreSQL, or MongoDB

```javascript
// Example with Redis
const redis = require('redis');
const client = redis.createClient();

// Store session
await client.setex(sessionId, 3600, JSON.stringify(sessionData));

// Retrieve session
const sessionData = await client.get(sessionId);
```

### Redirect URI in Production
Update in `.env`:
```
SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
```

Also update in Spotify Dashboard:
1. Go to https://developer.spotify.com/dashboard
2. Edit your app settings
3. Add redirect URI: `https://yourdomain.com/callback`

### Security
- ✅ Store refresh tokens securely (encrypted database)
- ✅ Use HTTPS only
- ✅ Validate session tokens
- ✅ Implement token rotation
- ✅ Add CSRF protection

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Invalid redirect_uri" | Update Spotify app settings + .env |
| "Invalid grant" | User didn't authorize or code expired |
| 401 Unauthorized | Token expired, refresh needed |
| "Scope invalid" | Check Spotify app has permission |

---

## Next Steps

1. ✅ Update `.env` with `SPOTIFY_REDIRECT_URI`
2. ✅ Add endpoints to `server.js`
3. ✅ Create `public/js/SpotifyAuth.js`
4. ✅ Add login button to HTML
5. ✅ Update Spotify app dashboard with redirect URI
6. ✅ Test login flow
7. ✅ Test playlist creation
8. ✅ Deploy to production

---

## References

- [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
- [Spotify Web API Reference](https://developer.spotify.com/documentation/web-api/reference)
