# S-Music: A Spotify-like Music Player

A modern, production-ready web-based music player with search, playlists, and API-driven content discovery. Built with vanilla JavaScript, Express.js, and **Spotify Web API** integration.

## ✨ Features

- **🔍 Search** — Search millions of songs via Spotify Web API
- **🏠 Homepage** — Curated featured playlists, new releases, trending
- **▶️ Player** — Full playback controls (play/pause, next/prev, shuffle, repeat)
- **📋 Playlists** — Create, manage, and organize playlists (localStorage)
- **❤️ Favorites** — Like songs and manage a favorites library
- **📱 Tracks** — Browse and manage your queue
- **🎨 Modern UI** — Spotify-inspired dark theme with responsive card layouts
- **⚡ Preview Playback** — Stream 30-second previews from Spotify
- **🔐 Spotify Integration** — Full Spotify Web API with artist top tracks and recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- Spotify Developer Account (free)

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Sign in or create a free account
3. Create a new app
4. You'll get:
   - **Client ID**
   - **Client Secret**

### 2. Setup Environment

Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

⚠️ **Important**: Never commit `.env` to git. It's already in `.gitignore`.

### 3. Installation

```bash
cd s-music
npm install
```

### 4. Development

Run with auto-reload on file changes:

```bash
npm run dev
```

Or start the server normally:

```bash
npm start
```

The app will be available at `http://localhost:3000`.

## 📖 Usage

1. **Homepage**: Launch the app and browse featured playlists, trending, and new releases
2. **Search**: Click the search icon in the header, type a song/artist, and hit Enter
3. **Play**: Click "Play" on any track to start playback
4. **Add to Queue**: Click "Add" to add tracks to your current queue
5. **Like**: Click the heart icon to save tracks to Favorites
6. **Manage Playlists**: Go to Playlists tab to create and manage collections

## 🏗️ Project Structure

```
s-music/
├── server.js                 # Express server with API endpoints
├── package.json              # Dependencies and scripts
├── public/
│   ├── index.html           # Main HTML
│   ├── style/
│   │   └── style.css        # App styling (Spotify-inspired)
│   ├── js/
│   │   ├── App.js           # Main app logic, search integration
│   │   ├── AudioPlayer.js   # MusicPlayer class
│   │   ├── SeekBar.js       # Canvas-based seek bar
│   │   └── Pages.js         # Page navigation and management
│   └── assets/
│       ├── avtar.jpeg       # User avatar
│       └── icons/           # SVG icons (search, menu, etc)
└── api/                      # Placeholder for future APIs
```

## 🔌 API Endpoints

### Spotify Search
```
GET /api/spotify/search?q=<query>&type=track&limit=20
```
Search for tracks on Spotify.

Example:
```bash
curl "http://localhost:3000/api/spotify/search?q=drake&type=track&limit=10"
```

Response:
```json
{
  "tracks": {
    "items": [
      {
        "id": "11dFghVXANMlKmJXsNCQvb",
        "name": "God's Plan",
        "artists": [{"name": "Drake"}],
        "album": {"name": "Scorpion", "images": [...]},
        "preview_url": "https://...",
        "duration_ms": 238000
      }
    ]
  }
}
```

### Featured Playlists
```
GET /api/spotify/featured?limit=20
```
Get Spotify's curated featured playlists.

### New Releases
```
GET /api/spotify/new-releases?limit=20
```
Get latest album releases on Spotify.

### Get Playlist Tracks
```
GET /api/spotify/playlist/{playlistId}/tracks?limit=50
```
Get all tracks from a specific playlist.

### Get Artist Top Tracks
```
GET /api/spotify/artist/{artistId}/top-tracks
```
Get top 10 tracks for an artist.

### Get Track Details
```
GET /api/spotify/track/{trackId}
```
Get detailed information about a specific track.

### Get Recommendations
```
GET /api/spotify/recommendations?seed_tracks={trackId}&limit=20
```
Get song recommendations based on seed tracks or artists.

### Get Audio Features
```
GET /api/spotify/audio-features/{trackId}
```
Get audio features (danceability, energy, tempo, etc.) for a track.

