const reelsContainer = document.getElementById('reelsContainer');
const balanceLabel = document.getElementById('balance');
const notificationLabel = document.getElementById('notification');
const spinButton = document.getElementById('spinButton');
const wagerInput = document.getElementById('wager');
const spinAmountDisplay = document.getElementById('spinAmountDisplay');
const freeSpinsCounter = document.getElementById('freeSpinsCounter');
const bonusPointsCounter = document.getElementById('bonusPointsCounter');

// --- AUDIO FILES ---
const sounds = {
    "10": new Audio("10.wav"),
    "jack": new Audio("jack.wav"),
    "queen": new Audio("queen.wav"),
    "king": new Audio("king.wav"),
    "ace": new Audio("ace.wav"),
    "wild": new Audio("hulagirl.wav"),
    "bonus": new Audio("bonus.wav"),
    "phony": new Audio("badfeeling.wav")
};

// --- GLOBAL GAME STATE ---
let balance = 1000;
let freeSpins = 0;
let bonusPoints = 0;
let forcedWinCounter = 0; // forces 1 in 3 win

// --- SYMBOL LIST WITH WEIGHTS (controls win rate) ---
const symbols = [
    { name: "10", weight: 20 },
    { name: "jack", weight: 18 },
    { name: "queen", weight: 16 },
    { name: "king", weight: 14 },
    { name: "ace", weight: 12 },
    { name: "wild", weight:  8 },
    { name: "bonus", weight:  5 }
];
// Total weight = 93

// Calculates weighted symbol
function getWeightedSymbol() {
    let totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;

    for (let s of symbols) {
        if (random < s.weight) return s.name;
        random -= s.weight;
    }
    return "10";
}

// Fill screen with wilds (1 in 25 chance)
function isFullWildScreen() {
    return Math.random() < 1 / 25;
}

// Play symbol-specific audio
function playSymbolSound(symbol) {
    if (sounds[symbol]) {
        sounds[symbol].currentTime = 0;
        sounds[symbol].play();
    }
}

// Generate reel results
function spinReels() {
    if (isFullWildScreen()) {
        return [
            ["wild", "wild", "wild"],
            ["wild", "wild", "wild"],
            ["wild", "wild", "wild"]
        ];
    }

    let reels = [];
    for (let col = 0; col < 3; col++) {
        let column = [];
        for (let row = 0; row < 3; row++) {
            column.push(getWeightedSymbol());
        }
        reels.push(column);
    }
    return reels;
}

// Check win (any row match)
function checkWin(reels) {
    for (let row = 0; row < 3; row++) {
        if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
            return reels[0][row];
        }
    }
    return null;
}

// Check real bonus
function checkBonus(reels) {
    let count = reels.flat().filter(s => s === "bonus").length;
    return count >= 3;
}

// Force 1 win every 3 spins
function forceWinIfNecessary(result) {
    forcedWinCounter++;

    if (forcedWinCounter >= 3 && !result.winSymbol) {
        forcedWinCounter = 0;
        result.winSymbol = "10"; // weakest symbol
        result.forced = true;

        result.reels = [
            ["10", "jack", "king"],
            ["10", "queen", "ace"],
            ["10", "wild", "bonus"]
        ];
    }

    return result;
}

// Handle phony bonus (fake bonus that doesn't give free spins)
function maybePhonyBonus() {
    // 10% chance for fake bonus
    return Math.random() < 0.10;
}

// MAIN SPIN FUNCTION
spinButton.addEventListener('click', () => {
    let wager = parseInt(wagerInput.value) || 1;

    if (wager > balance) {
        notificationLabel.textContent = "Not enough balance!";
        return;
    }

    balance -= wager;
    balanceLabel.textContent = balance;

    let reels = spinReels();
    let winSymbol = checkWin(reels);
    let isBonus = checkBonus(reels);

    let result = { reels, winSymbol };

    // Apply forced win if needed
    result = forceWinIfNecessary(result);
    reels = result.reels;
    winSymbol = result.winSymbol;

    // Render reels
    reelsContainer.innerHTML = "";
    reels.forEach(col => {
        let columnDiv = document.createElement("div");
        columnDiv.classList.add("reel-column");

        col.forEach(symbol => {
            let img = document.createElement("img");
            img.src = `${symbol}.png`;
            img.classList.add("symbol");
            columnDiv.appendChild(img);
        });

        reelsContainer.appendChild(columnDiv);
    });

    // Handle REAL BONUS
    if (isBonus) {
        playSymbolSound("bonus");
        freeSpins += 10;
        freeSpinsCounter.textContent = `Free Spins: ${freeSpins}`;
        notificationLabel.textContent = "REAL BONUS TRIGGERED! +10 FREE SPINS!";
        return;
    }

    // Handle PHONY BONUS (if no real bonus)
    if (!isBonus && maybePhonyBonus()) {
        playSymbolSound("phony");
        notificationLabel.textContent = "You *almost* got the bonus... (phony bonus)";
        balance += Math.floor(wager * 0.5); // small payout
        balanceLabel.textContent = balance;
        return;
    }

    // Handle REGULAR WIN
    if (winSymbol) {
        playSymbolSound(winSymbol);
        let winAmount = wager * 4;
        balance += winAmount;
        balanceLabel.textContent = balance;

        notificationLabel.textContent = `You won ${winAmount}!`;
        return;
    }

    // No win
    notificationLabel.textContent = "No win this spin.";
});
