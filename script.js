// VOIDSPIN Quantum Entanglement - script.js
const symbols = [
    { emoji: '⚛️', name: 'Quantum',     value: 80,  color: '#22d3ee', prob: 0.09 },
    { emoji: '🌀', name: 'Singularity', value: 45,  color: '#c026d3', prob: 0.13 },
    { emoji: '🌌', name: 'Nebula',      value: 28,  color: '#f472b6', prob: 0.16 },
    { emoji: '🔮', name: 'Oracle',      value: 22,  color: '#67e8f9', prob: 0.18 },
    { emoji: '⚡', name: 'Pulse',       value: 16,  color: '#4ade80', prob: 0.20 },
    { emoji: '🌠', name: 'Voidstar',    value: 12,  color: '#eab308', prob: 0.24 }
];

let balance = 5000;
let bet = 50;
let jackpot = 12500;
let isSpinning = false;
let autoSpinning = false;

let reels = [];
let currentResults = [];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'spin') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        gain.gain.value = 0.25;
        osc.start();
        setTimeout(() => { osc.stop(); }, 600);
    } else if (type === 'stop') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(420, audioCtx.currentTime);
        gain.gain.value = 0.15;
        osc.start();
        setTimeout(() => osc.stop(), 80);
    } else if (type === 'win') {
        gain.gain.value = 0.4;
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                osc.frequency.setValueAtTime(680 + i*120, audioCtx.currentTime);
                osc.start();
                setTimeout(() => osc.stop(), 120);
            }, i*80);
        }
    } else if (type === 'jackpot') {
        // Simple rising fanfare
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 1.8);
        gain.gain.value = 0.35;
        osc.start();
        setTimeout(() => osc.stop(), 2000);
    } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => osc.stop(), 40);
    }
}

function createReelHTML(index) {
    const inner = document.getElementById(`reel${index+1}-inner`);
    inner.innerHTML = '';
    for (let i = 0; i < 35; i++) {
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        const div = document.createElement('div');
        div.className = 'symbol';
        div.style.color = sym.color;
        div.innerHTML = sym.emoji;
        inner.appendChild(div);
    }
}

function initReels() {
    reels = [];
    for (let i = 0; i < 5; i++) {
        createReelHTML(i);
        reels.push(document.getElementById(`reel${i+1}-inner`));
    }
}

function weightedRandomSymbol() {
    let r = Math.random();
    for (let sym of symbols) {
        if (r < sym.prob) return sym;
        r -= sym.prob;
    }
    return symbols[symbols.length-1];
}

async function spin() {
    if (isSpinning || balance < bet) return;
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;
    playSound('click');

    balance -= bet;
    jackpot += Math.floor(bet * 0.03); // jackpot grows
    updateUI();

    currentResults = Array(5).fill().map(() => weightedRandomSymbol());

    // Staggered spins
    const promises = [];
    for (let i = 0; i < 5; i++) {
        promises.push(spinSingleReel(i, 450 + i * 160));
    }
    await Promise.all(promises);

    const winAmount = calculateWin(currentResults);
    if (winAmount > 0) {
        balance += winAmount;
        showWin(winAmount);
        highlightPaylines();
        if (isJackpotWin(currentResults)) {
            jackpotWin();
        } else {
            playSound('win');
        }
    }

    updateUI();
    document.getElementById('spinBtn').disabled = false;
    isSpinning = false;

    if (autoSpinning && balance >= bet) setTimeout(spin, 1100);
}

function spinSingleReel(index, delay) {
    return new Promise(resolve => {
        const reel = reels[index];
        let pos = 0;
        let speed = 52;

        playSound('spin');

        const interval = setInterval(() => {
            pos -= speed;
            reel.style.transform = `translateY(${pos}px)`;
            if (speed > 9) speed *= 0.94;
        }, 16);

        setTimeout(() => {
            clearInterval(interval);
            const targetY = -(currentResults[index].emoji.charCodeAt(0) % 3 * 140 + 40); // visual snap
            reel.style.transition = 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            reel.style.transform = `translateY(${targetY}px)`;
            playSound('stop');
            setTimeout(resolve, 380);
        }, delay);
    });
}