---

## 📚 Documentation

For detailed Spotify API integration guide, see [SPOTIFY_API_SETUP.md](./SPOTIFY_API_SETUP.md).

For Firebase setup, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).
```
Returns new releases and recently popular music.

### Health Endpoint
```
GET /api/health
```
Returns server status.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js, Express.js 5.x
- **Music API**: Spotify Web API (authenticated, 100% official)
- **HTTP Client**: Axios
- **Config**: dotenv for environment variables
- **Firebase**: Analytics, Authentication, Firestore (optional)
- **Storage**: LocalStorage (playlists, likes, preferences)
- **UI/UX**: Dark theme, responsive grid layouts, canvas-based visualizations

## 📊 Data Model

### Spotify Track Object
```javascript
{
  id: "11dFghVXANMlKmJXsNCQvb",
  name: "God's Plan",
  artists: [{name: "Drake"}],
  album: {
    name: "Scorpion",
    images: [{url: "https://...", height: 300, width: 300}]
  },
  preview_url: "https://p.scdn.co/...",
  duration_ms: 238000,
  external_urls: {spotify: "https://open.spotify.com/track/..."}
}
```

### Player Song Object (Internal)
```javascript
{
  n: "Track Name",              // name
  a: "Artist Name",             // artist
  i: "https://...",             // artwork URL (Spotify)
  s: "https://...",             // preview audio URL
  d: 180,                        // duration in seconds
  o: 0                           // order in playlist
}
```

### Playlist Object (localStorage)
```javascript
{
  [playlistId]: {
    name: "My Playlist",
    tracks: [ /* song objects */ ],
    created: "2025-11-17T..."
  }
}
```

## 🔒 Security & Compliance

- **Backend Proxy**: All Spotify API calls go through your backend (secrets never exposed to frontend)
- **No User Auth Required**: Works with Spotify Client Credentials (server-to-server)
- **All HTTPS**: Spotify API uses HTTPS; preview URLs are secure
- **No Sensitive Data Stored**: Credentials in `.env` only, never in localStorage
- **Rate Limiting**: Implemented exponential backoff for API calls
- **Open Source**: MIT License, fully transparent

For Firebase setup and optional user authentication, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

## 📈 Performance & Caching

- API responses cached for 1 hour to minimize Spotify API calls
- In-memory caching with TTL to reduce redundant requests
- Canvas rendering for smooth seek bar animations
- Pagination support for large result sets (limit parameter)
- Exponential backoff for rate-limit handling
- Lazy loading of search results

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variable `PORT` (Vercel assigns automatically)
4. Deploy

Live demo: [S-Music on Vercel](https://s-music-jenp.vercel.app/)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t s-music .
docker run -p 3000:3000 s-music
```

### Traditional Server

1. Copy project to server
2. Install Node.js
3. Run `npm install`
4. Use PM2 or systemd to manage the process
5. Set up Nginx reverse proxy

## 🐛 Known Limitations

- iTunes previews are 30-90 seconds only (full songs not available)
- Offline playback not supported
- No user accounts/authentication
- No collaborative playlists
- Music recommendations are basic (based on search)

## 🔮 Future Enhancements

- [ ] Spotify OAuth integration for full-track streaming
- [ ] Firebase Authentication (email, Google, GitHub login)
- [ ] Firestore cloud sync for playlists
- [ ] Server-side user accounts with cloud sync
- [ ] Advanced recommendations using ML
- [ ] Offline caching and playback
- [ ] Lyrics display
- [ ] Social sharing & collaborative playlists
- [ ] Dark/Light theme toggle
- [ ] Mobile app with React Native
- [ ] Web Audio API visualizer

## 📝 License

ISC

## 👨‍💻 Author

Your Name / Team

## 🤝 Contributing

Contributions welcome! Please fork, create a feature branch, and submit a pull request.

## 📧 Support

For issues, questions, or suggestions, please open a GitHub issue or contact the maintainer.

---

**Made with ❤️ using vanilla JavaScript and the power of music APIs.**