import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { renderTeromino, rotateTetrimino, moveTetrimino, currentTetrimino, ChangeNextToCurrent, updateCells, hardDrop } from './tetrominoes.js';
import { GameStateManager } from './gamestate.js';

const gameState = new GameStateManager();

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    const gameBoardElement = document.getElementById("game-board");
    const restartBtn = document.getElementById("restartBtn");
    const quitBtn = document.getElementById("quitBtn");
    const cells = Array.from(document.querySelectorAll(".cell"));

    gameState.initialize(cells, gameBoardElement);

    // Add timer, level, and lives displays
    const scoreBoard = document.querySelector(".score-board");
    if (scoreBoard) {
        const timerDiv = document.createElement("div");
        timerDiv.innerHTML = `Time: <span id="timer">${gameState.formatTime(gameState.timeLeft)}</span>`;
        scoreBoard.appendChild(timerDiv);

        const levelDiv = document.createElement("div");
        levelDiv.innerHTML = `Level: <span id="level">${gameState.level}</span>`;
        scoreBoard.appendChild(levelDiv);

        const livesDiv = document.createElement("div");
        livesDiv.innerHTML = `Lives: <span id="lives">${gameState.lives}</span>`;
        scoreBoard.appendChild(livesDiv);
    }

    ChangeNextToCurrent();

    function updateTimer() {
        if (!gameState.gameActive) return;

        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - gameState.gameStartTime - gameState.totalPausedTime) / 1000);
        gameState.timeLeft = Math.max(0, gameState.gameTime - elapsedSeconds);

        const timerDisplay = document.getElementById("timer");
        if (timerDisplay) {
            timerDisplay.textContent = gameState.formatTime(gameState.timeLeft);
        }

        if (gameState.timeLeft <= 0) {
            if (gameState.lives > 1) {
                gameState.loseLife();
                gameState.gameStartTime = currentTime - gameState.totalPausedTime;
                if (timerDisplay) {
                    timerDisplay.textContent = gameState.formatTime(gameState.gameTime);
                }
            } else {
                gameState.gameActive = false;
                handleGameOver();
            }
        }
    }

    function processNotifications(deltaTime) {
        if (gameState.currentNotification) {
            gameState.notificationTimer += deltaTime;

            if (gameState.notificationTimer > gameState.NOTIFICATION_DURATION * 0.75 &&
                !gameState.notificationElement.classList.contains("fade-out")) {
                gameState.notificationElement.classList.add("fade-out");
            }

            if (gameState.notificationTimer >= gameState.NOTIFICATION_DURATION) {
                gameState.notificationElement.style.display = "none";
                gameState.currentNotification = null;
                gameState.notificationTimer = 0;
                gameState.notificationElement.classList.remove("fade-out");
            }
        } else if (gameState.notificationQueue.length > 0) {
            gameState.currentNotification = gameState.notificationQueue.shift();
            gameState.notificationElement.textContent = gameState.currentNotification.message;

            gameState.notificationElement.classList.remove("level-up", "life-lost");
            if (gameState.currentNotification.type === "level") {
                gameState.notificationElement.classList.add("level-up");
            } else {
                gameState.notificationElement.classList.add("life-lost");
            }

            gameState.notificationElement.style.display = "block";
            gameState.notificationElement.classList.remove("fade-out");
            gameState.notificationTimer = 0;
        }
    }

    function updateLevel() {
        const linesElement = document.getElementById("lines");
        const currentLines = parseInt(linesElement.textContent) || 0;

        if (currentLines >= gameState.level * gameState.lineThreshold) {
            gameState.level++;
            const levelDisplay = document.getElementById("level");
            if (levelDisplay) levelDisplay.textContent = gameState.level;

            gameState.dropInterval = Math.max(100, gameState.dropInterval - 50);
            gameState.queueNotification(`Level Up! ${gameState.level}`, "level");
        }
    }

    function processKeyStates(time) {
        if (time - gameState.lastKeyProcessed < gameState.KEY_PROCESS_INTERVAL) return;

        if (gameState.keyState.ArrowUp) {
            rotateTetrimino(gameState.cells);
            gameState.keyState.ArrowUp = false;
        }
        if (gameState.keyState.ArrowLeft) {
            moveTetrimino(gameState.cells, -1);
            gameState.keyState.ArrowLeft = false;
        }
        if (gameState.keyState.ArrowRight) {
            moveTetrimino(gameState.cells, 1);
            gameState.keyState.ArrowRight = false;
        }
        if (gameState.keyState.ArrowDown) {
            const moveResult = moveTetrimino(gameState.cells, 0, 1);
            if (!moveResult) {

                gameState.keyState.ArrowDown = false;
            };
            hardDrop(gameState.cells);
            gameState.keyState.ArrowDown = false;
        }

        gameState.lastKeyProcessed = time;
    }

    const startGame = () => {
        if (gameState.animationId !== null) {
            requestAnimationFrame(gameLoop);
            return;
        }

        gameState.resetForNewGame();
        gameBoardElement.classList.add("started");
        renderTeromino(gameState.cells);

        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.style.display = "block";
            pauseBtn.textContent = "Pause";
        }

        gameState.animationId = requestAnimationFrame(gameLoop);
    };

    const gameLoop = (time = 0) => {
        if (!gameState.gameActive) {
            requestAnimationFrame(gameLoop);
            return;
        }

        const deltaTime = time - gameState.lastTime;
        gameState.lastTime = time;

        const cappedDeltaTime = Math.min(deltaTime, 16);
        gameState.dropCounter += cappedDeltaTime;

        processKeyStates(time);
        processNotifications(cappedDeltaTime);
        updateTimer();

        if (gameState.dropCounter > gameState.dropInterval) {
            const moveResult = moveTetrimino(gameState.cells, gameState.width);
            if (moveResult === false) {
                if (checkGameOver()) {
                    if (gameState.lives > 1) {
                        gameState.loseLife();
                        resetBoard();
                    } else {
                        gameState.gameActive = false;
                        handleGameOver();
                        return;
                    }
                }
            }
            gameState.dropCounter = 0;
        }

        updateLevel();

        if (gameState.gameActive) {
            gameState.animationId = requestAnimationFrame(gameLoop);
        }
    };

    function checkGameOver() {
        const topRowCells = gameState.cells.slice(0, 30);
        return topRowCells.some(cell => cell.classList.contains("active") && !cell.classList.contains("current"));
    }

    function resetBoard() {
        gameState.cells.forEach(cell => {
            if (cell.classList.contains("active") && !cell.classList.contains("current")) {
                cell.className = "cell";
                cell.style.backgroundColor = "";
            }
        });
        updateCells(gameState.cells, false);
        ChangeNextToCurrent();
        renderTeromino(gameState.cells);
    }

    function handlePause() {
        if (!gameState.gameActive) return;
        gameState.pause();
        document.getElementById("pauseMenu").style.display = "flex";
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) pauseBtn.textContent = "Resume";
    }

    function handleResume() {
        if (gameState.gameActive) return;
        gameState.resume();
        document.getElementById("pauseMenu").style.display = "none";
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) pauseBtn.textContent = "Pause";
        gameState.animationId = requestAnimationFrame(gameLoop);
    }

    function initializePauseButton() {
        const pauseBtn = document.getElementById("pauseBtn");
        if (!pauseBtn) return;

        const newPauseBtn = pauseBtn.cloneNode(true);
        pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);

        newPauseBtn.addEventListener("click", function () {
            if (gameState.gameActive) handlePause();
            else handleResume();
        });
    }

    function handleGameOver() {
        gameState.gameActive = false;
        gameState.lives = 0; // Explicitly set lives to 0
    
        // Update the lives display
        const livesDisplay = document.getElementById("lives");
        if (livesDisplay) {
            livesDisplay.textContent = gameState.lives;
        }
    
        if (gameState.animationId !== null) {
            cancelAnimationFrame(gameState.animationId);
            gameState.animationId = null;
        }
    
        const pauseButton = document.getElementById("pauseBtn");
        if (pauseButton) {
            pauseButton.style.display = "none";
        }
    
        // Remove any existing game over screen
        let existingGameOver = document.querySelector(".game-over");
        if (existingGameOver) existingGameOver.remove();
    
        const gameOverDiv = document.createElement("div");
        gameOverDiv.className = "game-over";
        gameOverDiv.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: <span id="final-score">${document.getElementById("score").textContent}</span></p>
            <p>Lines Cleared: <span id="final-lines">${document.getElementById("lines").textContent}</span></p>
            <p>Level Reached: <span id="final-level">${document.getElementById("level").textContent}</span></p>
            <p>Lives: <span id="final-lives">0</span></p>
            <button id="gameOverRestartBtn">Restart</button>
            <button id="gameOverquitBtn">Quit</button>
        `;
    
        gameBoardElement.appendChild(gameOverDiv);
    
        document.getElementById("gameOverRestartBtn").addEventListener("click", () => {
            gameOverDiv.remove();
            handleRestart();
        });
    
        document.getElementById("gameOverquitBtn").addEventListener("click", () => {
            gameOverDiv.remove();
            handleQuit();
        });
    }

    function handleRestart() {
        gameState.resetForNewGame();
        gameBoardElement.classList.remove("game-over");
        gameState.cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });

        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";

        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.textContent = "Pause";
            pauseBtn.style.display = "block";
        }

        updateCells(gameState.cells, false);
        ChangeNextToCurrent();
        startGame();
    }

    function handleQuit() {
        console.log("Game quit");
    
        // Reset all game state
        gameState.resetAll();
        
        // Cancel any active animation frame
        if (gameState.animationId !== null) {
            cancelAnimationFrame(gameState.animationId);
            gameState.animationId = null;
        }
    
        // Hide UI elements
        document.getElementById("pauseMenu").style.display = "none";
        gameBoardElement.classList.remove("started", "game-over");
    
        // Clear all cells
        gameState.cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });
    
        // Reset score displays
        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";
    
        // Hide pause button and show start overlay
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) pauseBtn.style.display = "none";
    
        const startOverlay = document.getElementById("startOverlay");
        if (startOverlay) startOverlay.style.display = "flex";
    
        // Prepare fresh start callback
        initStartButton(() => {
            updateCells(gameState.cells, false);
            ChangeNextToCurrent();
            startGame();
        });
    }

    // Initialize UI
    initStartButton(startGame);
    initializePauseButton();

    // Event listeners
    document.addEventListener("keydown", (event) => {
        if (!gameState.gameActive) return;

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            gameState.keyState[event.key] = true;
        }

        if (event.key === " " || event.key === "Escape") {
            event.preventDefault();
            if (gameState.gameActive) handlePause();
            else if (document.getElementById("pauseMenu").style.display === "flex") handleResume();
        }
    });

    document.addEventListener("keyup", (event) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            gameState.keyState[event.key] = false;
        }
    });

    const DEBUG_MODE = true; // Set to false for production
    window.addEventListener("blur", () => {
        gameState.clearKeyStates();
        if (!DEBUG_MODE && gameState.gameActive) handlePause();
    });
    
    // Initialize pause menu
    new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
    if (restartBtn) restartBtn.addEventListener("click", handleRestart);
    if (quitBtn) quitBtn.addEventListener("click", handleQuit);
});