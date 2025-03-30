// gameStateManager.js
export class GameStateManager {
    constructor() {
        // Board and rendering elements
        this.cells = null;
        this.gameBoardElement = null;
        this.width = 10;
        
        // Animation and timing
        this.lastTime = 0;
        this.dropInterval = 500;
        this.dropCounter = 0;
        this.gameActive = false;
        this.animationId = null;
        
        // Timer, level, and lives variables
        this.gameTime = 180;
        this.timeLeft = this.gameTime;
        this.level = 1;
        this.lives = 3;
        this.gameStartTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        this.lineThreshold = 5;
        
        // Notification system
        this.notificationQueue = [];
        this.currentNotification = null;
        this.notificationTimer = 0;
        this.NOTIFICATION_DURATION = 1000;
        this.notificationElement = null;
        
        // Key state tracking
        this.keyState = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        this.lastKeyProcessed = 0;
        this.KEY_PROCESS_INTERVAL = 100;
    }
    
    initialize(cellsArray, boardElement) {
        this.cells = cellsArray;
        this.gameBoardElement = boardElement;
        this.createNotificationElement();
    }
    
    createNotificationElement() {
        this.notificationElement = document.createElement("div");
        this.notificationElement.className = "game-notification";
        this.notificationElement.style.display = "none";
        this.gameBoardElement.appendChild(this.notificationElement);
    }
    
    resetForNewGame() {
        this.gameActive = true;
        this.gameStartTime = Date.now();
        this.totalPausedTime = 0;
        this.pauseStartTime = 0;
        this.timeLeft = this.gameTime;
        this.level = 1;
        this.lives = 3;
        this.dropInterval = 500;
        
        this.notificationQueue = [];
        this.currentNotification = null;
        this.notificationTimer = 0;
        this.notificationElement.style.display = "none";
        this.notificationElement.classList.remove("fade-out");
        
        Object.keys(this.keyState).forEach(key => this.keyState[key] = false);
        this.lastKeyProcessed = 0;
        
        this.lastTime = performance.now();
        this.dropCounter = 0;
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplays() {
        const timerDisplay = document.getElementById("timer");
        const levelDisplay = document.getElementById("level");
        const livesDisplay = document.getElementById("lives");
        
        if (timerDisplay) timerDisplay.textContent = this.formatTime(this.timeLeft);
        if (levelDisplay) levelDisplay.textContent = this.level;
        if (livesDisplay) livesDisplay.textContent = this.lives;
    }
    
    queueNotification(message, type) {
        this.notificationQueue.push({ message, type });
    }
    
    loseLife() {
        this.lives--;
        const livesDisplay = document.getElementById("lives");
        if (livesDisplay) {
            livesDisplay.textContent = this.lives;
        }

        this.queueNotification(`Life Lost! ${this.lives} remaining`, "life");
    }
    
    pause() {
        if (!this.gameActive) return;
        this.gameActive = false;
        this.pauseStartTime = Date.now();
    }
    
    resume() {
        if (this.gameActive) return;
        if (this.pauseStartTime > 0) {
            this.totalPausedTime += (Date.now() - this.pauseStartTime);
            this.pauseStartTime = 0;
        }
        this.lastTime = performance.now();
        this.dropCounter = 0;
        Object.keys(this.keyState).forEach(key => this.keyState[key] = false);
        this.gameActive = true;
    }
    
    clearKeyStates() {
        Object.keys(this.keyState).forEach(key => this.keyState[key] = false);
    }
}