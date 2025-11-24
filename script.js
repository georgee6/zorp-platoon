const reelsContainer = document.getElementById('reelsContainer');
const balanceLabel = document.getElementById('balance');
const notificationLabel = document.getElementById('notification');
const spinButton = document.getElementById('spinButton');
const wagerInput = document.getElementById('wager');
const spinAmountDisplay = document.getElementById('spinAmountDisplay');
const freeSpinsCounter = document.getElementById('freeSpinsCounter');
const bonusPointsCounter = document.getElementById('bonusPointsCounter');

let balance = 100;
let freeSpins = 0;
let bonusPoints = 0;
let inBonus = false;

let forcedWinCounter = 0; // <- forces every other spin to win

const reelCount = 3;
const rowCount = 3;

// Symbols, payouts, sounds, and custom messages (NO images/ prefix)
const images = [
    '10.png','jack.png','queen.png','king.png','ace.png','bonus.png','wild.png'
];

const symbolPay = {
    '10.png': 1,
    'jack.png': 2,
    'queen.png': 3,
    'king.png': 5,
    'ace.png': 20,
    'bonus.png': 3,
    'wild.png': 0
};

const symbolSounds = {
    '10.png': new Audio('10.wav'),
    'jack.png': new Audio('jack.wav'),
    'queen.png': new Audio('queen.wav'),
    'king.png': new Audio('king.wav'),
    'ace.png': new Audio('ace.wav'),
    'bonus.png': new Audio('bonus.wav'),
    'wild.png': new Audio('badfeeling.wav')
};

const symbolMessages = {
    '10.png': 'COME ON!',
    'jack.png': 'TIME TO KILL!',
    'queen.png': 'I got your back.',
    'king.png': 'I love you!',
    'ace.png': 'I got a bad feeling',
    'bonus.png': 'sector 9',
    'wild.png': 'AUUUUHHH'
};

const reels = [];
const currentSymbols = Array.from({ length: rowCount }, () => Array(reelCount).fill(null));

// Initialize reels
for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < reelCount; c++) {
        const div = document.createElement('div');
        div.classList.add('reel');
        const img = images[Math.floor(Math.random() * images.length)];
        div.style.backgroundImage = `url(${img})`;
        div.dataset.symbol = img;
        reelsContainer.appendChild(div);
        reels.push(div);
        currentSymbols[r][c] = img;
    }
}

// Spin sound
const spinSound = new Audio('hulagirl.wav');
spinSound.loop = true;
let songPausedTime = 0;
const spinDurationPerReel = 4000;

// BONUS COUNTERS
function updateCounters() {
    if (inBonus) {
        freeSpinsCounter.style.display = 'block';
        bonusPointsCounter.style.display = 'block';
        freeSpinsCounter.textContent = `Free Spins: ${freeSpins}`;
        bonusPointsCounter.textContent = `Bonus Points: ${bonusPoints}`;
    } else {
        freeSpinsCounter.style.display = 'none';
        bonusPointsCounter.style.display = 'none';
    }
}

// FORCE WIN EVERY OTHER SPIN
function forceWinIfNecessary(result) {
    forcedWinCounter++;

    if (forcedWinCounter >= 2 && !result.win) {
        forcedWinCounter = 0;

        // Force a SIMPLE win on middle row
        const forcedSymbol = "10.png";

        result.reels = [
           
