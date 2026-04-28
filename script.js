let balance = 5000;
let huffBet = 2.50;
let piggyBet = 2.00;

const huffSymbols = ["🐷","🐖","🛠️","👷","🏠","🪚","A","K","Q","J","10"];

function updateAllBalances() {
  const formatted = "$" + balance.toFixed(2);
  document.getElementById("lobby-balance").textContent = formatted;
  if (document.getElementById("huff-cash")) document.getElementById("huff-cash").textContent = formatted;
  if (document.getElementById("piggy-cash")) document.getElementById("piggy-cash").textContent = formatted;
}

function createReels(containerId, count = 5) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.innerHTML = `<div class="symbol">🐷</div><div class="symbol">🛠️</div><div class="symbol">🏠</div>`;
    container.appendChild(reel);
  }
}

window.enterGame = function(game) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(game + '-game').classList.add('active');

  if (game === 'huff') {
    createReels('huff-reels');
  } else {
    createReels('piggy-reels');
  }
};

window.goHome = function() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('lobby').classList.add('active');
  updateAllBalances();
};

// Huff N Puff Spin
window.spinHuff = function() {
  if (balance < huffBet) return alert("Not enough credits!");
  balance -= huffBet;
  updateAllBalances();

  const symbols = document.querySelectorAll('#huff-reels .symbol');
  let spinsLeft = 30;

  const interval = setInterval(() => {
    symbols.forEach(s => s.textContent = huffSymbols[Math.floor(Math.random()*huffSymbols.length)]);
    spinsLeft--;
    if (spinsLeft <= 0) {
      clearInterval(interval);
      finishHuffSpin();
    }
  }, 60);
};

function finishHuffSpin() {
  const win = Math.random() > 0.6 ? huffBet * (10 + Math.random() * 45) : 0;

  if (win > 0) {
    balance += win;
    document.getElementById("huff-win").textContent = "$" + win.toFixed(2);
    updateAllBalances();

    document.querySelectorAll('#huff-reels .symbol').forEach(s => {
      if (Math.random() > 0.4) s.classList.add('win-glow');
    });

    // Trigger bonus chance
    if (Math.random() < 0.28) {
      setTimeout(() => {
        document.getElementById("wheel-modal").classList.remove("hidden");
        document.getElementById("wheel-result").innerHTML = "HARD HAT FREE SPINS TRIGGERED!<br>You won $450!";
      }, 600);
    }
  }
  setTimeout(() => document.getElementById("huffSpinBtn").disabled = false, 900);
}

window.changeBet = function(delta, game) {
  if (game === 'huff') {
    huffBet = Math.max(0.5, Math.min(20, huffBet + delta));
    document.getElementById("huff-bet").textContent = "$" + huffBet.toFixed(2);
  }
};

// Piggy Bank (simple Hold & Win feel)
window.spinPiggy = function() {
  if (balance < piggyBet) return alert("Not enough credits!");
  balance -= piggyBet;
  updateAllBalances();

  const symbols = document.querySelectorAll('#piggy-reels .symbol');
  symbols.forEach(s => {
    s.textContent = Math.random() > 0.6 ? "💰" : ["🐷","🍒","🪙","🏦"][Math.floor(Math.random()*4)];
  });

  const win = Math.random() > 0.55 ? piggyBet * (12 + Math.random()*30) : 0;
  if (win > 0) {
    balance += win;
    document.getElementById("piggy-win").textContent = "$" + win.toFixed(2);
    updateAllBalances();
  }
};

// Shop
window.showShop = function() {
  document.getElementById("shop-modal").classList.remove("hidden");
};

window.addCredits = function(amount) {
  balance += amount;
  updateAllBalances();
  alert(`Added $${amount} fake credits!`);
};

window.closeShop = function() {
  document.getElementById("shop-modal").classList.add("hidden");
};

window.closeWheelModal = function() {
  document.getElementById("wheel-modal").classList.add("hidden");
};

// Initialize
updateAllBalances();
createReels('huff-reels');   // pre-load
