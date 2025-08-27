// seekbar.js
class SeekBar {
    constructor(canvasId = "seekbar") {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with ID "${canvasId}" not found.`);
            return;
        }
        this.ctx = this.canvas.getContext("2d");

        // Internal state
        this.height = 0;
        this.width = 0;
        this.seekableLength = 0;
        this.waveOffset1 = 0;
        this.waveOffset2 = 0;
        this.isHolding = false;
        this.isWaving = false;
        this.progress = 0.0;

        // Config
        this.wave1Speed = 0.08;
        this.wave2Speed = 0.035;
        this.waveSmoothness = 1;
        this.waveLength = 50;
        this.trackHeight = 25;
        this.padding = 15;
        this.dotRadius = 14;
        this.baseColor = "rgba(150,150,150,0.4)";
        this.dotColor = "white";

        // Callbacks
        this.onSeekStart = null;
        this.onSeekMove = null;
        this.onSeekEnd = null;

        // Bind
        this.handleResize = this.handleResize.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleHold = this.handleHold.bind(this);
        this.handleRelease = this.handleRelease.bind(this);
        this.renderLoop = this.renderLoop.bind(this);

        // Init
        this.handleResize();
        this.addEventListeners();
        requestAnimationFrame(this.renderLoop);
    }

    setWaveState(state) {
        this.isWaving = state;
    }

    addEventListeners() {
        window.addEventListener("resize", this.handleResize);
        window.addEventListener("mousemove", this.handleMove);
        window.addEventListener("mousedown", this.handleHold);
        window.addEventListener("mouseup", this.handleRelease);
        window.addEventListener("touchmove", this.handleMove);
        window.addEventListener("touchstart", this.handleHold);
        window.addEventListener("touchend", this.handleRelease);
    }

    handleResize() {
        this.canvas.height = this.height = this.canvas.clientHeight * 2;
        this.canvas.width = this.width = this.canvas.clientWidth * 2;
        this.seekableLength = this.width - this.padding * 2;
    }

    renderLoop() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.draw();
        requestAnimationFrame(this.renderLoop);
    }

    draw() {
        if (this.isWaving) {
            this.waveOffset1 -= this.wave1Speed;
            this.waveOffset2 -= this.wave2Speed;
        }

        const progressLength = this.seekableLength * this.progress;
        this.drawBackground();
        this.drawWave(this.waveOffset1, 6, 0.7, progressLength);
        this.drawWave(this.waveOffset2, 8, 0.5, progressLength);
        this.drawDot(progressLength);
    }

    drawBackground() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.trackHeight);
        this.ctx.lineTo(this.width - this.padding, this.trackHeight);
        this.ctx.lineWidth = this.trackHeight;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = this.baseColor;
        this.ctx.stroke();
    }

    drawDot(position) {
        this.ctx.beginPath();
        this.ctx.arc(position + this.padding, this.trackHeight, this.dotRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.dotColor;
        this.ctx.fill();
    }

    drawWave(offset, waveHeight, opacity, length) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.trackHeight + 13);
        this.ctx.arc(this.padding, this.trackHeight, 13, -Math.PI / 2, Math.PI / 2, true);

        for (let i = 0; i < length; i += this.waveSmoothness) {
            let wave = Math.cos(i / this.waveLength + offset) * waveHeight;
            let normalize = 50;
            if (i < normalize) wave *= i / normalize;
            if (i > length - normalize) wave *= (length - i) / normalize;
            this.ctx.lineTo(i + this.padding, this.trackHeight - 13 + (this.isWaving ? wave : 0));
        }

        this.ctx.lineTo(length + this.padding, this.trackHeight + 13);
        this.ctx.closePath();
        this.ctx.fillStyle = `rgba(230,150,150,${opacity})`;
        this.ctx.fill();
    }

    getEventX(e) {
        if (e.touches && e.touches.length) return e.touches[0].clientX;
        return e.clientX;
    }

    handleMove(e) {
        if (!this.isHolding) return;
        const rect = this.canvas.getBoundingClientRect();
        let x = (this.getEventX(e) - rect.left) * 2;
        x = Math.max(this.padding, Math.min(x, this.width - this.padding));
        this.progress = (x - this.padding) / this.seekableLength;
        if (this.onSeekMove) this.onSeekMove(this.progress);
    }

    handleHold(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x = (this.getEventX(e) - rect.left) * 2;
        x = Math.max(this.padding, Math.min(x, this.width - this.padding));
        const dist = Math.abs(x - (this.progress * this.seekableLength + this.padding));
        if (dist < this.dotRadius + 6) {
            this.isHolding = true;
            if (this.onSeekStart) this.onSeekStart();
        }
    }

    handleRelease() {
        if (this.isHolding && this.onSeekEnd) this.onSeekEnd(this.progress);
        this.isHolding = false;
    }
}
