export class PauseMenu {
    constructor(gameBoard, onRestart, onQuit, onPause, onResume) {
        this.pauseBtn = document.getElementById("pauseBtn");
        this.pauseMenu = document.getElementById("pauseMenu");
        this.restartBtn = document.getElementById("restartBtn");
        this.quitBtn = document.getElementById("quitBtn");
        this.gameBoard = gameBoard;
        this.isPaused = false;
        this.onRestart = onRestart;
        this.onQuit = onQuit;
        this.onPause = onPause;
        this.onResume = onResume;
        this.initEvents();
    }

    togglePause() {
        console.log("Before toggle - isPaused:", this.isPaused);

        if (!this.isPaused) {
            this.isPaused = true;
            this.pauseMenu.style.display = "flex";
            this.pauseBtn.textContent = "Resume";
            this.onPause();
        } else {
            this.isPaused = false;
            this.pauseMenu.style.display = "none";
            this.pauseBtn.textContent = "Pause";
            this.onResume();
        }

        console.log("After toggle - isPaused:", this.isPaused);
    }

    resetPauseState() {
        console.log("Resetting pause state");
        this.isPaused = false;
        this.pauseMenu.style.display = "none";
        this.pauseBtn.textContent = "Pause"; // ✅ Ensures the button resets after quitting
    }

    initEvents() {
        this.pauseBtn.addEventListener("click", () => {
            console.log("Pause button clicked!");
            this.togglePause();
        });

        this.restartBtn.addEventListener("click", () => {
            console.log("Restart button clicked!");
            this.gameBoard.resetBoard();

            // ✅ Only toggle pause if the game was actually paused
            if (this.isPaused) {
                this.togglePause();
            }

            this.onRestart();
        });

        this.quitBtn.addEventListener("click", () => {
            console.log("Quit button clicked!");
            this.resetPauseState(); // ✅ Reset Pause state properly
            this.gameBoard.resetBoard();
            this.onQuit();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.key === "p") {
                console.log("Keyboard pause key pressed!");
                this.togglePause();
            }
        });
    }
}
