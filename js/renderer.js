export class Renderer {
    constructor(boardElement, previewElement, scoreElements) {
        this.boardElement = boardElement;
        this.previewElement = previewElement;
        this.scoreElements = scoreElements;
        this.cells = Array.from(boardElement.querySelectorAll('.cell'));
        this.previewCells = Array.from(previewElement.querySelectorAll('.preview-cell'));
        
        // Notification system
        this.notificationElement = document.createElement('div');
        this.notificationElement.className = 'notification';
        this.notificationElement.style.display = 'none';
        document.body.appendChild(this.notificationElement);
    }

    showNotification(message, type) {
        this.notificationElement.textContent = message;
        this.notificationElement.className = `notification ${type}`;
        this.notificationElement.style.display = 'block';
    }

    hideNotification() {
        this.notificationElement.style.display = 'none';
    }

    draw(state) {
        // Clear the board
        this.cells.forEach(cell => {
            cell.className = 'cell';
            cell.style.backgroundColor = '';
        });

        // Draw locked pieces
        state.board.forEach((color, index) => {
            if (color) {
                this.cells[index].classList.add('occupied');
                this.cells[index].style.backgroundColor = color;
            }
        });

        // Draw current piece
        if (state.currentPiece && state.gameActive && !state.gameOver) {
            const {shape, position, color} = state.currentPiece;
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const boardX = position.x + x;
                        const boardY = position.y + y;
                        if (boardY >= 0 && boardX >= 0 && boardX < 10 && boardY < 20) {
                            const index = boardY * 10 + boardX;
                            this.cells[index].classList.add('active');
                            this.cells[index].style.backgroundColor = color;
                            this.cells[index].classList.add(color); // Add color class
                        }
                    }
                }
            }
        }

        // Draw next piece preview
        this.previewCells.forEach(cell => {
            cell.style.backgroundColor = '';
        });
        if (state.nextPiece) {
            const {shape, color} = state.nextPiece;
            const centerX = Math.floor((4 - shape[0].length) / 2);
            const centerY = Math.floor((4 - shape.length) / 2);
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        const previewX = centerX + x;
                        const previewY = centerY + y;
                        const index = previewY * 4 + previewX;
                        if (index >= 0 && index < 16) {
                            this.previewCells[index].style.backgroundColor = color;
                        }
                    }
                }
            }
        }

        // Update all displays
        this.scoreElements.score.textContent = state.score;
        this.scoreElements.lines.textContent = state.lines;
        this.scoreElements.level.textContent = state.level;
        this.scoreElements.lives.textContent = state.lives;
        this.scoreElements.timer.textContent = state.formatTime(state.timeLeft);

        // Handle game over and pause screens
        const gameOverElement = document.getElementById('game-over');
        const pauseElement = document.getElementById('pause');
        
        if (state.gameOver) {
            gameOverElement.style.display = 'flex';
            pauseElement.style.display = 'none';
            
            // Update game over display with final stats
            document.getElementById('final-score').textContent = state.score;
            document.getElementById('final-lines').textContent = state.lines;
            document.getElementById('final-level').textContent = state.level;
            document.getElementById('final-lives').textContent = 0;
        } 
        else if (state.paused) {
            gameOverElement.style.display = 'none';
            pauseElement.style.display = 'flex';
        } 
        else {
            gameOverElement.style.display = 'none';
            pauseElement.style.display = 'none';
        }
    }
}