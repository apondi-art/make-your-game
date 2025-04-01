export class InputManager {
    constructor(gameLoop) {
        this.gameLoop = gameLoop;
        this.keyStates = {};
        this.keyRepeatDelay = 150;
        this.keyRepeatInterval = 50;
        this.repeatTimers = {};
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.keyStates[e.code]) {
                this.handleKeyPress(e.code);
                this.keyStates[e.code] = true;
                
                // Set up repeat for movement keys
                if (['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.code)) {
                    this.repeatTimers[e.code] = setTimeout(() => {
                        this.repeatTimers[e.code] = setInterval(() => {
                            this.handleKeyPress(e.code);
                        }, this.keyRepeatInterval);
                    }, this.keyRepeatDelay);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keyStates[e.code] = false;
            if (this.repeatTimers[e.code]) {
                clearTimeout(this.repeatTimers[e.code]);
                clearInterval(this.repeatTimers[e.code]);
                delete this.repeatTimers[e.code];
            }
        });

        // Button event listeners
        document.getElementById('startButton').addEventListener('click', () => {
            document.getElementById('startOverlay').style.display = 'none';
            document.getElementById('controllers').style.display = 'flex';
            this.gameLoop.start();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.handleRestart();
        });
        
        document.getElementById('gameOverRestartBtn').addEventListener('click', () => {
            this.handleRestart();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.handlePause();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.handlePause();
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.handleQuit();
        });
        
        document.getElementById('gameOverQuitBtn').addEventListener('click', () => {
            this.handleQuit();
        });
    }

    handleKeyPress(code) {
        if (!this.gameLoop.isRunning || this.gameLoop.gameState.gameOver) return;
        
        const gameState = this.gameLoop.gameState;
        
        switch(code) {
            case 'ArrowLeft':
                gameState.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                gameState.movePiece(1, 0);
                break;
            case 'ArrowDown':
                gameState.movePiece(0, 1);
                break;
            case 'ArrowUp':
                gameState.rotatePiece();
                break;
            case 'Space':
                gameState.hardDrop();
                break;
            case 'KeyP':
            case 'Escape':
                this.handlePause();
                break;
        }
    }

    handlePause() {
        const isPaused = this.gameLoop.gameState.togglePause();
        this.gameLoop.queueNotification(
            isPaused ? "Game Paused" : "Game Resumed",
            "pause"
        );
    }

   // Modify the restart and quit handlers
handleRestart() {
    this.gameLoop.stop();
    // Force immediate cleanup
    this.gameLoop.gameState.reset();
    document.getElementById('game-over').style.display = 'none';
    // Start on next event loop cycle to ensure clean state
    setTimeout(() => this.gameLoop.start(), 0);
}

handleQuit() {
    this.gameLoop.stop();
    // Fully reset the game state
    this.gameLoop.gameState.reset();
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('startOverlay').style.display = 'flex';
    // Don't start the game here - wait for user to click start
}
}