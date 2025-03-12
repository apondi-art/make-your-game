
export function initStartButton(startCallback) {
    const startOverlay = document.getElementById('startOverlay');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    

    startBtn.addEventListener('click', () => {
        startOverlay.style.display = 'none';
        pauseBtn.style.display = 'block';
    

        
        if (startCallback) {
            startCallback(); 
        }
    });
}