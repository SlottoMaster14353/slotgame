const symbols = ["🐷","🏠","🪵","🔨","A","K","Q","J","⚙️"];

let balance = 1000;
let bet = 10;
let jackpot = 500;
let collected = 0;
let spinning = false;
let auto = false;

// 🔊 SOUND (generated via Web Audio — no files needed)
const ctx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration=0.1) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

// RNG
function rng(max) {
  return Math.floor(Math.random()*max);
}

// UI
function updateUI() {
  balanceEl.textContent = balance;
  betEl.textContent = bet;
  jackpotEl.textContent = jackpot;
}

const balanceEl = document.getElementById("balance");
const betEl = document.getElementById("bet");
const jackpotEl = document.getElementById("jackpot");

// REELS
function spin() {
  if (spinning || balance < bet) return;

  spinning = true;
  balance -= bet;
  jackpot += Math.floor(bet*0.1);

  playTone(200);

  const reels = document.getElementById("reels");
  reels.innerHTML = "";

  let specials = 0;

  for (let i=0;i<5;i++) {
    let col = document.createElement("div");
    col.className = "column spin";

    setTimeout(()=>col.classList.remove("spin"), 500 + i*200);

    for (let j=0;j<3;j++) {
      let sym = symbols[rng(symbols.length)];
      if (sym==="⚙️") specials++;

      let cell = document.createElement("div");
      cell.className="cell";
      cell.textContent = sym;
      col.appendChild(cell);
    }

    reels.appendChild(col);
  }

  setTimeout(()=>{
    finishSpin(specials);
  },1500);
}

// FINISH
function finishSpin(specials) {
  collected += specials;

  if (specials >=3) {
    showPopup("FEATURE!");
    setTimeout(spinWheel,1000);
  }

  if (collected >=6) {
    collected=0;
    let win = bet*(2+rng(5));
    balance += win;
    playTone(600);
    showPopup("UPGRADE WIN $" + win);
  }

  spinning=false;
  updateUI();

  if (auto) setTimeout(spin,200);
}

// 🎡 WHEEL (REAL GRAPHIC)
const canvas = document.getElementById("wheelCanvas");
const ctx2 = canvas.getContext("2d");

const wheelSegments = ["50","100","200","JACKPOT","FREE"];

let angle = 0;

function drawWheel() {
  let arc = Math.PI*2 / wheelSegments.length;

  for (let i=0;i<wheelSegments.length;i++) {
    ctx2.beginPath();
    ctx2.moveTo(150,150);
    ctx2.arc(150,150,140, angle+i*arc, angle+(i+1)*arc);
    ctx2.fillStyle = i%2 ? "gold":"orange";
    ctx2.fill();

    ctx2.fillStyle="black";
    ctx2.fillText(wheelSegments[i],120,150);
  }
}

function spinWheel() {
  let spins = 20;
  let interval = setInterval(()=>{
    angle += 0.3;
    ctx2.clearRect(0,0,300,300);
    drawWheel();
    spins--;

    if (spins<=0) {
      clearInterval(interval);
      resolveWheel();
    }
  },50);
}

function resolveWheel() {
  let pick = wheelSegments[rng(wheelSegments.length)];

  if (pick==="JACKPOT") {
    balance += jackpot;
    jackpot = 500;
    playTone(900);
  } else if (!isNaN(pick)) {
    balance += Number(pick);
    playTone(500);
  }

  showPopup("WHEEL: " + pick);
  updateUI();
}

// POPUP
function showPopup(text) {
  let p = document.getElementById("popup");
  p.innerText = text;
  p.style.display="block";
  setTimeout(()=>p.style.display="none",1000);
}

// CONTROLS
function changeBet(v) {
  bet = Math.max(10, bet+v);
  updateUI();
}

document.addEventListener("keydown", e=>{
  if (e.code==="Space") {
    auto=true;
    spin();
  }
});

document.addEventListener("keyup", ()=>auto=false);

updateUI();
drawWheel();
