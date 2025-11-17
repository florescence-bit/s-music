/**
 * SpotifyAuth.js - User Authentication Manager for S-Music
 * Handles OAuth2 Authorization Code Flow with Spotify
 */

class SpotifyAuth {
  constructor() {
    this.sessionId = this.getSessionFromURL();
    this.isAuthenticated = !!this.sessionId;
    this.user = null;
    this.init();
  }

  /**
   * Get session ID from URL parameters
   */
  getSessionFromURL() {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    
    // Clean URL (remove session param for cleaner history)
    if (session) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    return session;
  }

  /**
   * Initialize authentication UI
   */
  async init() {
    const loginBtn = document.getElementById('spotifyLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    if (!loginBtn) {
      console.warn('SpotifyAuth: Login button not found in HTML');
      return;
    }

    if (this.isAuthenticated) {
      loginBtn.style.display = 'none';
      userInfo.style.display = 'flex';
      await this.loadUserProfile();
    } else {
      loginBtn.style.display = 'block';
      userInfo.style.display = 'none';
    }

    // Event listeners
    loginBtn.addEventListener('click', () => this.login());
    logoutBtn?.addEventListener('click', () => this.logout());
  }

  /**
   * Redirect to Spotify login
   */
  login() {
    window.location.href = '/api/spotify/login';
  }

  /**
   * Logout and clear session
   */
  async logout() {
    try {
      await fetch('/api/spotify/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: this.sessionId })
      });
      console.log('✅ Logged out');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Load and display user profile
   */
  async loadUserProfile() {
    try {
      const response = await fetch(`/api/spotify/me?session=${this.sessionId}`);
      if (!response.ok) throw new Error('Failed to load profile');
      
      this.user = await response.json();
      
      const userNameEl = document.getElementById('userName');
      const userAvatarEl = document.getElementById('userAvatar');
      
      if (userNameEl) {
        userNameEl.textContent = this.user.display_name || 'User';
      }
      
      if (userAvatarEl && this.user.images?.[0]) {
        userAvatarEl.src = this.user.images[0].url;
      }
      
      console.log(`✅ Loaded profile: ${this.user.display_name}`);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  }

  /**
   * Get user's top tracks
   * @param {number} limit - Number of tracks (default: 10)
   * @param {string} timeRange - Time range (short_term, medium_term, long_term)
   */
  async getTopTracks(limit = 10, timeRange = 'medium_term') {
    try {
      const response = await fetch(
        `/api/spotify/me/top/tracks?session=${this.sessionId}&limit=${limit}&time_range=${timeRange}`
      );
      if (!response.ok) throw new Error('Failed to get top tracks');
      return await response.json();
    } catch (error) {
      console.error('Get top tracks error:', error);
      throw error;
    }
  }

  /**
   * Get user's saved tracks (liked songs)
   * @param {number} limit - Number of tracks (default: 50)
   */
  async getSavedTracks(limit = 50) {
    try {
      const response = await fetch(
        `/api/spotify/me/tracks?session=${this.sessionId}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Failed to get saved tracks');
      return await response.json();
    } catch (error) {
      console.error('Get saved tracks error:', error);
      throw error;
    }
  }

  /**
   * Create a new playlist
   * @param {string} name - Playlist name
   * @param {string} description - Playlist description
   */
  async createPlaylist(name, description = '') {
    try {
      const response = await fetch(
        `/api/spotify/me/playlists?session=${this.sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        }
      );
      if (!response.ok) throw new Error('Failed to create playlist');
      const playlist = await response.json();
      console.log(`✅ Created playlist: ${playlist.name}`);
      return playlist;
    } catch (error) {
      console.error('Create playlist error:', error);
      throw error;
    }
  }

  /**
   * Add tracks to a playlist
   * @param {string} playlistId - Playlist ID
   * @param {array} trackUris - Array of spotify:track:id URIs
   */
  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      const response = await fetch(
        `/api/spotify/playlists/${playlistId}/tracks?session=${this.sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uris: trackUris })
        }
      );
      if (!response.ok) throw new Error('Failed to add tracks');
      console.log(`✅ Added ${trackUris.length} tracks to playlist`);
      return await response.json();
    } catch (error) {
      console.error('Add tracks error:', error);
      throw error;
    }
  }

  /**
   * Save tracks to user's library
   * @param {array} trackIds - Array of track IDs (not URIs)
   */
  async saveTracks(trackIds) {
    try {
      const response = await fetch(
        `/api/spotify/me/tracks?session=${this.sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: trackIds })
        }
      );
      if (!response.ok) throw new Error('Failed to save tracks');
      console.log(`✅ Saved ${trackIds.length} tracks`);
      return await response.json();
    } catch (error) {
      console.error('Save tracks error:', error);
      throw error;
    }
  }

  /**
   * Create a playlist from a list of tracks
   * Useful for exporting player queue or liked songs
   */
  async createPlaylistFromTracks(tracks, playlistName = 'My Tracks') {
    try {
      // Create playlist
      const playlist = await this.createPlaylist(playlistName);

      // Convert tracks to Spotify URIs
      // Assuming track format: { id: 'spotify_track_id' }
      const trackUris = tracks.map(t => `spotify:track:${t.id}`);

      // Add tracks (Spotify limits to 100 per request)
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100);
        await this.addTracksToPlaylist(playlist.id, batch);
      }

      return playlist;
    } catch (error) {
      console.error('Create playlist from tracks error:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  getUser() {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isLoggedIn() {
    return this.isAuthenticated && !!this.sessionId;
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.sessionId;
  }
}

// Initialize on page load
const spotifyAuth = new SpotifyAuth();
window.spotifyAuth = spotifyAuth; // Make available globally
