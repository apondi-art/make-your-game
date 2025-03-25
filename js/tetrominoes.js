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

    //Clear old preview first
    nextpiece.innerHTML = "";

    // Create 16 new divs for 4x4 preview grid
    for (let i = 0; i < 16; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        nextpiece.appendChild(cell);
    }
    container.appendChild(nextpiece)

    const previewCells = nextpiece.children;

    //  Get the current rotation of the Tetromino
    const shape = nextTetri.shape[nextTetri.rotation];

    // Normalize the shape for a 4x4 preview grid
    shape.forEach(index => {
        const normalizedPos = (index % 10) + (Math.floor(index / 10) * 4); // Convert from 10x10 to 4x4
        if (previewCells[normalizedPos]) {
            previewCells[normalizedPos].style.backgroundColor = nextTetri.color;
        }
    });
}


export function updateCells(cells, add = true) {
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
        const cell = cells[currentTetrimino.position + index];
        if (cell) {
            if (add) {
                cell.classList.add("active");
                cell.style.backgroundColor = currentTetrimino.color;
            } else {
                cell.classList.remove("active");
                cell.style.backgroundColor = "";
            }
        }
    });
}


export function renderTeromino(cells) {
    updateCells(cells, false); // Erase previous position
    updateCells(cells, true); // Render new position
}

export function rotateTetrimino(cells) {
    const nextRotation = (currentTetrimino.rotation + 1) % currentTetrimino.shape.length;
    let newShape = currentTetrimino.shape[nextRotation];

    // Check if rotating would move part of the tetromino out of bounds
    for (let index of newShape) {
        let newPos = currentTetrimino.position + index;
        
        // Check if position is out of bounds
        if (newPos < 0 || newPos >= cells.length) return;
        
        // Calculate current column and new column
        let currentCol = currentTetrimino.position % width;
        let blockCol = index % width;
        // let absoluteCol = (currentCol + blockCol) % width;
        
        // Detect wrap-around by checking if the absolute column makes sense
        // This is the key fix - checking if rotation would cause wrap-around
        if (blockCol + currentCol >= width || blockCol + currentCol < 0) return;
        
        // Prevent rotation if new position is occupied
        if (cells[newPos]?.classList.contains("occupied")) return;
    }

    // If it's valid, apply rotation
    updateCells(cells, false);
    currentTetrimino.rotation = nextRotation;
    renderTeromino(cells);
}




function lockTetrimino(cells) {
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
        const pos = currentTetrimino.position + index;
        if (cells[pos]) {
            cells[pos].classList.add("occupied");
            cells[pos].style.backgroundColor = currentTetrimino.color;
        }
    });
    clearFullRows(cells);
    if (canPlaceNewTetrimino(cells)) {
        ChangeNextToCurrent();
        renderTeromino(cells);
    }
}


export function moveTetrimino(cells, offset) {
    if (canMove(cells, offset)) {
        updateCells(cells, false);  // Efficient clearing  
        currentTetrimino.position += offset;
        renderTeromino(cells);
        return true;  // Move was successful
    } else if (offset === width) {
        if (!canMove(cells, 0)) {
            return false; 
        }
        lockTetrimino(cells);
        return true
    }
}


export function hardDrop(cells) {
    let dropDistance = 0;
    
    // Find the lowest available position
    while (canMove(cells, (dropDistance + 1) * width)) {
        dropDistance++;
    }

    // If we can drop, update position directly
    if (dropDistance > 0) {
        updateCells(cells, false); // Clear old position
        currentTetrimino.position += dropDistance * width;
        renderTeromino(cells);
    }

    // Lock immediately
    lockTetrimino(cells);
}



function clearFullRows(cells) {
    const width = 10;
    let rowsCleared = 0;
    
    for (let row = 19; row >= 0; row--) { // Start from the bottom
      let start = row * width;
      let end = start + width;
      let isFull = [...cells].slice(start, end).every(cell => cell.classList.contains("occupied"));
      
      if (isFull) {
        rowsCleared++;
        
        // Move all rows above down by one
        for (let r = row; r > 0; r--) {
          for (let col = 0; col < width; col++) {
            let above = (r - 1) * width + col;
            let below = r * width + col;
            // Copy row above into current row
            cells[below].className = cells[above].className;
            cells[below].style.backgroundColor = cells[above].style.backgroundColor;
          }
        }
        
        // Now ONLY clear the top row (row 0)
        for (let col = 0; col < width; col++) {
          cells[col].classList.remove("occupied");
          cells[col].classList.remove("active");
          cells[col].style.backgroundColor = "";
        }
        
        row++; // Recheck same row index since everything shifted down
      }
    }
    
    if (rowsCleared > 0) {
      Score.addScore(rowsCleared);
    }
  }


  function canMove(cells, offset = 0, shape = currentTetrimino.shape[currentTetrimino.rotation]) {
    return shape.every(index => {
        let newPos = currentTetrimino.position + index + offset;

        if (newPos < 0 || newPos >= cells.length) return false;

        // Check if the move crosses row boundaries incorrectly
        const oldRow = Math.floor((currentTetrimino.position + index) / width);
        const newRow = Math.floor(newPos / width);
        if (oldRow !== newRow && (offset === -1 || offset === 1)) return false;

        return !cells[newPos]?.classList.contains("occupied");
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



export default TETRIMINOES;
