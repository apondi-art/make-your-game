export const Score = (() => {
    let score = 0;
    let linesCleared = 0;

    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');
    const scoreBoard = document.querySelector('.score-board');

    function updateDisplay() {
        scoreElement.textContent = score;
        linesElement.textContent = linesCleared;

        // Adjust width based on score length
        const scoreLength = score.toString().length;
        const baseWidth = 80; // Minimum width
        const extraWidth = Math.min(scoreLength * 10, 100); // Max extra width of 100px
        scoreBoard.style.width = `${baseWidth + extraWidth}px`;
    }

    return {
        addScore(lines) {
            switch (lines) {
                case 1: score += 40; break;
                case 2: score += 100; break;
                case 3: score += 300; break;
                case 4: score += 1200; break;
            }
            linesCleared += lines;
            updateDisplay();
        },
        reset() {
            score = 0;
            linesCleared = 0;
            updateDisplay();
        }
    };
})();
