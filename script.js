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

let spinCount = 0;
const BONUS_RATE = 20; // 1 in 20 spins triggers bonus

const reelCount = 3;
const rowCount = 3;

// Symbols + payouts + sounds + messages
const symbols = [
    '10.png', 'jack.png', 'queen.png', 'king.png',
    'ace.png', 'bonus.png', 'wild.png'
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
const currentSymbols = Array.from({ length: rowCount }, () =>
    Array(reelCount).fill(null)
);

// Weighted RNG (bonus less common)
function weightedRandomSymbol() {
    const pool = [
        "10.png","10.png","10.png","10.png",
        "jack.png","jack.png","jack.png",
        "queen.png","queen.png",
        "king.png","king.png",
        "ace.png",
        "wild.png",
        "bonus.png" // rare
    ];
    return pool[Math.floor(Math.random() * pool.length)];
}

// Initialize reels visually
for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < reelCount; c++) {
        const div = document.createElement('div');
        div.classList.add('reel');
        const img = weightedRandomSymbol();
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

// Bonus counter updating
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

// Check for 1-in-20 bonus
function checkBonusTrigger() {
    spinCount++;
    if (spinCount >= BONUS_RATE) {
        spinCount = 0;
        return true;
    }
    return false;
}

// Main spin
function spin() {
    const wager = parseInt(wagerInput.value);

    if (balance < wager && freeSpins === 0) {
        notificationLabel.textContent = "Not enough credits!";
        return;
    }

    // Deduct wager
    if (freeSpins === 0) {
        balance -= wager;
        balanceLabel.textContent = `Balance: ${balance}`;
    }

    notificationLabel.textContent = "";
    spinAmountDisplay.textContent = "";
    spinButton.disabled = true;

    // Start spin sound
    spinSound.currentTime = songPausedTime;
    spinSound.play();

    // Check bonus trigger
    let bonusTriggered = false;
    if (!inBonus) {
        bonusTriggered = checkBonusTrigger();
        if (bonusTriggered) {
            inBonus = true;
            freeSpins = 10;
            bonusPoints = 0;
            notificationLabel.textContent = "BONUS TRIGGERED!";
            updateCounters();
        }
    }

    // Wild screen (1 in 25)
    const wildScreen = Math.random() < 1/25;
    let finalSymbols = [];

    if (wildScreen) {
        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < reelCount; c++) {
                finalSymbols.push("wild.png");
            }
        }
        inBonus = true;
        freeSpins = 10;
        notificationLabel.textContent = "WILD SCREEN BONUS!";
    } else {
        // Normal RNG board
        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < reelCount; c++) {
                finalSymbols.push(weightedRandomSymbol());
            }
        }
    }

    // Animate reels / stop reels
    for (let c = 0; c < reelCount; c++) {
        setTimeout(() => {
            const start = Date.now();

            function animate() {
                const elapsed = Date.now() - start;

                if (elapsed < spinDurationPerReel) {
                    for (let r = 0; r < rowCount; r++) {
                        const idx = r * reelCount + c;
                        reels[idx].style.backgroundImage =
                            `url(${weightedRandomSymbol()})`;
                        reels[idx].style.transform =
                            `translateY(${Math.random() * 20 - 10}px)`;
                    }
                    requestAnimationFrame(animate);
                } else {
                    // Final symbols
                    for (let r = 0; r < rowCount; r++) {
                        const idx = r * reelCount + c;
                        const sym = finalSymbols[idx];
                        currentSymbols[r][c] = sym;
                        reels[idx].style.backgroundImage = `url(${sym})`;
                        reels[idx].dataset.symbol = sym;
                        reels[idx].style.border = '2px solid white';
                    }

                    if (c === reelCount - 1) {
                        const winAmount = checkWin(wager);
                        if (freeSpins > 0) freeSpins--;

                        updateCounters();
                        spinButton.disabled = false;

                        songPausedTime = spinSound.currentTime;
                        spinSound.pause();

                        if (freeSpins === 0 && inBonus) {
                            inBonus = false;
                            updateCounters();
                        }
                    }
                }
            }
            animate();
        }, c * 200);
    }
}

// Win checking logic
function checkWin(wager) {
    let messages = [];
    let winAmount = 0;

    // ROWS
    for (let r = 0; r < rowCount; r++) {
        const row = reels.slice(r * reelCount, (r + 1) * reelCount);
        const sym = row[0].dataset.symbol;

        if (row.every(d => d.dataset.symbol === sym)) {
            const amount = symbolPay[sym] * wager;
            winAmount += amount;

            row.forEach(d => d.style.border = "3px solid red");
            messages.push(`${symbolMessages[sym]} (Row ${r + 1} wins ${amount})`);

            symbolSounds[sym].currentTime = 0;
            symbolSounds[sym].play();

            if (inBonus) bonusPoints += amount;
        }
    }

    // DIAGONALS
    const diag1 = [reels[0], reels[4], reels[8]];
    const sym1 = diag1[0].dataset.symbol;
    if (diag1.every(d => d.dataset.symbol === sym1)) {
        const amount = symbolPay[sym1] * wager;
        winAmount += amount;
        diag1.forEach(d => d.style.border = "3px solid red");
        symbolSounds[sym1].play();
        messages.push(`${symbolMessages[sym1]} (Diagonal TL-BR wins ${amount})`);
        if (inBonus) bonusPoints += amount;
    }

    const diag2 = [reels[6], reels[4], reels[2]];
    const sym2 = diag2[0].dataset.symbol;
    if (diag2.every(d => d.dataset.symbol === sym2)) {
        const amount = symbolPay[sym2] * wager;
        winAmount += amount;
        diag2.forEach(d => d.style.border = "3px solid red");
        symbolSounds[sym2].play();
        messages.push(`${symbolMessages[sym2]} (Diagonal BL-TR wins ${amount})`);
        if (inBonus) bonusPoints += amount;
    }

    balance += winAmount;
    balanceLabel.textContent = `Balance: ${balance}`;

    notificationLabel.textContent =
        messages.length ? messages.join(" | ") : "No win this spin.";

    spinAmountDisplay.textContent =
        winAmount ? `Won: ${winAmount}` : "";

    return winAmount;
}

spinButton.addEventListener('click', spin);
updateCounters();
