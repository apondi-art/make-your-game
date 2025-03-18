export function initStartButton(startCallback) {
    const startOverlay = document.getElementById('startOverlay');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const nextPiece = document.getElementById("nextPiece");

    startBtn.addEventListener('click', () => {
        requestAnimationFrame(() => { // Batch UI updates for smoother performance
            startOverlay.style.display = 'none';
            pauseBtn.style.display = 'block';
            nextPiece.style.display = 'grid';
        });

        if (startCallback) {
            if (window.requestIdleCallback) {
                requestIdleCallback(startCallback); 
            } else {
                requestAnimationFrame(startCallback);
            }
        }
    });
}
