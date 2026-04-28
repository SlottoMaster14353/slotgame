let balance = 5000;
let currentGame = 'huff';
let bet = 2.50;

// Better symbols using real image URLs (replace if you want higher quality)
const huffSymbols = [
  "https://via.placeholder.com/120/FF69B4/fff?text=PIG",   // Pink Pig
  "https://via.placeholder.com/120/FFD700/000?text=SAW",   // Buzz Saw
  "https://via.placeholder.com/120/00AA00/fff?text=HAT",   // Hard Hat
  "https://via.placeholder.com/120/CD853F/fff?text=HOUSE", // Straw House
  "https://via.placeholder.com/120/8B4513/fff?text=BRICK", // Brick House
  "A","K","Q","J","10"
];

function createReels(gameId) {
  const container = document.getElementById(gameId === 'huff' ? 'reels-wrapper' : 'piggy-reels');
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const reel = document.createElement('div');
    reel.className = 'reel';
    reel.innerHTML = `
      <div class="symbol">🐷</div>
      <div class="symbol">🛠️</div>
      <div class="symbol">🏠</div>
    `;
    container.appendChild(reel);
  }
}

function getRandomSymbol() {
  return huffSymbols[Math.floor(Math.random() * huffSymbols.length)];
}

window.spin = function() {
  if (balance < bet) return alert("Not enough credits!");
  balance -= bet;
  updateBalance();

  const symbols = document.querySelectorAll('#reels-wrapper .symbol');
  let spins = 28;

  const interval = setInterval(() => {
    symbols.forEach(s => s.textContent = getRandomSymbol());
    spins--;
    if (spins <= 0) {
      clearInterval(interval);
      endSpin();
    }
  }, 65);
};

function endSpin() {
  const winAmount = Math.random() > 0.65 ? bet * (8 + Math.random()*40) : 0;
  
  if (winAmount > 0) {
    balance += winAmount;
    document.getElementById('win').textContent = '$' + winAmount.toFixed(2);
    updateBalance();

    // Glowing win lines
    document.querySelectorAll('.symbol').forEach(s => {
      if (Math.random() > 0.5) s.classList.add('win-glow');
    });

    // Chance for Hard Hat Free Spins or Wheel
    if (Math.random() < 0.25) {
      setTimeout(() => {
        document.getElementById('wheel-modal').classList.remove('hidden');
        document.getElementById('wheel-result').textContent = "YOU WON HARD HAT FREE SPINS + $250!";
      }, 800);
    }
  }
  setTimeout(() => document.getElementById('spinBtn').disabled = false, 1000);
}

function updateBalance() {
  document.getElementById('cash').textContent = '$' + balance.toFixed(2);
}

window.changeBet = function(delta) {
  bet = Math.max(0.5, Math.min(10, bet + delta));
  document.getElementById('bet').textContent = '$' + bet.toFixed(2);
};

// Piggy Bank simple version
window.spinPiggy = function() {
  // Similar logic - you can expand later
  alert("Break the Piggy Bank spinning! (Simple version - add more if you want)");
  balance += Math.random() * 80;
  document.getElementById('piggy-cash').textContent = '$' + balance.toFixed(2);
};

// Navigation
window.startGame = function(game) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(game + '-game').classList.add('active');
  currentGame = game;
  if (game === 'huff') createReels('huff');
  else createReels('piggy');
};

window.goHome = function() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('lobby').classList.add('active');
};

window.closeModal = function() {
  document.getElementById('wheel-modal').classList.add('hidden');
};

// Init
document.getElementById('lobby').classList.add('active');
createReels('huff');
updateBalance();
