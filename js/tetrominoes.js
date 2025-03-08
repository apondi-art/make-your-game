const width = 10; // Grid width

function createTetrimino(shape) {
    switch (shape) {
        case "I":
            return [[1, width + 1, width * 2 + 1, width * 3 + 1], // Vertical
                    [width, width + 1, width + 2, width + 3]]; // Horizontal
        case "J":
            return [[1, 2, 2 + width, 2 + width * 2], 
                    [width, width + 1, width + 2, 2], 
                    [0, width, width * 2, 1 + width * 2], 
                    [width, width + 1, width + 2, width * 2]];
        case "L":
            return [[0, 1, 1 + width, 1 + width * 2], 
                    [width, width + 1, width + 2, 2 + width], 
                    [1, width + 1, width * 2 + 1, width * 2], 
                    [width, width + 1, width + 2, 0]];
        case "O":
            return [[0, 1, width, width + 1]]; // No rotation needed
        case "S":
            return [[1, 2, width, width + 1], 
                    [0, width, width + 1, width * 2 + 1]];
        case "Z":
            return [[0, 1, width + 1, width + 2], 
                    [1, width, width + 1, width * 2]];
        case "T":
            return [[1, width, width + 1, width + 2], 
                    [1, width + 1, width + 2, width * 2 + 1], 
                    [width, width + 1, width + 2, width * 2 + 1], 
                    [1, width, width + 1, width * 2]];
        default:
            return [];
    }
}

const TETRIMINOES = {
    I: createTetrimino("I"),
    J: createTetrimino("J"),
    L: createTetrimino("L"),
    O: createTetrimino("O"),
    S: createTetrimino("S"),
    Z: createTetrimino("Z"),
    T: createTetrimino("T")
};
