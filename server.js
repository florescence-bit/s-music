const express = require("express");
const path = require("path");
const https = require("https");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory cache for API results (with TTL)
const cache = {};
const CACHE_TTL = 3600000; // 1 hour

const cacheGet = (key) => {
  const item = cache[key];
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data;
  }
  return null;
};

const cacheSet = (key, data) => {
  cache[key] = { data, timestamp: Date.now() };
};

// Helper: fetch from iTunes with promise
const fetchITunes = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// ===== SPOTIFY API INTEGRATION =====
const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH = 'https://accounts.spotify.com/api/token';

let spotifyToken = null;
let tokenExpiry = 0;

// Get Spotify Access Token (Client Credentials Flow)
const getSpotifyToken = async () => {
  if (spotifyToken && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  try {
    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      SPOTIFY_AUTH,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${auth}`
        }
      }
    );

    spotifyToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 min buffer
    console.log('✅ Spotify token refreshed');
    return spotifyToken;
  } catch (error) {
    console.error('❌ Spotify auth error:', error.message);
    throw new Error('Failed to get Spotify token');
  }
};

// Serve all static files from the "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple proxy to iTunes Search API for music preview results
// Example: /api/search?q=adele
app.get('/api/search', (req, res) => {
  const q = req.query.q || '';
  if (!q) return res.status(400).json({ error: 'missing query' });

  const term = encodeURIComponent(q.trim());
  const url = `https://itunes.apple.com/search?term=${term}&media=music&limit=50`;

  https.get(url, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => data += chunk);
    apiRes.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    });
  }).on('error', (err) => {
    console.error('iTunes proxy error:', err);
    res.status(500).json({ error: 'failed to fetch from iTunes' });
  });
});

// Featured playlists (curated trending artists/songs)
app.get('/api/featured', async (req, res) => {
  const cacheKey = 'featured';
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [pop, indie, hiphop] = await Promise.all([
      fetchITunes('https://itunes.apple.com/search?term=taylor+swift&media=music&limit=10'),
      fetchITunes('https://itunes.apple.com/search?term=the+weeknd&media=music&limit=10'),
      fetchITunes('https://itunes.apple.com/search?term=drake&media=music&limit=10')
    ]);
    
    const result = {
      featured: [
        { title: 'Pop Hits', tracks: pop.results.slice(0, 6) },
        { title: 'Indie Vibes', tracks: indie.results.slice(0, 6) },
        { title: 'Hip-Hop Heat', tracks: hiphop.results.slice(0, 6) }
      ]
    };
    cacheSet(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Featured fetch error:', err);
    res.status(500).json({ error: 'failed to fetch featured' });
  }
});

// Trending songs
app.get('/api/trending', async (req, res) => {
  const cacheKey = 'trending';
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const result = await fetchITunes('https://itunes.apple.com/search?term=trending&media=music&limit=20');
    const data = { results: result.results.slice(0, 20) };
    cacheSet(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Trending fetch error:', err);
    res.status(500).json({ error: 'failed to fetch trending' });
  }
});

// Recent releases / New Music
app.get('/api/recent', async (req, res) => {
  const cacheKey = 'recent';
  const cached = cacheGet(cacheKey);
  if (cached) return res.json(cached);

  try {
    const [pop, electronic, rnb] = await Promise.all([
      fetchITunes('https://itunes.apple.com/search?term=latest+pop&media=music&limit=10'),
      fetchITunes('https://itunes.apple.com/search?term=electronic&media=music&limit=10'),
      fetchITunes('https://itunes.apple.com/search?term=r%26b&media=music&limit=10')
    ]);

    const result = {
      recent: [
        { title: 'New Pop Releases', tracks: pop.results.slice(0, 6) },
        { title: 'Electronic & Dance', tracks: electronic.results.slice(0, 6) },
        { title: 'R&B/Soul', tracks: rnb.results.slice(0, 6) }
      ]
    };
    cacheSet(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Recent fetch error:', err);
    res.status(500).json({ error: 'failed to fetch recent' });
  }
});

// ===== SPOTIFY API ENDPOINTS =====

// Search for tracks/artists/albums
app.get('/api/spotify/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter required' });

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/search`, {
      params: { q, type, limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spotify search error:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get featured playlists
app.get('/api/spotify/featured', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const cacheKey = 'spotify_featured';
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/browse/featured-playlists`, {
      params: { limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    cacheSet(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Spotify featured error:', error.message);
    res.status(500).json({ error: 'Failed to get featured playlists' });
  }
});

