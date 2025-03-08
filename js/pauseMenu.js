export class PauseMenu {
    constructor(gameBoard, onRestart, onQuit) {
        this.pauseBtn = document.getElementById("pauseBtn");
        this.pauseMenu = document.getElementById("pauseMenu");
        this.restartBtn = document.getElementById("restartBtn");
        this.quitBtn = document.getElementById("quitBtn");
        this.gameBoard = gameBoard;
        this.isPaused = false;
        this.onRestart = onRestart;
        this.onQuit = onQuit;
        this.initEvents();
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseMenu.style.display = this.isPaused ? "flex" : "none";
        this.pauseBtn.textContent = this.isPaused ? "Resume" : "Pause";
    }

    initEvents() {
        this.pauseBtn.addEventListener("click", () => this.togglePause());
        
        this.continueBtn.addEventListener("click", () => {
            this.togglePause();
        });

        this.restartBtn.addEventListener("click", () => {
            this.gameBoard.resetBoard();
            this.togglePause();
            this.onRestart();
        });

        this.quitBtn.addEventListener("click", () => {
            this.gameBoard.resetBoard();
            this.pauseMenu.style.display = "none";
            this.pauseBtn.textContent = "Pause";
            this.isPaused = false;
            this.onQuit();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" || e.key === "p") {
                this.togglePause();
            }
        });
    }
}