export class GameBoard {
    constructor() {
        this.board = document.getElementById("game-board");
        this.cells = [];
        this.initBoard();
    }

    initBoard() {
        for (let i = 0; i < 200; i++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            this.board.appendChild(cell);
            this.cells.push(cell);
        }
    }

    resetBoard() {
        this.cells.forEach(cell => cell.style.backgroundColor = "#44475a");
    }
}