// musicplayer.js
class MusicPlayer {
    constructor(songs = [], seekBar) {
        if (!Array.isArray(songs) || songs.length === 0) {
            console.error("No songs provided.");
            return;
        }
        this.audio = new Audio();
        this.songs = songs;
        this.currentIndex = 7;
        this.isPlaying = false;
        this.shuffle = false;
        this.repeat = false;
        this.isMuted = false;
        this.seekBar = seekBar;
        this.isSeeking = false;

        this.playPause = this.playPause.bind(this);
        this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
        this.animateSeekBar = this.animateSeekBar.bind(this);

        this.addEventListeners();
        this.setupSeekBarIntegration();
        this.setSong(this.currentIndex);
        requestAnimationFrame(this.animateSeekBar);
    }

    addEventListeners() {
        const btn = document.getElementById("playPause");
        if (btn) btn.addEventListener("click", this.playPause);

        document.getElementById("nextBtn")?.addEventListener("click", () => this.next());
        document.getElementById("prevBtn")?.addEventListener("click", () => this.previous());

        this.audio.addEventListener("timeupdate", this.handleTimeUpdate);
        this.audio.addEventListener("ended", () => {
            this.repeat ? (this.audio.currentTime = 0, this.audio.play()) : this.next();
        });
    }

    setupSeekBarIntegration() {
        this.seekBar.onSeekStart = () => (this.isSeeking = true);
        this.seekBar.onSeekEnd = (progress) => {
            if (this.audio.duration) this.audio.currentTime = progress * this.audio.duration;
            this.isSeeking = false;
        };
    }

    handleTimeUpdate() {
        if (!this.isSeeking) {
            const ctime = document.getElementById("ctime");
            const etime = document.getElementById("etime");
            if (ctime) ctime.textContent = this.formatTime(this.audio.currentTime);
            if (etime) etime.textContent = this.formatTime(this.audio.duration);
        }
    }

    animateSeekBar() {
        if (!this.isSeeking && this.audio.duration) {
            this.seekBar.progress = this.audio.currentTime / this.audio.duration;
        }
        requestAnimationFrame(this.animateSeekBar);
    }

    setSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        this.currentIndex = index;
        const song = this.songs[index];
        this.audio.src = `https://www.dropbox.com/s/${song.s}?raw=1`;
        document.getElementById("bgi").style.backgroundImage = `url(https://www.dropbox.com/s/${song.i}?raw=1)`;

        document.querySelector(".player-title").textContent = song.n;
        document.querySelector(".player-artist").textContent = song.a;

        this.audio.load();
        if (this.isPlaying) this.audio.play().catch(err => console.error("Play failed:", err));
    }

    playPause() {
        const btn = document.getElementById("playPause");
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            if (btn) btn.src = "assets/icons/play.svg";
        } else {
            this.audio.play().catch(err => console.error("Play failed:", err));
            this.isPlaying = true;
            if (btn) btn.src = "assets/icons/pause.svg";
        }
        this.seekBar.setWaveState(this.isPlaying);
    }

    next() {
        this.currentIndex = this.shuffle
            ? Math.floor(Math.random() * this.songs.length)
            : (this.currentIndex + 1) % this.songs.length;
        this.setSong(this.currentIndex);
    }

    previous() {
        this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
        this.setSong(this.currentIndex);
    }

    toggleShuffle() { this.shuffle = !this.shuffle; }
    toggleRepeat() { this.repeat = !this.repeat; }
    toggleMute() { this.isMuted = !this.isMuted; this.audio.muted = this.isMuted; }

    formatTime(sec) {
        if (!isFinite(sec)) return "00:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
}
