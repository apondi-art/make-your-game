import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { renderTeromino, rotateTetrimino, moveDown, moveRight, moveLeft, currentTetrimino, ChangeNextToCurrent,eraseTetrimino } from './tetrominoes.js';

let cells;
let gameBoardElement;
let lastTime = 0;
const dropInterval = 500;
let dropCounter = 0;
let gameActive = false;
let animationId = null;
// Store the animation frame ID

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    gameBoardElement = document.getElementById("game-board");
    const restartBtn = document.getElementById("restartBtn");
    const quitBtn = document.getElementById("quitBtn");
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length);

    // Initial tetrimino setup
    ChangeNextToCurrent();
    console.log("Initial Tetrimino:", currentTetrimino);

    // Function to start the game
    const startGame = () => {
        PauseMenu
        gameActive = true;
        gameBoardElement.classList.add("started");
        renderTeromino(cells);
        console.log("Game started");

        // Start the game loop
        requestAnimationFrame(gameLoop);
    };

    // Game loop function
    const gameLoop = (time = 0) => {
        if (!gameActive) return; // Stop the loop if game is not active

        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {
            const moveResult = moveDown(cells);

            // Check if the game is over
            if (moveResult === false) {
                gameActive = false;
                handleGameOver();
                return;
            }

            dropCounter = 0; // Reset drop counter
        }

        animationId = requestAnimationFrame(gameLoop); // Call gameLoop again for the next frame
    };

    initStartButton(startGame);

    // Event listener for controlsGenera
    document.addEventListener("keydown", (event) => {
        if (!gameActive) return; // Ignore keypresses if game is not active

        console.log("Key Pressed:", event.key);

        if (event.key === "ArrowUp") {
            rotateTetrimino(cells);
        }
        if (event.key === "ArrowLeft") {
            moveLeft(cells);
        }
        if (event.key === "ArrowRight") {
            moveRight(cells);
        }

        if (event.key === "ArrowDown") {
            moveDown(cells)
        }
    });

    // Function to handle game over
    const handleGameOver = () => {
        console.log("Game Over!");
        gameBoardElement.classList.add("game-over");
        document.getElementById("pauseBtn").style.display = "none"; // Hide pause button
    };

// Callback for restart
const handleRestart = () => {
    console.log("Game restarted");
    
    // Reset game state
    gameActive = false;
    if (animationId) cancelAnimationFrame(animationId);
    
    // Reset game board
    gameBoardElement.classList.remove("game-over");
    cells.forEach(cell => {
        cell.className = "cell";
        cell.style.backgroundColor = "";
    });
    
    // Reset score and lines
    document.getElementById("score").textContent = "0";
    document.getElementById("lines").textContent = "0";
    
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
    
        // Stop the game loop
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
    
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
    
        // Reset score and lines
        document.getElementById("score").textContent = "0";
        document.getElementById("lines").textContent = "0";
    
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
        console.log("Game paused");
    };

    const handleResume = () => {
        gameActive = true;  // Resume the game loop
        requestAnimationFrame(gameLoop);  // Start frame generation again
        console.log("Game resumed");
    };

    restartBtn.addEventListener("click", handleRestart);
    quitBtn.addEventListener("click", handleQuit)
    // Create PauseMenu instance
    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
});
