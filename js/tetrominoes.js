import { Score } from './score.js';

const width = 10;

const TETRIMINOES = {
    I: { shape: [[1, width + 1, width * 2 + 1, width * 3 + 1], [width, width + 1, width + 2, width + 3]], color: "cyan" },
    J: { shape: [[1, 2, 2 + width, 2 + width * 2], [width, width + 1, width + 2, 2], [0, width, width * 2, 1 + width * 2], [width, width + 1, width + 2, width * 2]], color: "blue" },
    L: { shape: [[0, 1, 1 + width, 1 + width * 2], [width, width + 1, width + 2, 2], [1, width + 1, width * 2, width * 2 + 1], [width, width + 1, width + 2, 0]], color: "orange" },
    O: { shape: [[0, 1, width, width + 1]], color: "yellow" },
    S: { shape: [[1, 2, width, width + 1], [0, width, width + 1, width * 2 + 1]], color: "#65FE08" },
    Z: { shape: [[0, 1, width + 1, width + 2], [1, width, width + 1, width * 2]], color: "red" },
    T: { shape: [[1, width, width + 1, width + 2], [1, width + 1, width + 2, width * 2 + 1], [1, width, width + 1, width * 2 + 1], [1, width, width + 1, width * 2 + 1]], color: "#CB00F5" }
};


export let currentTetrimino;
export let nextTetri = GenerateRandom()

export function GenerateRandom() {
    const keys = Object.keys(TETRIMINOES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    return {
        shape: TETRIMINOES[randomKey].shape,
        name: randomKey,
        color: TETRIMINOES[randomKey].color,
        rotation: 0,
        position: 4
    };

}

export function ChangeNextToCurrent() {
    currentTetrimino = nextTetri;
    nextTetri = GenerateRandom()
    updatePreview(nextTetri)
}

export function updatePreview(nextTetri) {
    const container = document.getElementById("previewContainer")
    const nextpiece = document.getElementById("nextPiece");

    // 🔥 Clear old preview first
    nextpiece.innerHTML = "";

    // 🆕 Create 16 new divs for 4x4 preview grid
    for (let i = 0; i < 16; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        nextpiece.appendChild(cell);
    }
    container.appendChild(nextpiece)

    const previewCells = nextpiece.children;

    // 📌 Get the current rotation of the Tetromino
    const shape = nextTetri.shape[nextTetri.rotation];

    // 🏗️ Normalize the shape for a 4x4 preview grid
    shape.forEach(index => {
        const normalizedPos = (index % 10) + (Math.floor(index / 10) * 4); // Convert from 10x10 to 4x4
        if (previewCells[normalizedPos]) {
            previewCells[normalizedPos].style.backgroundColor = nextTetri.color;
        }
    });
}



export function eraseTetrimino(cells) {
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
        const cell = cells[currentTetrimino.position + index];
        if (cell) {
            cell.classList.remove("active");
            cell.style.backgroundColor = "";
        }
    });
}

export function renderTeromino(cells) {
    eraseTetrimino(cells);
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
        const cell = cells[currentTetrimino.position + index];
        if (cell) {
            cell.classList.add("active");
            cell.style.backgroundColor = currentTetrimino.color;
        }
    });
}

export function rotateTetrimino(cells) {
    if (canRotate(cells)) {
        eraseTetrimino(cells);
        if (currentTetrimino.shape.length > 1) {
            currentTetrimino.rotation = (currentTetrimino.rotation + 1) % currentTetrimino.shape.length;
        }
        renderTeromino(cells);
    } else {

        moveDown(cells);
    }
}



export function moveDown(cells) {
    if (canMoveDown(cells)) {
        eraseTetrimino(cells);
        currentTetrimino.position += 10;
        renderTeromino(cells);
        return true;
    } else {
        currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
            const pos = currentTetrimino.position + index;
            if (cells[pos]) {
                cells[pos].classList.add("occupied");
                cells[pos].style.backgroundColor = currentTetrimino.color;
            }
        });
        clearFullRows(cells);
        if (!canPlaceNewTetrimino(cells)) return false;
        ChangeNextToCurrent();
        renderTeromino(cells);
        return true;
    }
}

