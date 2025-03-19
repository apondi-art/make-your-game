import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { renderTeromino, hardDrop, rotateTetrimino, moveDown, moveRight, moveLeft, currentTetrimino, ChangeNextToCurrent, eraseTetrimino } from './tetrominoes.js';

let cells;
let gameBoardElement;
let lastTime = 0;
let dropInterval = 500; // Now a variable to change with levels
let dropCounter = 0;
let gameActive = false;
let animationId = null;
   let keyPressed = false;


// Store the animation frame ID

// Timer, level, and lives variables
let gameTime = 180; // 3 minutes in seconds
let timeLeft = gameTime;
let level = 1;
let lives = 3; // Starting with 3 lives
let timerInterval = null;
let lineThreshold = 5; // Lines needed to clear for level up

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    gameBoardElement = document.getElementById("game-board");
    const restartBtn = document.getElementById("restartBtn");
    const quitBtn = document.getElementById("quitBtn");
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length);

    // Add timer, level, and lives displays to the score board
    const scoreBoard = document.querySelector(".score-board");
    if (scoreBoard) {
        // Add timer display
        const timerDiv = document.createElement("div");
        timerDiv.innerHTML = `Time: <span id="timer">${formatTime(timeLeft)}</span>`;
        scoreBoard.appendChild(timerDiv);

        // Add level display
        const levelDiv = document.createElement("div");
        levelDiv.innerHTML = `Level: <span id="level">${level}</span>`;
        scoreBoard.appendChild(levelDiv);

        // Add lives display
        const livesDiv = document.createElement("div");
        livesDiv.innerHTML = `Lives: <span id="lives">${lives}</span>`;
        scoreBoard.appendChild(livesDiv);
    }

    // Initial tetrimino setup
    ChangeNextToCurrent();
    console.log("Initial Tetrimino:", currentTetrimino);

    // Format time as MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Update timer display
    function updateTimer() {
        if (!gameActive) return;

        timeLeft--;
        const timerDisplay = document.getElementById("timer");
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }

        if (timeLeft <= 0) {
            if (lives > 1) {
                // Lose a life and reset the timer
                loseLife();
                timeLeft = gameTime; // Reset timer
                if (timerDisplay) {
                    timerDisplay.textContent = formatTime(timeLeft);
                }
            } else {
                // Game over when out of lives
                gameActive = false;
                clearInterval(timerInterval);
                handleGameOver();
            }
            return;
        }
    }

    // Function to handle losing a life
    function loseLife() {
        lives--;
        const livesDisplay = document.getElementById("lives");
        if (livesDisplay) {
            livesDisplay.textContent = lives;
        }

        // Show life lost notification
        showNotification(`Life Lost! ${lives} remaining`);
    }

    // Update level and game speed
    function updateLevel() {
        // Get current lines cleared
        const linesElement = document.getElementById("lines");
        const currentLines = parseInt(linesElement.textContent) || 0;

        // Check if we've cleared enough lines to level up
        if (currentLines >= level * lineThreshold) {
            level++;
            // Update level display
            const levelDisplay = document.getElementById("level");
            if (levelDisplay) {
                levelDisplay.textContent = level;
            }

            // Increase game speed by reducing drop interval
            dropInterval = Math.max(100, dropInterval - 50); // Min 100ms interval

            // Show level up notification
            showNotification(`Level Up! ${level}`);
        }
    }

    // Show notification (for level up or life lost)
    function showNotification(message) {
        let notification = document.querySelector(".game-notification");
    
        if (!notification) {
            notification = document.createElement("div");
            notification.className = "game-notification";
            gameBoardElement.appendChild(notification);
    
            // ✅ Remove notification from DOM after fade-out
            notification.addEventListener("animationend", () => {
                if (notification.classList.contains("fade-out")) {
                    notification.remove();
                }
            });
        }
    
        requestAnimationFrame(() => {
            notification.textContent = message; // ✅ Prevents unnecessary reflows
            notification.classList.remove("fade-out", "level-up", "life-lost"); // ✅ Reset animations
            notification.classList.add(message.includes("Level") ? "level-up" : "life-lost");
    
            // ✅ Start fade-in animation (CSS handles it)
            notification.classList.add("fade-in");
    
            // ✅ Let CSS handle fade-out after 1 second
            setTimeout(() => {
                notification.classList.remove("fade-in");
                notification.classList.add("fade-out");
            }, 1000);
        });
    }
    

    // Function to start the game
    const startGame = () => {
        PauseMenu;
        gameActive = true;
        gameBoardElement.classList.add("started");
        renderTeromino(cells);
        console.log("Game started");

        // Reset timer, level, and lives
        timeLeft = gameTime;
        level = 1;
        lives = 3;
        dropInterval = 500; // Reset drop interval

        // Update displays
        const timerDisplay = document.getElementById("timer");
        const levelDisplay = document.getElementById("level");
        const livesDisplay = document.getElementById("lives");

        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
        if (livesDisplay) {
            livesDisplay.textContent = lives;
        }

        // Start timer
        clearInterval(timerInterval); // Clear any existing intervals
        timerInterval = setInterval(updateTimer, 1000);

        // Start the game loop
        requestAnimationFrame(gameLoop);
    };



    const gameLoop = (currentTime) => {
        if (!gameActive) return;

        if (!lastTime) lastTime = currentTime; // Ensure lastTime is initialized
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        dropCounter += deltaTime;

        while (dropCounter > dropInterval) { // Ensure we don't miss frames
            if (!moveDown(cells)) {
                if (checkGameOver()) {
                    if (lives > 1) {
                        loseLife();
                        resetBoard();
                    } else {
                        gameActive = false;
                        cancelAnimationFrame(animationId); // ✅ STOP loop properly
                        clearInterval(timerInterval);
                        handleGameOver();
                        return;
                    }
                }
            }
            dropCounter -= dropInterval; // ✅ Prevents frame skipping
        }

        updateLevel();
        animationId = requestAnimationFrame(gameLoop);
    };



    function checkGameOver() {

        const topRowCells = cells.slice(0, 30);
        return topRowCells.some(cell => cell.classList.contains("active") && !cell.classList.contains("current"));
    }

    // Function to reset the board after losing a life
    function resetBoard() {
        cells.forEach(cell => {
            if (cell.classList.contains("active") && !cell.classList.contains("current")) {
                cell.className = "cell";
                cell.style.backgroundColor = "";
            }
        });

        // Reset the current tetrimino
        eraseTetrimino(cells);

        // Generate a new tetrimino
        ChangeNextToCurrent();
        renderTeromino(cells);
    }

    initStartButton(startGame);

    // Event listener for controls
 
    let lastKeyTime = 0;  // Tracks the last time a key was pressed
    const keyCooldown = 100; // Minimum time (in ms) between key presses
    
    document.addEventListener("keydown", (event) => {
        if (!gameActive) return;
    
        const currentTime = performance.now();
        if (currentTime - lastKeyTime < keyCooldown) return; // Enforce cooldown
    
        lastKeyTime = currentTime;  // Update last press time
    
        requestAnimationFrame(() => {
            if (event.key === "ArrowUp") rotateTetrimino(cells);
            if (event.key === "ArrowLeft") moveLeft(cells);
            if (event.key === "ArrowRight") moveRight(cells);
            if (event.key === "ArrowDown") hardDrop(cells,  handleGameOver);
        });
    });






    // Function to handle game over
    function handleGameOver() {
        gameActive = false;
        clearInterval(timerInterval);
        cancelAnimationFrame(animationId);

        const pauseButton = document.getElementById("pauseBtn");
        if (pauseButton) {
            pauseButton.style.display = "none";
        }

        let existingGameOver = document.querySelector(".game-over");
        if (existingGameOver) existingGameOver.remove();
        document.getElementById('pauseBtn').style.displa = "none"
        const gameOverDiv = document.createElement("div");
        gameOverDiv.className = "game-over";
        gameOverDiv.innerHTML = `
            <h2>Game Over</h2>
            <p>Score: <span id="final-score">${document.getElementById("score").textContent}</span></p>
            <p>Lines Cleared: <span id="final-lines">${document.getElementById("lines").textContent}</span></p>
            <p>Level Reached: <span id="final-level">${document.getElementById("level").textContent}</span></p>
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

    // Callback for restart
    const handleRestart = () => {
        console.log("Game restarted");

        // Reset game state
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        clearInterval(timerInterval); // Clear timer interval

        // Reset game board
        gameBoardElement.classList.remove("game-over");
        cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });

        // Reset score, lines, timer, level, and lives
        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";
        timeLeft = gameTime;
        level = 1;
        lives = 3;
        dropInterval = 500; // Reset drop interval

        // Update displays
        const timerDisplay = document.getElementById("timer");
        const levelDisplay = document.getElementById("level");
        const livesDisplay = document.getElementById("lives");

        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
        if (livesDisplay) {
            livesDisplay.textContent = lives;
        }

        // Hide pause menu
        document.getElementById("pauseMenu").style.display = "none";

        // Get and reset the pause button - clean up event listeners
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            const newPauseBtn = pauseBtn.cloneNode(true);
            pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
            newPauseBtn.textContent = "Pause";
            newPauseBtn.style.display = "block";
        }

        // Clear the current tetrimino
        eraseTetrimino(cells);

        // Generate new Tetromino
        ChangeNextToCurrent();

        // Create a new PauseMenu instance with fresh event handlers
        const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);

        // Restart the game
        gameActive = true;
        startGame();
    };

    const handleQuit = () => {
        console.log("Game quit");


        // const gameOverModal = document.getElementById("game-over-modal");
        // if (gameOverModal) {
        //     gameOverModal.style.display = "none";  
        // }

        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        clearInterval(timerInterval);

        // Hide pause menu
        document.getElementById("pauseMenu").style.display = "none";

        // Reset game board
        gameBoardElement.classList.remove("started");
        gameBoardElement.classList.remove("game-over");

        // Clear all cells
        cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });

        // Reset score, lines, timer, level, and lives
        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";
        timeLeft = gameTime;
        level = 1;
        lives = 3;
        dropInterval = 500; // Reset drop interval

        // Reset other game state variables
        dropCounter = 0;
        lastTime = 0;

        // Get and reset the pause button
        const pauseBtn = document.getElementById("pauseBtn");

        // Clean up any existing event listeners by cloning and replacing the button
        if (pauseBtn) {
            const newPauseBtn = pauseBtn.cloneNode(true);
            pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
            newPauseBtn.style.display = "none"; // Hide until game starts again
            newPauseBtn.textContent = "Pause";
        }

        // Show the start overlay again
        const startOverlay = document.getElementById("startOverlay");
        startOverlay.style.display = "flex"; // Make sure it's visible

        // Create a new start callback that generates a fresh tetrimino before starting
        const freshStartCallback = () => {
            eraseTetrimino(cells);
            // Generate a new random tetrimino to start with
            ChangeNextToCurrent();

            // Reinitialize the pause menu with the new game state
            const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);

            // Start the game with fresh state
            startGame();
        };

        // Show the start button/screen again
        initStartButton(freshStartCallback);
    };

    const handlePause = () => {
        gameActive = false;  // Stop the game loop
        if (animationId) cancelAnimationFrame(animationId);
        clearInterval(timerInterval); // Pause the timer
        console.log("Game paused");
    };

    const handleResume = () => {
        gameActive = true;  // Resume the game loop
        requestAnimationFrame(gameLoop);  // Start frame generation again
        timerInterval = setInterval(updateTimer, 1000); // Resume the timer
        console.log("Game resumed");
    };

    restartBtn.addEventListener("click", handleRestart);
    quitBtn.addEventListener("click", handleQuit);
    // Create PauseMenu instance
    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
});