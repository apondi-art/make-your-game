import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { GenerateRandom, renderTeromino, rotateTetrimino, moveDown, moveRight, moveLeft, currentTetrimino } from './tetrominoes.js';

let cells;
let gameBoardElement;
let lastTime = 0;
const dropInterval = 500;
let dropCounter = 0;
let gameActive = false;
let animationId = null;  // Store the animation frame ID

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    gameBoardElement = document.getElementById("game-board");
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length);
  
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
        gameBoardElement.classList.remove("started");
        gameBoardElement.classList.remove("game-over");
        
        cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });
        
        GenerateRandom();
        gameActive = true;
        startGame();
    };
  
    // Callback for quit
    const handleQuit = () => {
        console.log("Game quit");
        gameActive = false;
        gameBoardElement.classList.remove("started");
        gameBoardElement.classList.remove("game-over");
        
        cells.forEach(cell => {
            cell.className = "cell";
            cell.style.backgroundColor = "";
        });
        
        document.getElementById("startOverlay").style.display = "flex";
        document.getElementById("pauseBtn").style.display = "none";
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
  
    // Create PauseMenu instance
    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit, handlePause, handleResume);
});
