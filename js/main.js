import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { renderTeromino, rotateTetrimino, moveTetrimino, currentTetrimino, ChangeNextToCurrent, updateCells } from './tetrominoes.js';

let cells;
let gameBoardElement;
let lastTime = 0;
const width = 10;
let dropInterval = 500; // Variable to change with levels
let dropCounter = 0;
let gameActive = false;
let animationId = null; // Store the animation frame ID

// Timer, level, and lives variables
let gameTime = 180; // 3 minutes in seconds
let timeLeft = gameTime;
let level = 1;
let lives = 3; // Starting with 3 lives
let gameStartTime = 0;
let pauseStartTime = 0;
let totalPausedTime = 0;
let lineThreshold = 5; // Lines needed to clear for level up

// Notification system variables
let notificationQueue = [];
let currentNotification = null;
let notificationTimer = 0;
const NOTIFICATION_DURATION = 1000; // Display time in ms
let notificationElement = null;

// Key state tracking to reduce frame drops
const keyState = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};
let lastKeyProcessed = 0;
const KEY_PROCESS_INTERVAL = 100; // Process keys every 100ms

// Pause menu reference
let pauseMenu = null;

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    gameBoardElement = document.getElementById("game-board");
    const restartBtn = document.getElementById("restartBtn");
    const quitBtn = document.getElementById("quitBtn");
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length);

    // Create notification element once during initialization
    notificationElement = document.createElement("div");
    notificationElement.className = "game-notification";
    notificationElement.style.display = "none";
    gameBoardElement.appendChild(notificationElement);

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

    // Update timer display - now integrated into the game loop
    function updateTimer() {
        if (!gameActive) return;
        
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - gameStartTime - totalPausedTime) / 1000);
        timeLeft = Math.max(0, gameTime - elapsedSeconds);
        
        const timerDisplay = document.getElementById("timer");
        if (timerDisplay) {
            timerDisplay.textContent = formatTime(timeLeft);
        }

        if (timeLeft <= 0) {
            if (lives > 1) {
                // Lose a life and reset the timer
                loseLife();
                // Reset timer by updating the start time
                gameStartTime = currentTime - totalPausedTime;
                if (timerDisplay) {
                    timerDisplay.textContent = formatTime(gameTime);
                }
            } else {
                // Game over when out of lives
                gameActive = false;
                handleGameOver();
            }
        }
    }

    // Function to handle losing a life
    function loseLife() {
        lives--;
        const livesDisplay = document.getElementById("lives");
        if (livesDisplay) {
            livesDisplay.textContent = lives;
        }

        // Queue life lost notification
        queueNotification(`Life Lost! ${lives} remaining`, "life");
    }

    // Add notification to queue
    function queueNotification(message, type) {
        notificationQueue.push({ message, type });
    }

    // Process notifications as part of the game loop
    function processNotifications(deltaTime) {
        // If there's an active notification, update its timer
        if (currentNotification) {
            notificationTimer += deltaTime;
            
            // Apply fade out effect at 75% of duration
            if (notificationTimer > NOTIFICATION_DURATION * 0.75 && 
                !notificationElement.classList.contains("fade-out")) {
                notificationElement.classList.add("fade-out");
            }
            
            // Hide notification when time expires
            if (notificationTimer >= NOTIFICATION_DURATION) {
                notificationElement.style.display = "none";
                currentNotification = null;
                notificationTimer = 0;
                notificationElement.classList.remove("fade-out");
            }
        } 
        // If no active notification and queue has items, show next
        else if (notificationQueue.length > 0) {
            currentNotification = notificationQueue.shift();
            notificationElement.textContent = currentNotification.message;
            
            // Set appropriate class based on message type
            notificationElement.classList.remove("level-up", "life-lost");
            if (currentNotification.type === "level") {
                notificationElement.classList.add("level-up");
            } else {
                notificationElement.classList.add("life-lost");
            }
            
            notificationElement.style.display = "block";
            notificationElement.classList.remove("fade-out");
            notificationTimer = 0;
        }
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

            // Queue level up notification
            queueNotification(`Level Up! ${level}`, "level");
        }
    }

    // Process key states to reduce frame drops
    function processKeyStates(time) {
        // Only process keys at specific intervals
        if (time - lastKeyProcessed < KEY_PROCESS_INTERVAL) return;
        
        if (keyState.ArrowUp) {
            rotateTetrimino(cells);
            // keyState.ArrowUp = false; // Reset after processing
        }
        if (keyState.ArrowLeft) {
            moveTetrimino(cells, -1);
        }
        if (keyState.ArrowRight) {
            moveTetrimino(cells, 1);
        }
        if (keyState.ArrowDown) {
            moveTetrimino(cells, width);
        }
        
        lastKeyProcessed = time;
    }

    // Function to start the game
    const startGame = () => {
        // Only cancel existing animation frame if there is one
        if (animationId !== null) {
         requestAnimationFrame(gameLoop);
            return;
        }
        
        gameActive = true;
        gameBoardElement.classList.add("started");
        renderTeromino(cells);
        console.log("Game started");

        // Reset timer, level, and lives
        gameStartTime = Date.now();
        totalPausedTime = 0;
        pauseStartTime = 0;
        timeLeft = gameTime;
        level = 1;
        lives = 3;
        dropInterval = 500; // Reset drop interval

        // Reset notification queue and state
        notificationQueue = [];
        currentNotification = null;
        notificationTimer = 0;
        notificationElement.style.display = "none";
        notificationElement.classList.remove("fade-out");

        // Reset key states
        Object.keys(keyState).forEach(key => keyState[key] = false);
        lastKeyProcessed = 0;

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

        // Show pause button
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.style.display = "block";
            pauseBtn.textContent = "Pause";
        }

        // Initialize time tracking variables for frame handling
        lastTime = performance.now();
        dropCounter = 0;
        
        // Start the game loop
        animationId = requestAnimationFrame(gameLoop);
    };

    // Game loop function with frame drop handling and optimized key processing
    const gameLoop = (time = 0) => {
        // Exit if game is not active
        if (!gameActive) {
            requestAnimationFrame(gameLoop);
            return;
        }
        // Calculate accurate time delta for smooth animation
        const deltaTime = time - lastTime;
        lastTime = time;
        
        // Cap deltaTime to prevent huge jumps
        const cappedDeltaTime = Math.min(deltaTime, 16);
        dropCounter += cappedDeltaTime;

        // Process key states at controlled intervals
        processKeyStates(time);
        
        // Process notification queue
        processNotifications(cappedDeltaTime);
        
        // Update timer as part of the game loop
        updateTimer();

        if (dropCounter > dropInterval) {
            const moveResult = moveTetrimino(cells, width);

            // Check if the tetrimino can't move down anymore (collision)
            if (moveResult === false) {
                // Check for game over condition
                const isGameOver = checkGameOver();

                if (isGameOver) {
                    if (lives > 1) {
                        // Lose a life and reset the board
                        loseLife();
                        resetBoard();
                        // Game over when out of lives
                        gameActive = false;
                        loseLife();
                        handleGameOver();
                        return; // Exit the game loop
                    }
                }
            }

            dropCounter = 0; // Reset drop counter
        }

        // Check if we should update the level
        updateLevel();

        // Only request a new frame if the game is still active
        if (gameActive) {
            animationId = requestAnimationFrame(gameLoop);
        }
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
        updateCells(cells, false); 
    
        // Generate a new tetrimino
        ChangeNextToCurrent();
        renderTeromino(cells);
    }
    
    // Optimized pause handler
    const handlePause = () => {
        if (!gameActive) return; // Already paused
        
        gameActive = false;
        pauseStartTime = Date.now(); // Record when we paused
        
        // Cancel the animation frame
        // Show pause menu
        document.getElementById("pauseMenu").style.display = "flex";
        
        // Update pause button text
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.textContent = "Resume";
        }
        
        console.log("Game paused");
        if (animationId !== null) {
         requestAnimationFrame(gameLoop);
          return;
        }
        
    };

    // Optimized resume handler
    const handleResume = () => {
        if (gameActive) return; // Already running
        
        // Hide pause menu
        document.getElementById("pauseMenu").style.display = "none";
        
        // Update total paused time
        if (pauseStartTime > 0) {
            totalPausedTime += (Date.now() - pauseStartTime);
            pauseStartTime = 0;
        }
        
        // Reset for smooth animation
        lastTime = performance.now();
        dropCounter = 0;
        
        // Reset key states
        Object.keys(keyState).forEach(key => keyState[key] = false);
        
        // Update pause button text
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.textContent = "Pause";
        }
        
        gameActive = true;
        animationId = requestAnimationFrame(gameLoop);
        console.log("Game resumed");
    };

    // Initialize the pause button
    function initializePauseButton() {
        const pauseBtn = document.getElementById("pauseBtn");
        if (!pauseBtn) return;
        
        // Clean up existing listeners by replacing with a clone
        const newPauseBtn = pauseBtn.cloneNode(true);
        pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
        
        // Set up a single click listener that toggles between pause/resume
        newPauseBtn.addEventListener("click", function() {
            if (gameActive) {
                handlePause();
            } else {
                handleResume();
            }
        });
    }

    // Initialize the start button
    initStartButton(startGame);
    
    // Initialize pause button
    initializePauseButton();

    // Function to handle game over
    function handleGameOver() {
        gameActive = false;
        
        // Cancel animation frame
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // Hide pause button
        const pauseButton = document.getElementById("pauseBtn");
        if (pauseButton) {
            pauseButton.style.display = "none";
        }

        // Remove any existing game over screen
        let existingGameOver = document.querySelector(".game-over");
        if (existingGameOver) existingGameOver.remove();
        
        // Create game over screen
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

        // Add event listeners for game over buttons
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
        
        // Cancel any existing animation frame
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // Reset game board
        gameBoardElement.classList.remove("game-over");
        cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });

        // Reset notification queue and state
        notificationQueue = [];
        currentNotification = null;
        notificationTimer = 0;
        notificationElement.style.display = "none";
        notificationElement.classList.remove("fade-out");

        // Reset key states
        Object.keys(keyState).forEach(key => keyState[key] = false);
        lastKeyProcessed = 0;

        // Reset score, lines, timer, level, and lives
        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";
        level = 1;
        lives = 3;
        dropInterval = 500; // Reset drop interval

        // Hide pause menu
        document.getElementById("pauseMenu").style.display = "none";

        // Reset pause button
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.textContent = "Pause";
            pauseBtn.style.display = "block";
        }

        // Clear the current tetrimino
        updateCells(cells, false);

        // Generate new Tetromino
        ChangeNextToCurrent();

        // Restart the game
        startGame();
    };

    const handleQuit = () => {
        console.log("Game quit");

        gameActive = false;
        
        // Cancel any active animation frame
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        // Reset notification queue and state
        notificationQueue = [];
        currentNotification = null;
        notificationTimer = 0;
        notificationElement.style.display = "none";
        notificationElement.classList.remove("fade-out");

        // Reset key states
        Object.keys(keyState).forEach(key => keyState[key] = false);
        lastKeyProcessed = 0;

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
        level = 1;
        lives = 3;
        dropInterval = 500; // Reset drop interval

        // Reset other game state variables
        dropCounter = 0;
        lastTime = 0;
        gameStartTime = 0;
        totalPausedTime = 0;
        pauseStartTime = 0;

        // Hide pause button
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) {
            pauseBtn.style.display = "none";
        }

        // Show the start overlay again
        const startOverlay = document.getElementById("startOverlay");
        if (startOverlay) {
            startOverlay.style.display = "flex";
        }

        // Create a new start callback
        const freshStartCallback = () => {
            updateCells(cells, false);
            // Generate a new random tetrimino
            ChangeNextToCurrent();
            // Start the game
            startGame();
        };

        // Show the start button/screen again
        initStartButton(freshStartCallback);
    };

    // Set up event listeners for keyboard controls
    document.addEventListener("keydown", (event) => {
        if (!gameActive) return; // Ignore keypresses if game is not active

        // Prevent default action for game keys
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            // Record key state
            keyState[event.key] = true;
        }
        
        // Handle pause with spacebar
        if (event.key === " " || event.key === "Escape") {
            event.preventDefault();
            if (gameActive) {
                handlePause();
            } else {
                // Only resume if the pause menu is visible
                if (document.getElementById("pauseMenu").style.display === "flex") {
                    handleResume();
                }
            }
        }
    });

    // Key up listener to clear key states
    document.addEventListener("keyup", (event) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            keyState[event.key] = false;
        }
    });

    // Lose focus event handler to prevent stuck keys
    window.addEventListener("blur", () => {
        // Reset all key states when window loses focus
        Object.keys(keyState).forEach(key => keyState[key] = false);
        
        // Automatically pause the game when window loses focus
        if (gameActive) {
            handlePause();
        }
    });

    // Initialize the pause menu
    pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
    
    // Set up the restart and quit buttons
    if (restartBtn) {
        restartBtn.addEventListener("click", handleRestart);
    }
    if (quitBtn) {
        quitBtn.addEventListener("click", handleQuit);
    }
});