function calculateWin(results) {
    let win = 0;
    const counts = {};
    results.forEach(s => counts[s.name] = (counts[s.name]||0) + 1);

    Object.keys(counts).forEach(key => {
        const c = counts[key];
        if (c >= 3) {
            const sym = results.find(s => s.name === key);
            win += sym.value * bet * (c - 2) * 1.6;
        }
    });

    if (new Set(results.map(r => r.name)).size === 5) win += bet * 4;
    return Math.floor(win);
}

function isJackpotWin(results) {
    return results.every(s => s.name === 'Quantum');
}

function jackpotWin() {
    const winAmount = jackpot;
    balance += winAmount;
    document.getElementById('winMessage').textContent = `JACKPOT!!! +${winAmount}`;
    playSound('jackpot');
    showWin(winAmount, true);
    jackpot = 12500; // reset after hit
}

function showWin(amount, isJackpot = false) {
    const msg = document.getElementById('winMessage');
    msg.textContent = isJackpot ? `MASSIVE JACKPOT +${amount}` : `+${amount}`;
    msg.style.opacity = 1;
    msg.style.color = isJackpot ? '#facc15' : '#4ade80';

    // Particle burst
    for (let i = 0; i < 22; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = Math.random()*100 + 'vw';
            p.style.top = '-60px';
            p.style.fontSize = '2.4rem';
            p.style.zIndex = 999;
            p.textContent = '✨🌠⚛️🌀'[Math.floor(Math.random()*4)];
            document.body.appendChild(p);
            setTimeout(() => {
                p.style.transition = 'transform 2.4s ease-out, opacity 2.4s';
                p.style.transform = `translateY(${window.innerHeight+300}px) rotate(${Math.random()*1200-600}deg)`;
                p.style.opacity = 0;
            }, 30);
            setTimeout(() => p.remove(), 3000);
        }, i * 35);
    }

    setTimeout(() => msg.style.opacity = 0, 2800);
}

function highlightPaylines() {
    document.querySelectorAll('.payline').forEach((line, i) => {
        line.style.opacity = 0.85;
        setTimeout(() => line.style.opacity = 0, 1600 + i*180);
    });
}

function updateUI() {
    document.getElementById('balance').textContent = balance;
    document.getElementById('betAmount').textContent = bet;
    document.getElementById('jackpot').textContent = jackpot;
    document.getElementById('lastWin').textContent = '0';
}

function changeBet(delta) {
    if (isSpinning) return;
    bet = Math.max(10, Math.min(400, bet + delta));
    document.getElementById('betAmount').textContent = bet;
}

function toggleAutoSpin() {
    autoSpinning = !autoSpinning;
    playSound('click');
    if (autoSpinning && !isSpinning) spin();
}

function showInfo() {
    playSound('click');
    const modal = document.getElementById('infoModal');
    const list = document.getElementById('paytable');
    list.innerHTML = '';
    
    symbols.forEach(sym => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="color:${sym.color}">${sym.emoji} ${sym.name}</span> — 3x: ~${(sym.value*bet*1.6).toFixed(0)} | 4x+: higher`;
        list.appendChild(li);
    });
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

// Keyboard
document.addEventListener('keydown', e => {
    if (e.key === ' ' && !isSpinning) {
        e.preventDefault();
        spin();
    }
});

// Init
window.onload = () => {
    initReels();
    updateUI();
    document.getElementById('infoBtn').addEventListener('click', showInfo);
    document.getElementById('historyText').textContent = "Entangle reality • Good luck, Operator";
    
    console.log('%cVOIDSPIN Quantum Entanglement initialized — Ready for licensing or deployment.', 'color:#22d3ee; font-family:monospace');
};
