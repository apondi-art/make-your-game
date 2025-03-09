import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';
import { initStartButton } from './start.js';
import { GenerateRandom,renderTeromino, rotateTetrimino,eraseTetrimino,moveDown } from './tetrominoes.js';

// Declare global variables
let cells;
let currentTetrimino;

document.addEventListener("DOMContentLoaded", function () {
    initStartButton();
    const gameBoard = new GameBoard();

    // Select all grid cells once at the beginning
    cells = Array.from(document.querySelectorAll(".cell"));
    console.log("Cells:", cells.length); // Debugging line

    // Initialize the current Tetrimino
    currentTetrimino = GenerateRandom();
    console.log("Initial Tetrimino:", currentTetrimino); // Debugging line

    // Render the initial Tetrimino
    rotateTetrimino(cells);


    // Add event listeners
    document.addEventListener("keydown", (event) => {
        console.log("Key Pressed:", event.key);
    
        if (event.key === "ArrowUp") {
            console.log("Generating New Tetrimino and Rotating...");
            
            eraseTetrimino(cells, currentTetrimino); // ✅ Remove old shape
            currentTetrimino = GenerateRandom(); // ✅ Generate a new Tetrimino
            rotateTetrimino(cells); // ✅ Rotate the new Tetrimino
        }
    });
    // Callback functions for restart and quit
    const handleRestart = () => {
        console.log("Game restarted");
        // TO DO additional restart logic here when implementing game loop
    };

    const handleQuit = () => {
        console.log("Game quit");
        // TO DO Add additional quit logic here when implementing game loop
    };

    const handleResume = () => {
        console.log("Game resume");
        // TO Do add additional resume logic here when implementing game loop
    };

    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit);

});