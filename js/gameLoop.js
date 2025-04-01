export class GameLoop {
    constructor(gameState, renderer) {
        this.gameState = gameState;
        this.renderer = renderer;
        this.lastFrameTime = 0;
        this.accumulator = 0;
        this.timestep = 1000/60; // 60 FPS
        this.isRunning = false;
        this.animationFrameId = null;
        this.notificationQueue = [];
        this.currentNotification = null;
        this.notificationTimer = 0;
        
        // Reusable render state object to minimize GC
        this.renderState = {
            board: [],
            currentPiece: null,
            nextPiece: null,
            score: 0,
            lines: 0,
            level: 1,
            lives: 3,
            timeLeft: 0,
            gameOver: false,
            paused: false,
            gameActive: false,
            width: 10,
            height: 20,
            formatTime: (seconds) => this.gameState.formatTime(seconds)
        };
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameState.startGame();
        this.lastFrameTime = performance.now();
        this.accumulator = 0; // Reset accumulator
        this.gameLoop(this.lastFrameTime);
    }

    stop() {
        this.isRunning = false;
        this.gameState.gameActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.notificationQueue = [];
        this.currentNotification = null;
    }

    gameLoop(timestamp = 0) {
        if (!this.isRunning) return;
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        
        // Calculate delta time
        let deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Prevent spiral of death
        if (deltaTime > 1000) deltaTime = this.timestep;
        
        this.accumulator += deltaTime;
        
        // Process fixed timestep updates
        while (this.accumulator >= this.timestep) {
            this.update(this.timestep);
            this.accumulator -= this.timestep;
        }
        
        // Process notifications
        this.processNotifications(deltaTime);
        
        // Render at display refresh rate
        this.render();
    }

    update(deltaTime) {
        if (!this.gameState.gameActive || this.gameState.paused) return;
    
        if (this.gameState.gameOver) {
            this.stop();
            this.queueNotification("Game Over!", "game-over");
            return;
        }
    
        // Update timer
        this.gameState.updateTimer();
    
        // Handle automatic dropping
        this.gameState.lastUpdateTime += deltaTime;
        if (this.gameState.lastUpdateTime >= this.gameState.dropInterval) {
            if (!this.gameState.movePiece(0, 1)) {
                const livesBefore = this.gameState.lives;
                this.gameState.lockPiece();
                
                // Only show notification if lives actually decreased
                if (this.gameState.lives < livesBefore) {
                    this.queueNotification(
                        `Life Lost! ${this.gameState.lives} remaining`, 
                        "life-lost"
                    );
                }
            }
            this.gameState.lastUpdateTime = 0;
        }
    }


    render() {
        // Update the reusable render state object
        this.renderState.board = this.gameState.board;
        this.renderState.currentPiece = this.gameState.currentPiece;
        this.renderState.nextPiece = this.gameState.nextPiece;
        this.renderState.score = this.gameState.score;
        this.renderState.lines = this.gameState.lines;
        this.renderState.level = this.gameState.level;
        this.renderState.lives = this.gameState.lives;
        this.renderState.timeLeft = this.gameState.timeLeft;
        this.renderState.gameOver = this.gameState.gameOver;
        this.renderState.paused = this.gameState.paused;
        this.renderState.gameActive = this.gameState.gameActive;
        
        this.renderer.draw(this.renderState);
    }

    queueNotification(message, type) {
        this.notificationQueue.push({ message, type });
    }

    processNotifications(deltaTime) {
        if (this.currentNotification) {
            this.notificationTimer -= deltaTime;
            if (this.notificationTimer <= 0) {
                this.currentNotification = null;
                this.renderer.hideNotification();
            }
        } else if (this.notificationQueue.length > 0) {
            this.currentNotification = this.notificationQueue.shift();
            this.renderer.showNotification(
                this.currentNotification.message, 
                this.currentNotification.type
            );
            this.notificationTimer = 2000;
        }
    }
}