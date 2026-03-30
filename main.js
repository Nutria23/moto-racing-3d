import { Game } from './src/game.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    
    const startBtn = document.getElementById('start-button');
    const splashScreen = document.getElementById('splash-screen');
    const hud = document.getElementById('hud');
    const gameOver = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-button');

    setTimeout(() => {
        document.querySelector('.loader').classList.add('hidden');
        startBtn.classList.remove('hidden');
    }, 2000);

    const startGame = () => {
        splashScreen.classList.add('hidden');
        gameOver.classList.add('hidden');
        hud.classList.remove('hidden');
        game.start();
    };

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
});
