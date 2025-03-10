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

// Function to generate a random Tetrimino - KEEPING ORIGINAL CAPITALIZATION
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
      const cell = cells[currentTetrimino.position + index];
      if (cell) {
          cell.classList.remove("active");
          cell.style.backgroundColor = "";  // Clear the background color style
      }      
    });
}

// KEEPING ORIGINAL FUNCTION NAME WITH TYPO for compatibility
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
  } else {
      // Lock the Tetrimino in place if it can't move down
      currentTetrimino.shape[currentTetrimino.rotation].forEach(index => {
          const pos = currentTetrimino.position + index;
          if (cells[pos]) {
              cells[pos].classList.add("occupied");
              cells[pos].style.backgroundColor = currentTetrimino.color; // Use backgroundColor instead
          }
      });

     
      clearFullRows(cells);

    
      currentTetrimino = GenerateRandom();

      
      if (!canMoveDown(cells)) {
          console.log("Game Over!");
         
          return;
      }

      renderTeromino(cells); // Call with original typo
  }
}

function canMoveDown(cells) {
  return currentTetrimino.shape[currentTetrimino.rotation].every(index => {
      const newPosition = currentTetrimino.position + index + 10; // Move one row down

      // Check if new position is within grid bounds and not occupied
      return (
          newPosition < cells.length &&                    
          !cells[newPosition]?.classList.contains("occupied") 
      );
  });
}

function clearFullRows(cells) {
  const rows = cells.length / 10; 
  let clearedRows = 0; // Track how many rows were cleared

  for (let row = rows - 1; row >= 0; row--) {
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
              cells[i].className = "cell"; 
              cells[i].style.backgroundColor = ""; // Reset color
          }

          row++; // Recheck the same row index after clearing (since rows moved down)
      }
  }

  console.log(`Total cleared rows: ${clearedRows}`);
}

// Export the TETRIMINOES object 
export default TETRIMINOES;