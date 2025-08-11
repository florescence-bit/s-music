class seekbar {
    constructor() {
        this.seekbar = document.querySelector('.seekbar');
        this.seekbarProgress = document.querySelector('.seekbar-progress');
        this.seekbarButton = document.querySelector('.seekbar-button');
        this.isDragging = false;

        this.init();
    }

    init() {
        this.seekbar.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.updateSeekbar(event);
    }

    onMouseMove(event) {
        if (this.isDragging) {
            this.updateSeekbar(event);
        }
    }

    onMouseUp() {
        this.isDragging = false;
    }

    updateSeekbar(event) {
        const rect = this.seekbar.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const percentage = Math.min(Math.max(offsetX / rect.width, 0), 1);
        
        this.seekbarProgress.style.width = `${percentage * 100}%`;
        this.seekbarButton.style.left = `${percentage * 100}%`;
    }
}