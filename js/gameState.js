export class GameState {
    constructor() {
        this.width = 10;
        this.height = 20;
        this.board = Array(this.width * this.height).fill(0);
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.lives = 3;
        this.gameTime = 180; // 3 minutes in seconds
        this.timeLeft = this.gameTime;
        this.gameOver = false;
        this.lastUpdateTime = 0;
        this.dropInterval = 700;
        this.paused = false;
        this.gameStartTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        this.lineThreshold = 5;
        this.gameActive = false;
    }
    
    spawnPiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.generatePiece();
        }
        this.currentPiece = {
            ...this.nextPiece,
            position: { x: Math.floor(this.width / 2) - 1, y: -2 }
        };
        this.nextPiece = this.generatePiece();
    
        // If we can't place the new piece, game over immediately
        if (!this.canPlacePiece(this.currentPiece)) {
            this.gameOver = true;
            this.gameActive = false;
        }
    }

    generatePiece() {
        const types = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            type,
            shape: this.getShape(type),
            color: this.getColor(type)
        };
    }

    getShape(type) {
        const shapes = {
            I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
            J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
            L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
            Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
            T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]]
        };
        return shapes[type];
    }

    getColor(type) {
        const colors = {
            I: '#00f0f0',  // Using hex codes for consistency
            J: '#0000f0',
            L: '#f0a000',
            O: '#f0f000',
            S: '#00f000',
            Z: '#f00000',
            T: '#a000f0'
        };
        return colors[type];
    }

    rotatePiece() {
        if (this.paused || !this.currentPiece || !this.gameActive) return;

        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const testPiece = {
            ...this.currentPiece,
            shape: rotated
        };

        if (this.canPlacePiece(testPiece)) {
            this.currentPiece.shape = rotated;
        } else {
            // Try wall kicks
            const kicks = [-1, 1, -2, 2];
            for (const kick of kicks) {
                testPiece.position.x += kick;
                if (this.canPlacePiece(testPiece)) {
                    this.currentPiece.shape = rotated;
                    this.currentPiece.position.x += kick;
                    break;
                }
                testPiece.position.x -= kick; // Reset
            }
        }
    }

    rotateMatrix(matrix) {
        const N = matrix.length;
        const result = Array(N).fill().map(() => Array(N).fill(0));
        for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
                result[x][N - 1 - y] = matrix[y][x];
            }
        }
        return result;
    }

    movePiece(dx, dy) {
        if (this.paused || !this.currentPiece || !this.gameActive) return false;

        const testPiece = {
            ...this.currentPiece,
            position: {
                x: this.currentPiece.position.x + dx,
                y: this.currentPiece.position.y + dy
            }
        };

        if (this.canPlacePiece(testPiece)) {
            this.currentPiece.position = testPiece.position;
            return true;
        }
        return false;
    }

    hardDrop() {
        if (this.paused || !this.gameActive) return;

        while (this.movePiece(0, 1)) {
            // Keep moving down until we can't
        }
        this.lockPiece();
    }

    lockPiece() {
        const { shape, position, color } = this.currentPiece;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = position.x + x;
                    const boardY = position.y + y;
                    if (boardY >= 0) {
                        this.board[boardY * this.width + boardX] = color;
                    }
                }
            }
        }
        this.clearLines();
        
        // Check if any columns are blocked
        if (this.checkForBlockedColumns()) {
            return; // Game over, don't spawn new piece
        }
        
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.height - 1; y >= 0; y--) {
            const rowStart = y * this.width;
            const row = this.board.slice(rowStart, rowStart + this.width);
            if (row.every(cell => cell !== 0)) {
                // Remove the line
                this.board.splice(rowStart, this.width);
                // Add new empty line at top
                this.board.unshift(...Array(this.width).fill(0));
                linesCleared++;
                y++; // Recheck same row index
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
    }

    updateScore(linesCleared) {
        const points = [0, 40, 100, 300, 1200][linesCleared] * this.level;
        this.score += points;
        this.lines += linesCleared;

        // Check for level up
        if (this.lines >= this.level * this.lineThreshold) {
            this.level++;
            this.dropInterval = Math.max(100, 700 - (this.level - 1) * 100);
        }
    }

    canPlacePiece(piece) {
        const { shape, position } = piece;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = position.x + x;
                    const boardY = position.y + y;

                    // Check board boundaries
                    if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
                        return false;
                    }

                    // For cells within the board, check if occupied
                    if (boardY >= 0 && this.board[boardY * this.width + boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    checkForBlockedColumns() {
        // Check the top row of the board
        for (let x = 0; x < this.width; x++) {
            // If any cell in top row is filled, the column is blocked
            if (this.board[x]) {
                this.loseLife();
                this.resetBoard();  // Reset the board after losing a life
                return true;  // Columns are blocked
            }
        }
        return false;  // No blocked columns
    }

    loseLife() {
        this.lives--;
        const livesDisplay = document.getElementById("final-lives");
        if (livesDisplay) {
            livesDisplay.textContent = this.lives;
        }
    
        // Game over when lives reach 0
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameActive = false;
        }
        
        return this.lives;
    }
  
    resetBoard() {
        // Clear all locked pieces
        this.board = Array(this.width * this.height).fill(0);
        // Reset timer but keep level and score
        this.totalPausedTime = 0;
        this.gameStartTime = Date.now();
        this.timeLeft = this.gameTime;
        // Reset drop interval based on current level
        this.dropInterval = Math.max(100, 700 - (this.level - 1) * 100);
        // Spawn new piece
        this.spawnPiece();
    }

    updateTimer() {
        if (this.paused || !this.gameStartTime || !this.gameActive) return;

        const now = Date.now();
        if (this.pauseStartTime > 0) {
            this.totalPausedTime += (now - this.pauseStartTime);
            this.pauseStartTime = 0;
        }

        const elapsedSeconds = Math.floor((now - this.gameStartTime - this.totalPausedTime) / 1000);
        this.timeLeft = Math.max(0, this.gameTime - elapsedSeconds);

        if (this.timeLeft <= 0) {
            if (this.loseLife() > 0) {
                // Reset timer if lives remain
                this.gameStartTime = now - this.totalPausedTime;
                this.timeLeft = this.gameTime;
                this.resetBoard();
            }
        }
    }

    togglePause() {
        if (!this.gameActive) return false;

        this.paused = !this.paused;
        if (this.paused) {
            this.pauseStartTime = Date.now();
        } else if (this.pauseStartTime > 0) {
            this.totalPausedTime += (Date.now() - this.pauseStartTime);
            this.pauseStartTime = 0;
        }
        return this.paused;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Ensure reset is comprehensive
    reset() {
        this.board = Array(this.width * this.height).fill(0);
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.lives = 3;
        this.timeLeft = this.gameTime;
        this.gameOver = false;
        this.lastUpdateTime = 0;
        this.dropInterval = 700;
        this.paused = false;
        this.gameStartTime = 0;
        this.pauseStartTime = 0;
        this.totalPausedTime = 0;
        this.gameActive = false;
    }

    // Modify startGame to be more immediate
    startGame() {
        this.reset();
        this.gameActive = true;
        this.gameStartTime = Date.now();
        this.spawnPiece();
        // Ensure we have pieces ready
        if (!this.nextPiece) {
            this.nextPiece = this.generatePiece();
        }
    }
}