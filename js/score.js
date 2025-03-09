export class Score {
    constructor() {
        this.score = 0;
        this.linesCleared = 0;
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.scoreBoard = document.querySelector('.score-board');
        this.updateDisplay();
    }

    addScore(lines) {
        switch(lines) {
            case 1:
                this.score += 40;
                break;
            case 2:
                this.score += 100;
                break;
            case 3:
                this.score += 300;
                break;
            case 4:
                this.score += 1200;
                break;
        }
        this.linesCleared += lines;
        this.updateDisplay();
    }

    reset() {
        this.score = 0;
        this.linesCleared = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.linesCleared;
        
        // Adjust width based on score length
        const scoreLength = this.score.toString().length;
        const baseWidth = 80; // Minimum width
        const extraWidth = Math.min(scoreLength * 10, 100); // Max extra width of 100px
        this.scoreBoard.style.width = `${baseWidth + extraWidth}px`;
    }
}