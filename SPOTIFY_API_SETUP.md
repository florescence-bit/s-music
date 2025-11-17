# Spotify Web API Integration Guide

## Overview

This guide explains how to integrate the **Spotify Web API** into S-Music for searching songs, accessing playlists, and building a real Spotify-like experience.

## 1. Getting Spotify API Credentials

### Step 1: Create a Spotify Developer Account
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Sign in with your Spotify account (or create one if needed)
3. Accept the terms and create your app

### Step 2: Create an Application
1. Click **Create an App**
2. Name: `s-music` (or your preference)
3. Accept terms and create
4. You'll receive:
   - **Client ID**
   - **Client Secret** (keep this private!)

### Step 3: Copy Your Credentials
```
Client ID: YOUR_CLIENT_ID
Client Secret: YOUR_CLIENT_SECRET
Redirect URI: http://localhost:3000/callback (for development)
```

## 2. Authentication Methods

### Option A: Client Credentials Flow (Recommended for Backend)
**Best for:** Server-to-server requests, no user login required
- No user authentication needed
- Works for search, featured playlists, new releases
- Access token lasts 1 hour
- Simple implementation

### Option B: Authorization Code Flow
**Best for:** Full user experience
- Users grant permission
- Access user's playlists, likes, playback control
- Requires OAuth2 redirect
- More complex setup

**We recommend starting with Option A**, then upgrading to Option B for user playlists.

## 3. Implementation: Client Credentials Flow

### Step 1: Install Dependencies
```bash
npm install axios dotenv
```

### Step 2: Create `.env` File
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Step 3: Update `server.js`

Add these endpoints:

