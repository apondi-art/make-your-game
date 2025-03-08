document.addEventListener("DOMContentLoaded", function () {
    const board = document.getElementById("game-board");
    let cells = [];

    for (let i = 0; i < 200; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        board.appendChild(cell);
        cells.push(cell);
    }

    console.log(board.classList); // Check if "board" class is still applied
});
