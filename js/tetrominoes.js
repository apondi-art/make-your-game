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

// Variable for the current Tetrimino - exported for access from main.js
export let currentTetrimino;

// Function to generate a random Tetrimino
export function GenerateRandom() {
    const keys = Object.keys(TETRIMINOES);  // Get Tetrimino names ["I", "J", "L", "O", "S", "Z", "T"]
    const randomKey = keys[Math.floor(Math.random() * keys.length)]; // Select a random one

    currentTetrimino = { 
        shape: TETRIMINOES[randomKey].shape, // Get the shape data
        name: randomKey, // Store the name of the Tetrimino
        color: TETRIMINOES[randomKey].color, // Assign the color
        rotation: 0, // Start at the default rotation
        position: 4 // Spawn near the center of the grid
    };
    
    return currentTetrimino;
}

// Function to erase the Tetrimino from the grid before redrawing
export function eraseTetrimino(cells) {
    console.log("Erasing Tetrimino", currentTetrimino.shape); // Debugging line
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
      const cell = cells[currentTetrimino.position + index];
      if (cell) {
          cell.classList.remove("active");
          cell.style.backgroundColor = "";  // Clear the background color style
      }      
    });
}

// Keep original function name with typo for compatibility
export function renderTeromino(cells) {
    console.log("Rendering Tetrimino"); // Debugging line
    eraseTetrimino(cells); // Clear previous position
    currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
      if (cells[currentTetrimino.position + index]) {
        const cell = cells[currentTetrimino.position + index];
        if (cell) {
            cell.classList.add("active");
            cell.style.backgroundColor = currentTetrimino.color;
        }
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

    renderTeromino(cells); // ✅ Call with original typo
}

export function moveDown(cells) {
  console.log("Moving Tetrimino Down"); // Debugging line

  if (canMoveDown(cells)) {
      eraseTetrimino(cells);            // Remove old position
      currentTetrimino.position += 10;  // Move down
      renderTeromino(cells);            // Call with original typo
      return true; // Indicate successful movement
  } else {
      // 🟢 Lock the Tetrimino in place if it can't move down
      currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
          const pos = currentTetrimino.position + index;
          if (cells[pos]) {
              cells[pos].classList.add("occupied");
              cells[pos].style.backgroundColor = currentTetrimino.color; // Use backgroundColor instead
          }
      });

      // 🟢 Check for full rows to clear them
      clearFullRows(cells);
      
      // Check if we have space for a new Tetrimino
      if (!canPlaceNewTetrimino(cells)) {
          console.log("Game Over!");
          return false; // Indicate game over
      }
      
      // 🟢 Generate a new Tetrimino
      GenerateRandom(); // Create a new Tetrimino and update currentTetrimino

      renderTeromino(cells); // Call with original typo
      return true; // Indicate successful spawn of new Tetrimino
  }
}

function canMoveDown(cells) {
  return currentTetrimino.shape[currentTetrimino.rotation].every(index => {
      const newPosition = currentTetrimino.position + index + 10; // Move one row down

      // Check if new position is within grid bounds and not occupied
      return (
          newPosition < cells.length &&                    // 🟢 Within grid
          !cells[newPosition]?.classList.contains("occupied") // 🟢 Not occupied
      );
  });
}

// New function to check if a new Tetrimino can be placed
function canPlaceNewTetrimino(cells) {
  // Check if the spawn area is clear
  const spawnPosition = 4; // The default spawn position
  
  // Generate a new Tetrimino without updating the current one
  const keys = Object.keys(TETRIMINOES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const shape = TETRIMINOES[randomKey].shape[0]; // Use the default rotation
  
  // Check if all cells in the shape would be free
  return shape.every(index => {
      const position = spawnPosition + index;
      return (
          position < cells.length &&
          !cells[position]?.classList.contains("occupied")
      );
  });
}

function clearFullRows(cells) {
  const rows = cells.length / 10; // Assuming grid width is 10
  let clearedRows = 0; // Track how many rows were cleared

  for (let row = rows - 1; row >= 0; row--) { // Start from the bottom row
      const start = row * 10;
      const end = start + 10;

      // Check if the row is full
      const isFull = cells.slice(start, end).every(cell => cell.classList.contains("occupied"));
      if (isFull) {
          console.log(`Clearing row ${row}`);
          clearedRows++; // Increment cleared rows count

          // Move all rows above down by one
          for (let i = start - 1; i >= 0; i--) {
              cells[i + 10].className = cells[i].className; // Move cell class down
              cells[i + 10].style.backgroundColor = cells[i].style.backgroundColor; // Move color down
          }

          // Clear the topmost row after shifting
          for (let i = 0; i < 10; i++) {
              cells[i].className = "cell"; // Reset top row to default cell class
              cells[i].style.backgroundColor = ""; // Reset color
          }

          row++; // Recheck the same row index after clearing (since rows moved down)
      }
  }

  console.log(`Total cleared rows: ${clearedRows}`);
}

// Export the TETRIMINOES object 
export default TETRIMINOES;