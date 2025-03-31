import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { renderTeromino, rotateTetrimino, moveTetrimino, currentTetrimino, ChangeNextToCurrent, updateCells, hardDrop } from './tetrominoes.js';
import { GameStateManager } from './gamestate.js';

const gameState = new GameStateManager();

// Extend GameStateManager to include board data structure (to be added in gamestate.js)
// gameState.boardData = Array(20).fill().map(() => Array(10).fill(0));

// Constants for performance optimization
const FPS = 60;
const TIME_STEP = 1000 / FPS;
let lastFrameTimeMs = 0;
let delta = 0;

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

    // PERFORMANCE IMPROVEMENT: Only update DOM when time changes
    function updateTimer() {
        if (!gameState.gameActive) return;

        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - gameState.gameStartTime - gameState.totalPausedTime) / 1000);
        const newTimeLeft = Math.max(0, gameState.gameTime - elapsedSeconds);
        
        // Only update DOM if the time has changed
        if (newTimeLeft !== gameState.timeLeft) {
            gameState.timeLeft = newTimeLeft;
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
    }

    // PERFORMANCE IMPROVEMENT: Optimize notification processing
    let lastNotificationState = null;
    function processNotifications(deltaTime) {
        if (gameState.currentNotification) {
            gameState.notificationTimer += deltaTime;
            
            // Only update DOM when state changes
            const fadeThreshold = gameState.NOTIFICATION_DURATION * 0.75;
            const shouldFadeOut = gameState.notificationTimer > fadeThreshold;
            const isFadingOut = gameState.notificationElement.classList.contains("fade-out");
            
            if (shouldFadeOut && !isFadingOut) {
                gameState.notificationElement.classList.add("fade-out");
            }

            if (gameState.notificationTimer >= gameState.NOTIFICATION_DURATION) {
                gameState.notificationElement.style.display = "none";
                gameState.currentNotification = null;
                gameState.notificationTimer = 0;
                gameState.notificationElement.classList.remove("fade-out");
            }
        } else if (gameState.notificationQueue.length > 0 && !gameState.currentNotification) {
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

    // PERFORMANCE IMPROVEMENT: Cache line count, update DOM only when needed
    let cachedLines = 0;
    function updateLevel() {
        // Get lines from game state instead of DOM
        const linesElement = document.getElementById("lines");
        const currentLines = parseInt(linesElement.textContent) || 0;
        
        // Only process if lines have changed
        if (currentLines !== cachedLines) {
            cachedLines = currentLines;
            
            if (currentLines >= gameState.level * gameState.lineThreshold) {
                gameState.level++;
                const levelDisplay = document.getElementById("level");
                if (levelDisplay) levelDisplay.textContent = gameState.level;

                gameState.dropInterval = Math.max(100, gameState.dropInterval - 50);
                gameState.queueNotification(`Level Up! ${gameState.level}`, "level");
            }
        }
    }

    // PERFORMANCE IMPROVEMENT: Process keys sequentially not simultaneously
    function processKeyStates(time) {
        if (time - gameState.lastKeyProcessed < gameState.KEY_PROCESS_INTERVAL) return;

        // Process one key at a time for better performance
        if (gameState.keyState.ArrowUp) {
            rotateTetrimino(gameState.cells);
            gameState.keyState.ArrowUp = false;
        } 
        else if (gameState.keyState.ArrowLeft) {
            moveTetrimino(gameState.cells, -1);
            gameState.keyState.ArrowLeft = false;
        }
        else if (gameState.keyState.ArrowRight) {
            moveTetrimino(gameState.cells, 1);
            gameState.keyState.ArrowRight = false;
        }
        else if (gameState.keyState.ArrowDown) {
            const moveResult = moveTetrimino(gameState.cells, 0, 1);
            if (!moveResult) {
                gameState.keyState.ArrowDown = false;
            }
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

        // Reset performance variables
        lastFrameTimeMs = 0;
        delta = 0;
        
        gameState.animationId = requestAnimationFrame(gameLoop);
    };

    // PERFORMANCE IMPROVEMENT: Implement fixed timestep game loop
    const gameLoop = (time = 0) => {
        if (!gameState.gameActive) {
            requestAnimationFrame(gameLoop);
            return;
        }

        // Calculate time delta using fixed timestep approach
        if (lastFrameTimeMs === 0) {
            lastFrameTimeMs = time;
        }
        
        delta += time - lastFrameTimeMs;
        lastFrameTimeMs = time;
        
        // Process input (can happen every frame)
        processKeyStates(time);
        
        // Fixed timestep for game logic
        let numUpdateSteps = 0;
        while (delta >= TIME_STEP) {
            // Game logic update with fixed timestep
            const cappedDeltaTime = Math.min(TIME_STEP, 16);
            
            // Update notification animations
            processNotifications(cappedDeltaTime);
            
            // Update timer
            updateTimer();
            
            // Handle tetrimino dropping with fixed timestep
            gameState.dropCounter += cappedDeltaTime;
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
                            delta = 0;
                            return;
                        }
                    }
                }
                gameState.dropCounter = 0;
            }
            
            // Update level based on lines cleared
            updateLevel();
            
            delta -= TIME_STEP;
            
            // Safety valve to prevent spiral of death
            if (++numUpdateSteps >= 240) {
                delta = 0;
                console.warn("Game loop running too slowly");
                break;
            }
        }

        if (gameState.gameActive) {
            gameState.animationId = requestAnimationFrame(gameLoop);
        }
    };

    // PERFORMANCE IMPROVEMENT: More efficient game over check 
    function checkGameOver() {
        // Slice only once and check for specific classes
        const topRowCells = gameState.cells.slice(0, 30);
        // Use array iteration instead of DOM operations when possible
        return topRowCells.some(cell => 
            cell.classList.contains("active") && !cell.classList.contains("current")
        );
        
        // In the future, this should use the boardData structure instead of DOM elements
    }

    // PERFORMANCE IMPROVEMENT: More efficient board reset
    function resetBoard() {
        // Batch DOM operations where possible
        const cellsToReset = gameState.cells.filter(cell => 
            cell.classList.contains("active") && !cell.classList.contains("current")
        );
        
        // Reset cells in batch
        cellsToReset.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
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
        
        // Reset time tracking for game loop
        lastFrameTimeMs = 0;
        delta = 0;
        
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

    // PERFORMANCE IMPROVEMENT: Reduce DOM operations in game over handling
    function handleGameOver() {
        gameState.gameActive = false;
        gameState.lives = 0;
    
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
    
        // Create game over screen - consider creating this once and reusing
        const gameOverDiv = document.createElement("div");
        gameOverDiv.className = "game-over";
        
        // Get values once to avoid repeated DOM queries
        const finalScore = document.getElementById("score").textContent;
        const finalLines = document.getElementById("lines").textContent;
        const finalLevel = document.getElementById("level").textContent;
        
        gameOverDiv.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: <span id="final-score">${finalScore}</span></p>
            <p>Lines Cleared: <span id="final-lines">${finalLines}</span></p>
            <p>Level Reached: <span id="final-level">${finalLevel}</span></p>
            <p>Lives: <span id="final-lives">0</span></p>
            <button id="gameOverRestartBtn">Restart</button>
            <button id="gameOverquitBtn">Quit</button>
        `;
    
        gameBoardElement.appendChild(gameOverDiv);
        
        // Add event listeners after element is in DOM
        document.getElementById("gameOverRestartBtn").addEventListener("click", () => {
            gameOverDiv.remove();
            handleRestart();
        });
    
        document.getElementById("gameOverquitBtn").addEventListener("click", () => {
            gameOverDiv.remove();
            handleQuit();
        });
    }

    // PERFORMANCE IMPROVEMENT: More efficient restart
    function handleRestart() {
        gameState.resetForNewGame();
        gameBoardElement.classList.remove("game-over");
        
        // Batch DOM operations
        gameState.cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });

        // Set score displays
        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";
        
        // Reset cached values
        cachedLines = 0;

        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.textContent = "Pause";
            pauseBtn.style.display = "block";
        }

        updateCells(gameState.cells, false);
        ChangeNextToCurrent();
        
        // Reset time tracking for game loop
        lastFrameTimeMs = 0;
        delta = 0;
        
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
        
        // Reset cached values
        cachedLines = 0;
    
        // Hide pause button and show start overlay
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) pauseBtn.style.display = "none";
    
        const startOverlay = document.getElementById("startOverlay");
        if (startOverlay) startOverlay.style.display = "flex";
    
        // Reset time tracking for game loop
        lastFrameTimeMs = 0;
        delta = 0;
        
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

    // Event listeners - more efficient key event handling
    document.addEventListener("keydown", (event) => {
        if (!gameState.gameActive) return;

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            // Only set to true if currently false to avoid redundant processing
            if (!gameState.keyState[event.key]) {
                gameState.keyState[event.key] = true;
            }
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
