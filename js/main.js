import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { GenerateRandom, renderTeromino, rotateTetrimino, eraseTetrimino, moveDown } from './tetrominoes.js';

let cells;
let currentTetrimino;
let gameBoardElement;
let lastTime = 0;
const dropInterval = 500;
let dropCounter = 0;

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();
    gameBoardElement = document.getElementById("game-board"); 

   
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length); 

    
    currentTetrimino = GenerateRandom();
    console.log("Initial Tetrimino:", currentTetrimino); 
    // Function to start the game
    const startGame = () => {
        gameBoardElement.classList.add("started"); 
        rotateTetrimino(cells); 
        console.log("Game started");


        const gameLoop = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;
            dropCounter += deltaTime;
    
            if (dropCounter > dropInterval) {
                eraseTetrimino(cells, currentTetrimino);  // Erase current position
                moveDown(cells, currentTetrimino);        // Move down by one step
                renderTeromino(cells, currentTetrimino);  // Render at new position
                dropCounter = 0;  // Reset drop counter
            }
    
            requestAnimationFrame(gameLoop); // Call gameLoop again for the next frame
        };
    
        requestAnimationFrame(gameLoop);  // Start the game loop
    };

   
    initStartButton(startGame);

    // Add event listeners
    document.addEventListener("keydown", (event) => {
        console.log("Key Pressed:", event.key);
    
        if (event.key === "ArrowUp") {
            console.log("Generating New Tetrimino and Rotating...");
            eraseTetrimino(cells, currentTetrimino); 
            currentTetrimino = GenerateRandom(); 
            rotateTetrimino(cells)
        }
    });

    // Callback functions for restart and quit
    const handleRestart = () => {
        console.log("Game restarted");
        gameBoardElement.classList.remove("started");
        eraseTetrimino(cells, currentTetrimino);
        currentTetrimino = GenerateRandom();
        // Additional restart logic can be added here
    };

    const handleQuit = () => {
        console.log("Game quit");
        gameBoardElement.classList.remove("started");
        eraseTetrimino(cells, currentTetrimino);
        document.getElementById("startOverlay").style.display = "flex"; // Show start overlay again
        document.getElementById("pauseBtn").style.display = "none"; // Hide pause button
        // Additional quit logic can be added here
    };

    const handleResume = () => {
        console.log("Game resumed");
        // TO DO Additional resume logic can be added here
    };

    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit);
});