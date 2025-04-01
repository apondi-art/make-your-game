import { GameState } from './gameState.js';
import { GameLoop } from './gameLoop.js';
import { Renderer } from './renderer.js';
import { InputManager } from './inputManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const boardElement = document.getElementById('game-board');
    const previewElement = document.getElementById('preview');
    const scoreElements = {
        score: document.getElementById('score'),
        lines: document.getElementById('lines'),
        level: document.getElementById('level'),
        lives: document.getElementById('lives'),
        timer: document.getElementById('timer')
    };

    // Create game board cells
    for (let i = 0; i < 200; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        boardElement.appendChild(cell);
    }

    // Create preview cells
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'preview-cell';
        previewElement.appendChild(cell);
    }

    // Initialize game components
    const gameState = new GameState();
    const renderer = new Renderer(boardElement, previewElement, scoreElements);
    const gameLoop = new GameLoop(gameState, renderer);
    const inputManager = new InputManager(gameLoop);

    // Expose for debugging
    window.game = {
        state: gameState,
        loop: gameLoop,
        renderer: renderer
    };
});