```javascript
require('dotenv').config();
const axios = require('axios');

// Spotify API base URL
const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH = 'https://accounts.spotify.com/api/token';

// Cache for access token
let spotifyToken = null;
let tokenExpiry = 0;

// Get Spotify Access Token
async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  try {
    const response = await axios.post(SPOTIFY_AUTH, 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      }
    });

    spotifyToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer
    return spotifyToken;
  } catch (error) {
    console.error('Spotify auth error:', error.message);
    throw new Error('Failed to get Spotify token');
  }
}

// Search songs
app.get('/api/spotify/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/search`, {
      params: { q, type, limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Featured playlists
app.get('/api/spotify/featured', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/browse/featured-playlists`, {
      params: { limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Featured error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// New releases
app.get('/api/spotify/new-releases', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/browse/new-releases`, {
      params: { limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('New releases error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get playlist tracks
app.get('/api/spotify/playlist/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { limit = 50 } = req.query;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
      params: { limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Playlist tracks error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get track audio preview
app.get('/api/spotify/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/tracks/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Track error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get artist top tracks
app.get('/api/spotify/artist/:artistId/top-tracks', async (req, res) => {
  try {
    const { artistId } = req.params;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/artists/${artistId}/top-tracks`, {
      params: { market: 'US' },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Artist tracks error:', error.message);
    res.status(500).json({ error: error.message });
  }
});
```

## 4. Response Data Structure

### Search Response
```json
{
  "tracks": {
    "items": [
      {
        "id": "11dFghVXANMlKmJXsNCQvb",
        "name": "God's Plan",
        "artists": [{"name": "Drake"}],
        "album": {
          "name": "Scorpion",
          "images": [{"url": "https://...", "height": 300, "width": 300}]
        },
        "preview_url": "https://p.scdn.co/...",
        "external_urls": {"spotify": "https://open.spotify.com/track/..."},
        "duration_ms": 238000
      }
    ]
  }
}
```

### Featured Playlists Response
```json
{
  "playlists": {
    "items": [
      {
        "id": "37i9dQZF1DX4JfIqW...",
        "name": "Today's Top Hits",
        "description": "The hottest tracks right now",
        "images": [{"url": "https://...", "height": 300, "width": 300}],
        "external_urls": {"spotify": "https://..."},
        "tracks": {"total": 50}
      }
    ]
  }
}
```

## 5. Frontend Integration

### Update `public/js/App.js`

```javascript
// Search using Spotify API
async function doSearch(q) {
  try {
    const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}&type=track&limit=20`);
    const data = await response.json();
    
    if (data.tracks && data.tracks.items) {
      renderSearchResults(data.tracks.items);
    }
  } catch (error) {
    console.error('Search failed:', error);
  }
}

// Convert Spotify track to player format
function spotifyTrackToPlayer(spotifyTrack) {
  return {
    n: spotifyTrack.name,                          // name
    a: spotifyTrack.artists[0]?.name || 'Unknown', // artist
    i: spotifyTrack.album.images[0]?.url,          // image
    s: spotifyTrack.preview_url,                   // preview URL
    d: spotifyTrack.duration_ms / 1000,            // duration in seconds
    o: spotifyTrack.external_urls.spotify          // Spotify link
  };
}

// Render search results
function renderSearchResults(tracks) {
  const resultsDiv = document.getElementById('searchResults');
  resultsDiv.innerHTML = '';
  
  const grid = document.createElement('div');
  grid.className = 'grid-container';
  
  tracks.forEach(track => {
    const card = createTrackCard(spotifyTrackToPlayer(track));
    grid.appendChild(card);
  });
  
  resultsDiv.appendChild(grid);
}
```

### Update `public/js/Pages.js`

```javascript
// Load featured playlists
async function loadFeaturedPlaylists() {
  try {
    const response = await fetch('/api/spotify/featured?limit=10');
    const data = await response.json();
    return data.playlists?.items || [];
  } catch (error) {
    console.error('Featured playlists error:', error);
    return [];
  }
}

// Load new releases
async function loadNewReleases() {
  try {
    const response = await fetch('/api/spotify/new-releases?limit=20');
    const data = await response.json();
    return data.albums?.items || [];
  } catch (error) {
    console.error('New releases error:', error);
    return [];
  }
}

// Render featured playlists in home page
async function renderFeaturedSection() {
  const playlists = await loadFeaturedPlaylists();
  const container = document.getElementById('featuredPlaylists');
  
  playlists.forEach(playlist => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <img src="${playlist.images[0]?.url}" style="width:100%; border-radius:8px; margin-bottom:12px;">
      <h4 class="playlist-card-title">${playlist.name}</h4>
      <p class="playlist-card-count">${playlist.tracks?.total || 0} songs</p>
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => window.open(playlist.external_urls.spotify, '_blank');
    container.appendChild(card);
  });
}
```

## 6. Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid credentials | Check Client ID/Secret in .env |
| 429 Too Many Requests | Rate limited | Implement exponential backoff |
| 404 Not Found | Invalid track/playlist ID | Validate ID format |
| 400 Bad Request | Invalid query | Check parameter formatting |

## 7. Rate Limiting

Spotify has these limits:
- **Search:** 100 requests per minute (per user)
- **API:** 429 status code = rate limited
- **Solution:** Implement caching and exponential backoff

## 8. Advanced Features (Optional)

### Authorization Code Flow (User Login)
For full user experience:
1. User clicks "Login with Spotify"
2. Redirected to Spotify auth page
3. User approves app
4. App gets refresh token
5. Access user's library, playlists, playback

See Spotify docs: https://developer.spotify.com/documentation/web-api/tutorials/code-flow

### Audio Features
Get song characteristics:
```javascript
GET /api/spotify/audio-features/{id}
// Returns: danceability, energy, valence, tempo, etc.
```

### Recommendations
Get similar songs:
```javascript
GET /api/spotify/recommendations?seed_tracks={id}&limit=20
```

## 9. Security Considerations

⚠️ **Important:**
- Never expose `SPOTIFY_CLIENT_SECRET` in frontend code
- Keep `.env` in `.gitignore`
- Use backend proxy (as shown above)
- Validate all user inputs
- Implement rate limiting on your server

## 10. Testing

```bash
# Test search endpoint
curl "http://localhost:3000/api/spotify/search?q=drake&type=track&limit=5"

# Test featured playlists
curl "http://localhost:3000/api/spotify/featured?limit=5"

# Test new releases
curl "http://localhost:3000/api/spotify/new-releases?limit=5"
```

## 11. Next Steps

1. ✅ Create Spotify Developer account
2. ✅ Get Client ID & Secret
3. ✅ Add `.env` file with credentials
4. ✅ Install `axios` and `dotenv`
5. ✅ Add endpoints to `server.js`
6. ✅ Update frontend to use Spotify endpoints
7. ✅ Test all features
8. ✅ Deploy!

---

**References:**
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [API Reference](https://developer.spotify.com/documentation/web-api/reference)
- [Rate Limiting](https://developer.spotify.com/documentation/web-api/guides/rate-limits)
