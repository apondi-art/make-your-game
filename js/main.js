import { GameBoard } from './gameBoard.js';
import { PauseMenu } from './pauseMenu.js';

document.addEventListener("DOMContentLoaded", function () {
    const gameBoard = new GameBoard();

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
    }
    const pauseMenu = new PauseMenu(gameBoard, handleRestart, handleQuit);

    console.log(gameBoard.board.classList);
});