export const Score = (() => {
    let score = 0;
    let linesCleared = 0;
    let updateScheduled = false;

    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');
    const scoreBoard = document.querySelector('.score-board');

    if (!scoreElement || !linesElement || !scoreBoard) {
        throw new Error("Missing DOM elements: Ensure #score, #lines, and .score-board exist.");
    }

    function scheduleUpdate() {
        if (!updateScheduled) {
            updateScheduled = true;
            requestAnimationFrame(() => {
                updateDisplay();
                updateScheduled = false;
            });
        }
    }

    function updateDisplay() {
        if (scoreElement.textContent !== String(score)) {
            scoreElement.textContent = score;
        }
        if (linesElement.textContent !== String(linesCleared)) {
            linesElement.textContent = linesCleared;
        }

        const scoreLength = score.toString().length;
        const baseWidth = 80; 
        const extraWidth = Math.min(scoreLength * 10, 100); 
        if (scoreBoard.style.width !== `${baseWidth + extraWidth}px`) {
            scoreBoard.style.width = `${baseWidth + extraWidth}px`;
        }
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
            scheduleUpdate();
        },
        reset() {
            score = 0;
            linesCleared = 0;
            scheduleUpdate();
        }
    };
})();
