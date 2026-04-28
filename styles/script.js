let balance = 5000;
let currentBet = 2.50;
let isSpinning = false;

const symbols = ["🐷", "🐖", "🛠️", "🏠", "👷", "🪚", "A", "K", "Q", "J", "10"];

function createReels() {
  const wrapper = document.getElementById("reels-wrapper");
  wrapper.innerHTML = "";
  
  for (let i = 0; i < 5; i++) {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.innerHTML = `
      <div class="symbol">🐷</div>
      <div class="symbol">🛠️</div>
      <div class="symbol">🏠</div>
    `;
    wrapper.appendChild(reel);
  }
}

function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

window.spin = function() {
  if (isSpinning) return;
  if (balance < currentBet) {
    alert("Not enough balance!");
    return;
  }

  isSpinning = true;
  balance -= currentBet;
  document.getElementById("cash").textContent = "$" + balance.toFixed(2);
  document.getElementById("win").textContent = "$0.00";
  document.getElementById("spinButton").disabled = true;

  const allSymbols = document.querySelectorAll(".symbol");
  
  let spins = 25;
  const interval = setInterval(() => {
    allSymbols.forEach(s => {
      s.textContent = getRandomSymbol();
    });
    spins--;
    if (spins <= 0) {
      clearInterval(interval);
      finishSpin();
    }
  }, 70);
};

function finishSpin() {
  // Simple win calculation
  const winAmount = Math.random() > 0.7 ? currentBet * (5 + Math.random() * 25) : 0;
  
  if (winAmount > 0) {
    balance += winAmount;
    document.getElementById("win").textContent = "$" + winAmount.toFixed(2);
    document.getElementById("cash").textContent = "$" + balance.toFixed(2);
  }

  setTimeout(() => {
    isSpinning = false;
    document.getElementById("spinButton").disabled = false;
  }, 800);
}

window.changeBet = function(amount) {
  currentBet = Math.max(0.50, Math.min(10, currentBet + amount));
  document.getElementById("bet").textContent = "$" + currentBet.toFixed(2);
};

// Initialize
createReels();
document.getElementById("cash").textContent = "$" + balance.toFixed(2);
document.getElementById("bet").textContent = "$" + currentBet.toFixed(2);
