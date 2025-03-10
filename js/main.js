import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { GenerateRandom, renderTeromino, rotateTetrimino, eraseTetrimino, moveDown, moveLeft, moveRight, currentTetrimino } from './tetrominoes.js';

let cells;
let gameBoardElement;
let lastTime = 0;
const dropInterval = 500;
let dropCounter = 0;
let gameActive = false;

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
      
      requestAnimationFrame(gameLoop); // Call gameLoop again for the next frame
    };
    
    requestAnimationFrame(gameLoop); // Start the game loop
  };
  
  initStartButton(startGame);
  
  // Add event listeners
  document.addEventListener("keydown", (event) => {
    if (!gameActive) return; // Ignore keypresses if game is not active
    
    console.log("Key Pressed:", event.key);
    
    if (event.key === "ArrowUp") {
      rotateTetrimino(cells);
    }

    if (event.key === "ArrowLeft") {
        moveLeft(cells)
    }
    if (event.key === "ArrowRight") {
        moveRight(cells)
    }

    // You can add more controls here
  });
  
  // Function to handle game over
  const handleGameOver = () => {
    console.log("Game Over!");
    gameBoardElement.classList.add("game-over");
    // Show game over screen or modal
    document.getElementById("pauseBtn").style.display = "none"; // Hide pause button
    // You could display a game over message here
  };
  
  // Callback functions for restart and quit
  const handleRestart = () => {
    console.log("Game restarted");
    gameBoardElement.classList.remove("started");
    gameBoardElement.classList.remove("game-over");
    
    // Clear the board
    cells.forEach(cell => {
      cell.className = "cell";
      cell.style.backgroundColor = "";
    });
    
    // Reset the game
    GenerateRandom();
    gameActive = true;
    startGame();
  };
  
  const handleQuit = () => {
    console.log("Game quit");
    gameActive = false;
    gameBoardElement.classList.remove("started");
    gameBoardElement.classList.remove("game-over");
    
    // Clear the board
    cells.forEach(cell => {
      cell.className = "cell";
      cell.style.backgroundColor = "";
    });
    
    document.getElementById("startOverlay").style.display = "flex"; // Show start overlay again
    document.getElementById("pauseBtn").style.display = "none"; // Hide pause button
  };
  
  const handleResume = () => {
    console.log("Game resumed");
    gameActive = true;
    requestAnimationFrame(gameLoop); // Resume the game loop
  };
  
  const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit);
});