// Pages.js - Manage page navigation and rendering

class Pages {
    constructor(player) {
        this.player = player;
        this.currentPage = 'home-page';
        this.playlists = this.loadPlaylists();
        this.likes = this.loadLikes();
        this.initNavigation();
    }

    // Load playlists from localStorage
    loadPlaylists() {
        try {
            const stored = localStorage.getItem('s-music-playlists');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    // Save playlists to localStorage
    savePlaylists() {
        localStorage.setItem('s-music-playlists', JSON.stringify(this.playlists));
    }

    // Load likes from localStorage
    loadLikes() {
        try {
            const stored = localStorage.getItem('s-music-likes');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    // Save likes to localStorage
    saveLikes() {
        localStorage.setItem('s-music-likes', JSON.stringify(this.likes));
    }

    // Show page by id
    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        // Show selected page
        const page = document.getElementById(pageId);
        if (page) {
            page.classList.add('active');
            this.currentPage = pageId;
            // Trigger page-specific render
            this.renderPage(pageId);
        }
        // Update nav highlighting
        document.querySelectorAll('.pages span').forEach(s => s.classList.remove('selcPG'));
        const navItem = document.querySelector(`.pages span:contains("${this.getPageLabel(pageId)}")`);
        if (navItem) navItem.classList.add('selcPG');
    }

    getPageLabel(pageId) {
        const map = {
            'home-page': 'Home',
            'tracks-page': 'Tracks',
            'playlists-page': 'Playlist',
            'albums-page': 'Albums',
            'favourites-page': 'Favourites'
        };
        return map[pageId] || '';
    }

    // Render page based on current page
    renderPage(pageId) {
        switch(pageId) {
            case 'home-page':
                this.renderHome();
                break;
            case 'tracks-page':
                this.renderTracks();
                break;
            case 'playlists-page':
                this.renderPlaylists();
                break;
            case 'albums-page':
                this.renderAlbums();
                break;
            case 'favourites-page':
                this.renderFavourites();
                break;
        }
    }

    // Render home page with API data
    async renderHome() {
        try {
            const [featured, trending, recent] = await Promise.all([
                fetch('/api/featured').then(r => r.json()),
                fetch('/api/trending').then(r => r.json()),
                fetch('/api/recent').then(r => r.json())
            ]);

            // Render featured
            const featuredGrid = document.getElementById('featured-grid');
            featuredGrid.innerHTML = '';
            if (featured.featured) {
                featured.featured.forEach(section => {
                    section.tracks.forEach(track => {
                        if (track.previewUrl) {
                            featuredGrid.appendChild(this.createTrackCard(track));
                        }
                    });
                });
            }

            // Render trending
            const trendingGrid = document.getElementById('trending-grid');
            trendingGrid.innerHTML = '';
            if (trending.results) {
                trending.results.slice(0, 12).forEach(track => {
                    if (track.previewUrl) {
                        trendingGrid.appendChild(this.createTrackCard(track));
                    }
                });
            }

            // Render recent
            const recentGrid = document.getElementById('recent-grid');
            recentGrid.innerHTML = '';
            if (recent.recent) {
                recent.recent.forEach(section => {
                    section.tracks.forEach(track => {
                        if (track.previewUrl) {
                            recentGrid.appendChild(this.createTrackCard(track));
                        }
                    });
                });
            }
        } catch (err) {
            console.error('Error rendering home:', err);
        }
    }

    // Create a track card DOM element
    createTrackCard(track) {
        const card = document.createElement('div');
        card.className = 'track-card';

        const img = document.createElement('img');
        img.src = track.artworkUrl100;
        img.className = 'track-card-img';
        img.alt = track.trackName || 'Track';

        const title = document.createElement('div');
        title.className = 'track-card-title';
        title.textContent = track.trackName || 'Unknown';

        const artist = document.createElement('div');
        artist.className = 'track-card-artist';
        artist.textContent = track.artistName || 'Unknown Artist';

        const actions = document.createElement('div');
        actions.className = 'track-card-actions';

        const playBtn = document.createElement('button');
        playBtn.className = 'play-btn';
        playBtn.textContent = '▶ Play';
        playBtn.onclick = () => {
            const song = {
                n: track.trackName,
                i: track.artworkUrl100,
                s: track.previewUrl,
                a: track.artistName,
                d: (track.trackTimeMillis || 0) / 1000,
                o: this.player.songs.length
            };
            this.player.songs.push(song);
            const idx = this.player.songs.length - 1;
            this.player.setSong(idx);
            this.player.isPlaying = false;
            this.player.playPause();
        };

        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = '+';
        addBtn.onclick = () => {
            const song = {
                n: track.trackName,
                i: track.artworkUrl100,
                s: track.previewUrl,
                a: track.artistName,
                d: (track.trackTimeMillis || 0) / 1000,
                o: this.player.songs.length
            };
            this.player.songs.push(song);
            addBtn.textContent = '✓';
            setTimeout(() => addBtn.textContent = '+', 1200);
        };

        const likeBtn = document.createElement('button');
        likeBtn.className = 'like-btn';
        likeBtn.textContent = '♥';
        const trackId = track.trackId || track.collectionId;
        if (this.likes[trackId]) {
            likeBtn.classList.add('liked');
        }
        likeBtn.onclick = () => {
            this.toggleLike(trackId, track, likeBtn);
        };

        actions.appendChild(playBtn);
        actions.appendChild(addBtn);
        actions.appendChild(likeBtn);

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(artist);
        card.appendChild(actions);

        return card;
    }

    // Toggle like status
    toggleLike(trackId, trackData, btn) {
        if (this.likes[trackId]) {
            delete this.likes[trackId];
            btn.classList.remove('liked');
        } else {
            this.likes[trackId] = trackData;
            btn.classList.add('liked');
        }
        this.saveLikes();
    }

    // Render tracks page
    renderTracks() {
        const container = document.getElementById('tracks-list');
        container.innerHTML = '';

        if (this.player.songs.length === 0) {
            container.textContent = 'No tracks yet. Search for songs to add them!';
            return;
        }

        this.player.songs.forEach((song, idx) => {
            const card = document.createElement('div');
            card.className = 'track-card';

            const img = document.createElement('img');
            img.src = song.i;
            img.className = 'track-card-img';
            img.alt = song.n;

            const title = document.createElement('div');
            title.className = 'track-card-title';
            title.textContent = song.n;

            const artist = document.createElement('div');
            artist.className = 'track-card-artist';
            artist.textContent = song.a;

            const actions = document.createElement('div');
            actions.className = 'track-card-actions';

            const playBtn = document.createElement('button');
            playBtn.className = 'play-btn';
            playBtn.textContent = '▶ Play';
            playBtn.onclick = () => {
                this.player.setSong(idx);
                this.player.isPlaying = false;
                this.player.playPause();
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'add-btn';
            removeBtn.textContent = '✕ Remove';
            removeBtn.onclick = () => {
                this.player.songs.splice(idx, 1);
                this.renderTracks();
            };

            actions.appendChild(playBtn);
            actions.appendChild(removeBtn);

            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(artist);
            card.appendChild(actions);

            container.appendChild(card);
        });
    }

    // Render playlists page
    renderPlaylists() {
        const container = document.getElementById('playlists-list');
        container.innerHTML = '';

        Object.keys(this.playlists).forEach(playlistId => {
            const playlist = this.playlists[playlistId];
            const card = document.createElement('div');
            card.className = 'playlist-card';

            const title = document.createElement('div');
            title.className = 'playlist-card-title';
            title.textContent = playlist.name;

            const count = document.createElement('div');
            count.className = 'playlist-card-count';
            count.textContent = `${playlist.tracks ? playlist.tracks.length : 0} tracks`;

            card.appendChild(title);
            card.appendChild(count);
            card.onclick = () => {
                // Open playlist detail (for now, show in console)
                console.log('Open playlist:', playlist);
            };

            container.appendChild(card);
        });

        if (Object.keys(this.playlists).length === 0) {
            container.textContent = 'No playlists yet. Create one!';
        }
    }

    // Render albums page
    renderAlbums() {
        const container = document.getElementById('albums-list');
        container.innerHTML = '<p style="color: #b3b3b3;">Albums feature coming soon...</p>';
    }

    // Render favourites page
    renderFavourites() {
        const container = document.getElementById('favourites-list');
        container.innerHTML = '';

        if (Object.keys(this.likes).length === 0) {
            container.textContent = 'No liked songs yet!';
            return;
        }

        Object.values(this.likes).forEach(track => {
            if (track.previewUrl) {
                container.appendChild(this.createTrackCard(track));
            }
        });
    }

    // Initialize navigation
    initNavigation() {
        const pageSpans = document.querySelectorAll('.pages span');
        pageSpans.forEach(span => {
            span.addEventListener('click', () => {
                const label = span.textContent.trim();
                const pageMap = {
                    'Home': 'home-page',
                    'Tracks': 'tracks-page',
                    'Playlist': 'playlists-page',
                    'Albums': 'albums-page',
                    'Favourites': 'favourites-page'
                };
                const pageId = pageMap[label];
                if (pageId) this.showPage(pageId);
            });
        });

        // Create playlist button
        const createPlaylistBtn = document.getElementById('createPlaylistBtn');
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', () => {
                const name = prompt('Playlist name:');
                if (name) {
                    const id = Date.now().toString();
                    this.playlists[id] = { name, tracks: [], created: new Date().toISOString() };
                    this.savePlaylists();
                    this.renderPlaylists();
                }
            });
        }

        // Show home page initially
        this.showPage('home-page');
    }
}
