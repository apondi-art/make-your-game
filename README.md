# Make-Your-Game

This project is a Tetris-inspired game built using only plain JavaScript and HTML (without frameworks or canvas). The focus is on smooth gameplay at 60 FPS, ensuring that animations are fluid and responsive.

## Features
- Smooth 60 FPS gameplay (optimized with requestAnimationFrame)
- Custom game engine built with pure JavaScript and DOM
- Keyboard controls (smooth movement without key spamming)
- Pause menu with:

    Resume
    Restart
    Quit
    - Scoreboard tracking:
    Timer: Countdown from 3 minutes
    Score: Tracks cleared lines
    Lives: Lose a life when the board fills up
    Leveling system: Speeds up as levels increase
    - Game mechanics inspired by classic Tetris:
    Blocks (Tetrominoes) fall automatically
    Rotate, move left/right, or drop them
    Line clearing & level progression

## Game Mechanics & Functionality
 Controls
   Arrow Up → Rotate the TetrominoArrow Left → Move left
    Arrow Right → Move right
    Arrow Down → Soft drop
    Pause Button → Pause the game

-  Game Flow

- Start the game → A random Tetromino appears.
-  Move & rotate Tetrominoes → Players control block placement.
-  Clear lines → Filling a row removes it, increasing the score.
- Level up → Every 5 cleared lines speeds up the game.
-  Lose lives → If blocks reach the top, you lose a life.
-  Game over → Runs out of lives or time reaches 0:00.
- Timers & Levels

    Time Limit → 3 minutes (180 seconds)
    Level Progression → Every 5 cleared lines, the game speeds up.
    Speed Mechanic → The Tetromino drop interval reduces by 50ms each level (min: 100ms).
    Lives System → Start with 3 lives. When a life is lost, the board resets.

    ## Technologies Used

    Frontend: JavaScript, HTML, CSS
    Rendering: DOM manipulation (no canvas, no frameworks)
    Performance Optimization: requestAnimationFrame, event loop, browser dev tools

## Setup Instructions

1. Clone the repository:
    ```sh
    git clone https://learn.zone01kisumu.ke/git/quochieng/make-your-game.git
    ```
2. Navigate to the project directory:
    ```sh
    cd make-your-game
    ```

3. Run the project:
Install extension "liveserver"
    ```sh
    right click on index.html to run the project
    ```

## Collaboration
This project was developed by:
- [**Quintin Ochieng**](https://www.linkedin.com/in/quinter-ochieng/)
- [**Wycliffe Onyango**](https://www.linkedin.com/in/wycliffe-alphus-onyango/)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.