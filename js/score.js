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
            const scoring = [0, 40, 100, 300, 1200]; 
            score += scoring[lines] || (lines > 4 ? 1200 + (lines - 4) * 300 : 0); 
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
