import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { GenerateRandom, renderTeromino, rotateTetrimino, moveDown, moveRight, moveLeft, currentTetrimino, eraseTetrimino } from './tetrominoes.js';

let cells;
let gameBoardElement;
let lastTime = 0;
const dropInterval = 500;
let dropCounter = 0;
let gameActive = false;
let animationId = null;
let lives = 3; // Initialize lives counter
let score = 0;
let lines = 0;

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    gameBoardElement = document.getElementById("game-board");
    const restartBtn = document.getElementById("restartBtn");
    const quitBtn = document.getElementById("quitBtn");
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length);

    // Initialize UI elements
    document.getElementById("score").textContent = "0";
    document.getElementById("lines").textContent = "0";
    document.getElementById("lives").textContent = lives.toString(); // Set initial lives

    // Initial tetrimino setup
    GenerateRandom();
    console.log("Initial Tetrimino:", currentTetrimino);

    // Function to start the game
    const startGame = () => {
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

            // Check if the tetrimino can't move down anymore
            if (moveResult === false) {
                // Check for game over (top of the board reached)
                if (isGameOver()) {
                    handleLifeLost();
                } else {
                    // Generate a new tetrimino and continue
                    GenerateRandom();
                    renderTeromino(cells);
                }
            }

            dropCounter = 0; // Reset drop counter
        }

        animationId = requestAnimationFrame(gameLoop); // Call gameLoop again for the next frame
    };

    // Function to check if the game is over
    const isGameOver = () => {
        // Check if any block is in the top row
        for (let i = 0; i < 10; i++) {
            const topRowCell = cells[i];
            if (topRowCell.classList.contains('active') && !topRowCell.classList.contains('temp')) {
                return true;
            }
        }
        return false;
    };

    // Function to handle losing a life
    const handleLifeLost = () => {
        lives--; // Decrement lives
        document.getElementById("lives").textContent = lives.toString();
        
        if (lives <= 0) {
            // Game over when no lives left
            gameActive = false;
            handleGameOver();
        } else {
            // Continue with remaining lives
            continuePlaying();
        }
    };

    // Function to continue playing after losing a life
    const continuePlaying = () => {
        // Stop the game temporarily
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        
        // Show a message that a life was lost
        const lifeMessage = document.createElement('div');
        lifeMessage.className = 'life-message';
        lifeMessage.textContent = `Life lost! ${lives} lives remaining`;
        lifeMessage.style.position = 'absolute';
        lifeMessage.style.top = '50%';
        lifeMessage.style.left = '50%';
        lifeMessage.style.transform = 'translate(-50%, -50%)';
        lifeMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        lifeMessage.style.color = 'white';
        lifeMessage.style.padding = '20px';
        lifeMessage.style.borderRadius = '8px';
        lifeMessage.style.zIndex = '100';
        
        gameBoardElement.appendChild(lifeMessage);
        
        // Clear the entire board for a fresh start with this life
        // but maintain the score and lines
        clearBoard();
        
        // Resume after a short delay
        setTimeout(() => {
            gameBoardElement.removeChild(lifeMessage);
            gameActive = true;
            GenerateRandom();
            renderTeromino(cells);
            requestAnimationFrame(gameLoop);
        }, 2000);
    };

    // Function to clear the entire board
    const clearBoard = () => {
        cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });
    };

    initStartButton(startGame);

    // Event listener for controls
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
        gameActive = false;
        gameBoardElement.classList.add("game-over");
        document.getElementById("pauseBtn").style.display = "none"; // Hide pause button
        
        // Show game over message with final score
        const gameOverMessage = document.createElement('div');
        gameOverMessage.className = 'game-over-message';
        gameOverMessage.innerHTML = `GAME OVER<br><span style="font-size: 18px;">Final Score: ${score}</span>`;
        gameOverMessage.style.position = 'absolute';
        gameOverMessage.style.top = '40%';
        gameOverMessage.style.left = '50%';
        gameOverMessage.style.transform = 'translate(-50%, -50%)';
        gameOverMessage.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        gameOverMessage.style.color = 'white';
        gameOverMessage.style.padding = '20px';
        gameOverMessage.style.borderRadius = '8px';
        gameOverMessage.style.zIndex = '100';
        gameOverMessage.style.fontSize = '24px';
        gameOverMessage.style.textAlign = 'center';
        
        gameBoardElement.appendChild(gameOverMessage);
    };

    // Callback for restart
    const handleRestart = () => {
        console.log("Game restarted");
        
        // Remove any game over or life lost messages
        const messages = gameBoardElement.querySelectorAll('.game-over-message, .life-message');
        messages.forEach(msg => gameBoardElement.removeChild(msg));
        
        // Reset game state
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        
        // Reset lives
        lives = 3;
        document.getElementById("lives").textContent = lives.toString();
        
        // Reset game board
        gameBoardElement.classList.remove("game-over");
        clearBoard();
        
        // Reset score and lines
        score = 0;
        lines = 0;
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
        GenerateRandom();
        
        // Create a new PauseMenu instance with fresh event handlers
        const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
        
        // Restart the game
        gameActive = true;
        startGame();
    };

    const handleQuit = () => {
        console.log("Game quit");
    
        // Remove any game over or life lost messages
        const messages = gameBoardElement.querySelectorAll('.game-over-message, .life-message');
        messages.forEach(msg => gameBoardElement.removeChild(msg));
        
        // Stop the game loop
        gameActive = false;
        if (animationId) cancelAnimationFrame(animationId);
    
        // Hide pause menu
        document.getElementById("pauseMenu").style.display = "none";
    
        // Reset game board
        gameBoardElement.classList.remove("started");
        gameBoardElement.classList.remove("game-over");
    
        // Clear all cells
        clearBoard();
    
        // Reset lives
        lives = 3;
        document.getElementById("lives").textContent = lives.toString();
        
        // Reset score and lines
        score = 0;
        lines = 0;
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
            GenerateRandom();
            
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
    quitBtn.addEventListener("click", handleQuit);
    // Create PauseMenu instance
    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
});