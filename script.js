// script.js - FIXED VERSION

let balance = 5000;
let huffBet = 2.50;
let piggyBet = 2.00;

const huffSymbols = ["🐷","🐖","🛠️","👷","🏠","🪚","A","K","Q","J","10"];

function updateAllBalances() {
  const formatted = "$" + balance.toFixed(2);
  const lobbyBal = document.getElementById("lobby-balance");
  if (lobbyBal) lobbyBal.textContent = formatted;
  
  const huffCash = document.getElementById("huff-cash");
  if (huffCash) huffCash.textContent = formatted;
  
  const piggyCash = document.getElementById("piggy-cash");
  if (piggyCash) piggyCash.textContent = formatted;
}

function createReels(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.innerHTML = `
      <div class="symbol">🐷</div>
      <div class="symbol">🛠️</div>
      <div class="symbol">🏠</div>
    `;
    container.appendChild(reel);
  }
}

window.enterGame = function(game) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(game + '-game').classList.add('active');

  if (game === 'huff') {
    createReels('huff-reels');
  } else if (game === 'piggy') {
    createReels('piggy-reels');
  }
};

window.goHome = function() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('lobby').classList.add('active');
  updateAllBalances();
};

// ==================== HUFF N PUFF ====================
window.spinHuff = function() {
  if (balance < huffBet) {
    alert("Not enough credits!");
    return;
  }

  balance -= huffBet;
  updateAllBalances();
  document.getElementById("huff-win").textContent = "$0.00";

  const symbols = document.querySelectorAll('#huff-reels .symbol');
  let spinsLeft = 32;

  const interval = setInterval(() => {
    symbols.forEach(s => {
      s.textContent = huffSymbols[Math.floor(Math.random() * huffSymbols.length)];
    });
    spinsLeft--;
    if (spinsLeft <= 0) {
      clearInterval(interval);
      finishHuffSpin();
    }
  }, 65);
};

function finishHuffSpin() {
  const winAmount = Math.random() > 0.58 ? huffBet * (12 + Math.random() * 50) : 0;

  if (winAmount > 0) {
    balance += winAmount;
    document.getElementById("huff-win").textContent = "$" + winAmount.toFixed(2);
    updateAllBalances();

    // Glowing win effect
    document.querySelectorAll('#huff-reels .symbol').forEach(s => {
      if (Math.random() > 0.45) s.classList.add('win-glow');
    });

    // Random chance to trigger Buzz Saw Wheel (only after a win)
    if (Math.random() < 0.22) {
      setTimeout(triggerBuzzSawWheel, 800);
    }
  }

  // Re-enable spin button
  setTimeout(() => {
    const btn = document.getElementById("huffSpinBtn");
    if (btn) btn.disabled = false;
  }, 600);
}

function triggerBuzzSawWheel() {
  document.getElementById("wheel-result").innerHTML = 
    "🎡 BUZZ SAW WHEEL!<br>You won Hard Hat Free Spins + $350!";
  document.getElementById("wheel-modal").classList.remove("hidden");
}

// ==================== PIGGY BANK ====================
window.spinPiggy = function() {
  if (balance < piggyBet) {
    alert("Not enough credits!");
    return;
  }

  balance -= piggyBet;
  updateAllBalances();
  document.getElementById("piggy-win").textContent = "$0.00";

  const symbols = document.querySelectorAll('#piggy-reels .symbol');
  symbols.forEach(s => {
    s.textContent = Math.random() > 0.6 ? "💰" : ["🐷","🍒","🪙","🏦"][Math.floor(Math.random()*4)];
  });

  const win = Math.random() > 0.5 ? piggyBet * (15 + Math.random()*35) : 0;
  if (win > 0) {
    balance += win;
    document.getElementById("piggy-win").textContent = "$" + win.toFixed(2);
    updateAllBalances();
  }
};

// ==================== SHOP & MODALS ====================
window.showShop = function() {
  document.getElementById("shop-modal").classList.remove("hidden");
};

window.addCredits = function(amount) {
  balance += amount;
  updateAllBalances();
  alert(`✅ Added $${amount} fake credits!`);
};

window.closeShop = function() {
  document.getElementById("shop-modal").classList.add("hidden");
};

window.closeWheelModal = function() {
  document.getElementById("wheel-modal").classList.add("hidden");
};

// ==================== INIT ====================
window.onload = function() {
  updateAllBalances();
  // Pre-create reels so they are ready
  createReels('huff-reels');
  createReels('piggy-reels');
};