// Get new releases
app.get('/api/spotify/new-releases', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const cacheKey = 'spotify_new_releases';
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/browse/new-releases`, {
      params: { limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    cacheSet(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Spotify new releases error:', error.message);
    res.status(500).json({ error: 'Failed to get new releases' });
  }
});

// Get playlist tracks
app.get('/api/spotify/playlist/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { limit = 50 } = req.query;
    const cacheKey = `spotify_playlist_${playlistId}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/playlists/${playlistId}/tracks`, {
      params: { limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    cacheSet(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Spotify playlist error:', error.message);
    res.status(500).json({ error: 'Failed to get playlist tracks' });
  }
});

// Get track details
app.get('/api/spotify/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/tracks/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spotify track error:', error.message);
    res.status(500).json({ error: 'Failed to get track' });
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
    console.error('Spotify artist error:', error.message);
    res.status(500).json({ error: 'Failed to get artist tracks' });
  }
});

// Get recommendations
app.get('/api/spotify/recommendations', async (req, res) => {
  try {
    const { seed_tracks, seed_artists, limit = 20 } = req.query;
    if (!seed_tracks && !seed_artists) {
      return res.status(400).json({ error: 'seed_tracks or seed_artists required' });
    }

    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/recommendations`, {
      params: { seed_tracks, seed_artists, limit },
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spotify recommendations error:', error.message);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get audio features
app.get('/api/spotify/audio-features/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const token = await getSpotifyToken();
    const response = await axios.get(`${SPOTIFY_API}/audio-features/${trackId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Spotify audio features error:', error.message);
    res.status(500).json({ error: 'Failed to get audio features' });
  }
});

// ===== SPOTIFY USER AUTHENTICATION (Authorization Code Flow) =====

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
    
    // Store tokens (in production, use database with encryption)
    userSessions[sessionId] = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      createdAt: Date.now()
    };

    console.log(`✅ User authenticated: ${sessionId}`);

    // Redirect back to app with session ID
    res.redirect(`/?session=${sessionId}`);
  } catch (error) {
    console.error('❌ Auth error:', error.message);
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
    console.error('❌ Token refresh error:', error.message);
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
      `${SPOTIFY_API}/me/top/tracks`,
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
      `${SPOTIFY_API}/me`,
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
app.post('/api/spotify/me/playlists', express.json(), async (req, res) => {
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
      `${SPOTIFY_API}/me`,
      {
        headers: { 'Authorization': `Bearer ${sessionData.accessToken}` }
      }
    );

    // Create playlist
    const playlistRes = await axios.post(
      `${SPOTIFY_API}/users/${userRes.data.id}/playlists`,
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
app.post('/api/spotify/playlists/:playlistId/tracks', express.json(), async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { session } = req.query;
    const { uris } = req.body;

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];

    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    const response = await axios.post(
      `${SPOTIFY_API}/playlists/${playlistId}/tracks`,
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
app.post('/api/spotify/me/tracks', express.json(), async (req, res) => {
  try {
    const { session } = req.query;
    const { ids } = req.body;

    if (!session || !userSessions[session]) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let sessionData = userSessions[session];

    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    await axios.put(
      `${SPOTIFY_API}/me/tracks?ids=${ids.join(',')}`,
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

    if (Date.now() - sessionData.createdAt > (sessionData.expiresIn * 1000 - 60000)) {
      await refreshUserToken(session);
      sessionData = userSessions[session];
    }

    const response = await axios.get(
      `${SPOTIFY_API}/me/tracks`,
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
app.post('/api/spotify/logout', express.json(), (req, res) => {
  const { session } = req.body;
  if (session && userSessions[session]) {
    delete userSessions[session];
    console.log(`✅ User logged out: ${session}`);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 Spotify API: ${process.env.SPOTIFY_CLIENT_ID ? '✅ Connected' : '❌ Not configured'}`);
  console.log(`🔐 User Auth: ${process.env.SPOTIFY_REDIRECT_URI ? '✅ Configured' : '❌ Not configured'}`);
});