export function moveRight(cells) {
    if (canMoveRight(cells)) {
        eraseTetrimino(cells);
        console.log(currentTetrimino.position);
        currentTetrimino.position += 1; // Move right by one step
        renderTeromino(cells);
        return true;
    } else {
        moveDown(cells)
        return true;
    }
}



export function moveLeft(cells) {
    if (canMoveLeft(cells)) {
        eraseTetrimino(cells);
        console.log(currentTetrimino.position);
        currentTetrimino.position -= 1; // Move right by one step
        renderTeromino(cells);
        return true;
    } else {
        moveDown(cells)
        return true;
    }
}


function canRotate(cells) {
    const gridWidth = 10;
    const nextRotation = (currentTetrimino.rotation + 1) % currentTetrimino.shape.length;
    const nextShape = currentTetrimino.shape[nextRotation];

    return nextShape.every(index => {
        const newPosition = currentTetrimino.position + index;

        // Check if position is valid (within grid bounds)
        const currentRow = Math.floor(currentTetrimino.position / gridWidth);
        const currentCol = currentTetrimino.position % gridWidth;
        const relativeRow = Math.floor(index / gridWidth);
        const relativeCol = index % gridWidth;
        const absoluteRow = currentRow + relativeRow;
        const absoluteCol = currentCol + relativeCol;

        // Check grid boundaries
        if (absoluteRow < 0 || absoluteRow >= cells.length / gridWidth ||
            absoluteCol < 0 || absoluteCol >= gridWidth) {
            return false;
        }

        // Check collision with other pieces
        if (newPosition >= cells.length ||
            cells[newPosition]?.classList.contains("occupied")) {
            return false;
        }

        return true;
    });
}


function canMoveLeft(cells) {
    const gridWidth = 10;
    return currentTetrimino.shape[currentTetrimino.rotation].every(index => {
        const currentPos = currentTetrimino.position + index;
        const currentColumn = currentPos % gridWidth;
        const newPosition = currentPos - 1;

        return (
            currentColumn > 0 &&  // Ensure it doesn't go past right edge
            newPosition < cells.length &&
            !cells[newPosition]?.classList.contains("occupied")
        );
    });
}


function canMoveRight(cells) {
    const gridWidth = 10;
    return currentTetrimino.shape[currentTetrimino.rotation].every(index => {
        const currentPos = currentTetrimino.position + index;
        const currentColumn = currentPos % gridWidth;
        const newPosition = currentPos + 1;

        return (
            currentColumn < gridWidth - 1 &&  // Ensure it doesn't go past right edge
            newPosition < cells.length &&
            !cells[newPosition]?.classList.contains("occupied")
        );
    });
}



function canMoveDown(cells) {
    const gridWidth = 10;
    return currentTetrimino.shape[currentTetrimino.rotation].every(index => {
        const newPosition = currentTetrimino.position + index + gridWidth; // Move down one row
        return (
            newPosition < cells.length &&
            !cells[newPosition]?.classList.contains("occupied")
        );
    });
}

function canPlaceNewTetrimino(cells) {
    const spawnPosition = 4;
    const keys = Object.keys(TETRIMINOES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const shape = TETRIMINOES[randomKey].shape[0];
    return shape.every(index => {
        const position = spawnPosition + index;
        return (
            position < cells.length &&
            !cells[position]?.classList.contains("occupied")
        );
    });
}





function clearFullRows(cells) {
    const rows = cells.length / 10;
    let linesCleared = 0;

    for (let row = rows - 1; row >= 0; row--) {
        const start = row * 10;
        const end = start + 10;
        const isFull = cells.slice(start, end).every(cell => cell.classList.contains("occupied"));

        if (isFull) {
            linesCleared++; // Increment the count of cleared lines

            // Shift down rows above the cleared row
            for (let i = start - 1; i >= 0; i--) {
                cells[i + 10].className = cells[i].className;
                cells[i + 10].style.backgroundColor = cells[i].style.backgroundColor;
            }

            // Clear the top row
            for (let i = 0; i < 10; i++) {
                cells[i].className = "cell";
                cells[i].style.backgroundColor = "";
            }

            row++; // Recheck the same row after clearing
        }
    }

    // Update score and lines cleared if any rows were removed
    if (linesCleared > 0) {
        Score.addScore(linesCleared);
    }
}


export default TETRIMINOES;
