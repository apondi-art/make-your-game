const width = 10;

const TETRIMINOES = {
  I: { shape: [[1, width + 1, width * 2 + 1, width * 3 + 1], [width, width + 1, width + 2, width + 3]], color: "cyan" },
  J: { shape: [[1, 2, 2 + width, 2 + width * 2], [width, width + 1, width + 2, 2], [0, width, width * 2, 1 + width * 2], [width, width + 1, width + 2, width * 2]], color: "blue" },
  L: { shape: [[0, 1, 1 + width, 1 + width * 2], [width, width + 1, width + 2, 2], [1, width + 1, width * 2, width*2 + 1],  [width, width + 1, width + 2, 0]], color: "orange" },
  O: { shape: [[0, 1, width, width + 1]], color: "yellow" },
  S: { shape: [[1, 2, width, width + 1], [0, width, width + 1, width * 2 + 1]], color: "green" },
  Z: { shape: [[0, 1, width + 1, width + 2], [1, width, width + 1, width * 2]], color: "red" },
  T: { shape: [[1, width, width + 1, width + 2], [1, width + 1, width + 2, width * 2 + 1], [width, width + 1, width + 2, width * 2 + 1], [1, width, width + 1, width * 2]], color: "purple" }
};


export let currentTetrimino;

export function GenerateRandom() {
    const keys = Object.keys(TETRIMINOES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    currentTetrimino = { 
        shape: TETRIMINOES[randomKey].shape,
        name: randomKey,
        color: TETRIMINOES[randomKey].color,
        rotation: 0,
        position: 4
    };
    
    return currentTetrimino;
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
    eraseTetrimino(cells);
    if (currentTetrimino.shape.length > 1) {
        currentTetrimino.rotation = (currentTetrimino.rotation + 1) % currentTetrimino.shape.length;
    }
    renderTeromino(cells);
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
        GenerateRandom();
        renderTeromino(cells);
        return true;
    }
}

export function moveLeft(cells){
  eraseTetrimino(cells)
  currentTetrimino.position += 1;
  renderTeromino(cells);
  return true;
}

export function moveRight(cells){
  eraseTetrimino(cells)
  currentTetrimino.position -= 1;
  renderTeromino(cells);
  return true;
}


function canMoveDown(cells) {
    return currentTetrimino.shape[currentTetrimino.rotation].every(index => {
        const newPosition = currentTetrimino.position + index + 10;
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
    for (let row = rows - 1; row >= 0; row--) {
        const start = row * 10;
        const end = start + 10;
        const isFull = cells.slice(start, end).every(cell => cell.classList.contains("occupied"));
        if (isFull) {
            for (let i = start - 1; i >= 0; i--) {
                cells[i + 10].className = cells[i].className;
                cells[i + 10].style.backgroundColor = cells[i].style.backgroundColor;
            }
            for (let i = 0; i < 10; i++) {
                cells[i].className = "cell";
                cells[i].style.backgroundColor = "";
            }
            row++;
        }
    }
}

export default TETRIMINOES;
