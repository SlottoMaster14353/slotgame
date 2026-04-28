const symbols = [
    { emoji: '⚛️', name: 'Quantum',     value: 120, color: '#22d3ee', weight: 8 },
    { emoji: '🌀', name: 'Singularity', value: 55,  color: '#c026d3', weight: 14 },
    { emoji: '🌌', name: 'Nebula',      value: 32,  color: '#f472b6', weight: 18 },
    { emoji: '🔮', name: 'Oracle',      value: 24,  color: '#67e8f9', weight: 22 },
    { emoji: '⚡', name: 'Pulse',       value: 18,  color: '#4ade80', weight: 25 },
    { emoji: '🌠', name: 'Voidstar',    value: 14,  color: '#eab308', weight: 30 }
];

let balance = 5000;
let bet = 50;
let jackpot = 12500;
let isSpinning = false;
let autoSpinning = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    if (type === 'spinStart') {
        osc.type = 'sawtooth'; osc.frequency.value = 140; gain.gain.value = 0.3;
        osc.start(); setTimeout(() => osc.stop(), 650);
    } else if (type === 'reelStop') {
        osc.type = 'square'; osc.frequency.value = 520; gain.gain.value = 0.2;
        osc.start(); setTimeout(() => osc.stop(), 60);
    } else if (type === 'bigWin') {
        gain.gain.value = 0.45;
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                osc.frequency.setValueAtTime(600 + i*180, audioCtx.currentTime);
                osc.start(); setTimeout(() => osc.stop(), 140);
            }, i*90);
        }
    } else if (type === 'jackpot') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 2.2);
        gain.gain.value = 0.4;
        osc.start(); setTimeout(() => osc.stop(), 2400);
    }
}

function getWeightedSymbol() {
    let totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let sym of symbols) {
        rand -= sym.weight;
        if (rand <= 0) return sym;
    }
    return symbols[symbols.length - 1];
}

function initReels() {
    for (let i = 1; i <= 5; i++) {
        const inner = document.getElementById(`reel${i}-inner`);
        inner.innerHTML = '';
        for (let j = 0; j < 40; j++) {
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            const div = document.createElement('div');
            div.className = 'symbol';
            div.style.color = sym.color;
            div.textContent = sym.emoji;
            inner.appendChild(div);
        }
    }
}

async function spin() {
    if (isSpinning || balance < bet) return;
    isSpinning = true;
    document.getElementById('spinBtn').disabled = true;

    balance -= bet;
    jackpot += Math.floor(bet * 0.035);
    updateUI();

    const results = Array(5).fill().map(() => getWeightedSymbol());

    playSound('spinStart');

    // Improved "huff and puff" style spin with realistic slowdown
    for (let i = 0; i < 5; i++) {
        await spinReel(i, results[i], 380 + i * 170);
    }

    const winAmount = calculateWin(results);
    if (winAmount > 0) {
        balance += winAmount;
        showBigWin(winAmount, results.every(r => r.name === 'Quantum'));
        highlightPaylines();
    }

    updateUI();
    isSpinning = false;
    document.getElementById('spinBtn').disabled = false;

    if (autoSpinning && balance >= bet) setTimeout(spin, 900);
}

async function spinReel(index, finalSymbol, delay) {
    return new Promise(resolve => {
        const reel = document.getElementById(`reel${index+1}-inner`);
        let position = 0;
        let velocity = 68;   // fast start

        const interval = setInterval(() => {
            position -= velocity;
            reel.style.transform = `translateY(${position}px)`;
            if (velocity > 12) velocity *= 0.935;   // smooth deceleration
        }, 16);

        setTimeout(() => {
            clearInterval(interval);
            // Final snap with slight bounce
            const target = - (symbols.indexOf(finalSymbol) * 138 + 80);
            reel.style.transition = 'transform 340ms cubic-bezier(0.33, 1, 0.68, 1)';
            reel.style.transform = `translateY(${target}px)`;
            playSound('reelStop');
            setTimeout(resolve, 420);
        }, delay);
    });
}

function calculateWin(results) {
    let win = 0;
    const count = {};
    results.forEach(s => count[s.name] = (count[s.name] || 0) + 1);

    Object.keys(count).forEach(key => {
        const c = count[key];
        if (c >= 3) {
            const sym = results.find(s => s.name === key);
            win += sym.value * bet * (c - 1.5);
        }
    });
    return Math.floor(win);
}

function showBigWin(amount, isJackpot) {
    const msg = document.getElementById('winMessage');
    msg.textContent = isJackpot ? `JACKPOT!!! +${amount}` : `+${amount}`;
    msg.style.opacity = '1';
    msg.style.color = isJackpot ? '#fcd34d' : '#4ade80';

    if (isJackpot) playSound('jackpot');
    else playSound('bigWin');

    // Screen shake + intense particles
    document.querySelector('.machine').style.transition = 'transform 80ms';
    let shake = 0;
    const shakeInterval = setInterval(() => {
        shake = Math.random() * 12 - 6;
        document.querySelector('.machine').style.transform = `translate(${shake}px, ${shake}px)`;
    }, 50);

    setTimeout(() => {
        clearInterval(shakeInterval);
        document.querySelector('.machine').style.transform = 'translate(0,0)';
    }, 800);

    // More dramatic particles
    for (let i = 0; i < 28; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.fontSize = '3rem';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = '-80px';
            p.style.zIndex = '999';
            p.textContent = ['⚛️','🌀','✨','🌌'][Math.floor(Math.random()*4)];
            document.body.appendChild(p);
            setTimeout(() => {
                p.style.transition = 'all 2.8s cubic-bezier(0.2,0,1,1)';
                p.style.transform = `translateY(${window.innerHeight + 400}px) rotate(${Math.random()*900 - 450}deg)`;
                p.style.opacity = '0';
            }, 40);
            setTimeout(() => p.remove(), 3200);
        }, i * 28);
    }

    setTimeout(() => msg.style.opacity = '0', 3200);
}

function highlightPaylines() {
    document.querySelectorAll('.payline').forEach((l, i) => {
        l.style.opacity = '0.9';
        setTimeout(() => l.style.opacity = '0', 1400 + i*220);
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
    bet = Math.max(10, Math.min(500, bet + delta));
    document.getElementById('betAmount').textContent = bet;
}

function toggleAutoSpin() {
    autoSpinning = !autoSpinning;
    if (autoSpinning && !isSpinning) spin();
}

function showInfo() {
    const modal = document.getElementById('infoModal');
    const list = document.getElementById('paytable');
    list.innerHTML = '';
    symbols.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="color:${s.color}">${s.emoji} ${s.name}</span> — Weight: ${s.weight} | Big multiplier`;
        list.appendChild(li);
    });
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('infoModal').style.display = 'none';
}

document.addEventListener('keydown', e => { if (e.key === ' ' && !isSpinning) { e.preventDefault(); spin(); }});

window.onload = () => {
    initReels();
    updateUI();
    document.getElementById('infoBtn').onclick = showInfo;
    document.getElementById('historyText').textContent = "The Quantum Void is calling...";
};
