const width = 10; // Grid width (10 columns)

// Store all Tetrimino shapes in a single object
const TETRIMINOES = {
    I: { shape: [[1, width + 1, width * 2 + 1, width * 3 + 1], [width, width + 1, width + 2, width + 3]], color: "cyan" },
    J: { shape: [[1, 2, 2 + width, 2 + width * 2], [width, width + 1, width + 2, 2], 
                 [0, width, width * 2, 1 + width * 2], [width, width + 1, width + 2, width * 2]], color: "blue" },
    L: { shape: [[0, 1, 1 + width, 1 + width * 2], [width, width + 1, width + 2, 2 + width], 
                 [1, width + 1, width * 2 + 1, width * 2], [width, width + 1, width + 2, 0]], color: "orange" },
    O: { shape: [[0, 1, width, width + 1]], color: "yellow" }, // Square (doesn't rotate)
    S: { shape: [[1, 2, width, width + 1], [0, width, width + 1, width * 2 + 1]], color: "green" },
    Z: { shape: [[0, 1, width + 1, width + 2], [1, width, width + 1, width * 2]], color: "red" },
    T: { shape: [[1, width, width + 1, width + 2], [1, width + 1, width + 2, width * 2 + 1], 
                 [width, width + 1, width + 2, width * 2 + 1], [1, width, width + 1, width * 2]], color: "purple" }
};

// Function to generate a random Tetrimino
export function GenerateRandom() {
    const keys = Object.keys(TETRIMINOES);  // Get Tetrimino names ["I", "J", "L", "O", "S", "Z", "T"]
    const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Select a random one

    return { 
        shape: TETRIMINOES[randomKey].shape, // Get the shape data
        name: randomKey, // Store the name of the Tetrimino
        color: TETRIMINOES[randomKey].color, // Assign the color
        rotation: 0, // Start at the default rotation
        position: 4 // Spawn near the center of the grid
    };
}

let currentTetrimino = GenerateRandom(); // Store the currently active Tetrimino

// Function to erase the Tetrimino from the grid before redrawing
export function eraseTetrimino(cells) {
    console.log("Erasing Tetrimino", currentTetrimino.shape); // Debugging line
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
      cells[currentTetrimino.position + index]?.classList.remove("active", currentTetrimino.color);
    });
}

export function renderTeromino(cells) {
    console.log("Rendering Tetrimino"); // Debugging line
    eraseTetrimino(cells); // Clear previous position
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
      if (cells[currentTetrimino.position + index]) {
        cells[currentTetrimino.position + index].classList.add("active", currentTetrimino.color);
      }
    });
}

export function rotateTetrimino(cells) {
    console.log("Rotating Tetrimino:", currentTetrimino.name); // ✅ Debugging

    eraseTetrimino(cells); // ✅ Remove old shape

    // ✅ Check if the Tetrimino has multiple rotations
    if (currentTetrimino.shape.length > 1) {
        currentTetrimino.rotation = (currentTetrimino.rotation + 1) % currentTetrimino.shape.length; // ✅ Rotate safely
    } else {
        console.log("❌ This Tetrimino does not rotate:", currentTetrimino.name); // Debugging
    }

    renderTeromino(cells); // ✅ Draw the rotated shape
}

export function moveDown(cells) {
  console.log("Moving Tetrimino Down"); // Debugging line
  eraseTetrimino(cells); // Remove old position
  currentTetrimino.position += 10; // Move down
  renderTeromino(cells); // Redraw
}

// Export the TETRIMINOES object 
export default TETRIMINOES;