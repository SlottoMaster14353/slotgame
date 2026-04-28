// =========================
// VOIDSPIN v2 ENGINE
// =========================

// SYMBOL CONFIG (RTP CONTROLLED)
const symbols = [
{e:"⚛️",v:120,w:6},
{e:"🌀",v:70,w:10},
{e:"🌌",v:40,w:14},
{e:"🔮",v:25,w:18},
{e:"⚡",v:15,w:25},
{e:"🌠",v:10,w:30}
];

let balance=5000;
let bet=50;
let jackpot=12500;
let spinning=false;
let holdModeOn=false;

// create reels
const reelsDiv=document.getElementById("reels");
let reels=[];

for(let i=0;i<5;i++){
let r=document.createElement("div");
r.className="reel";
r.innerHTML="<div></div>";
reels.push(r.firstChild);
r.appendChild(r.firstChild);
reelsDiv.appendChild(r);
}

// =========================
// TRUE WEIGHTED RNG
// =========================
function pick(){
let total=symbols.reduce((a,b)=>a+b.w,0);
let r=Math.random()*total;

for(let s of symbols){
r-=s.w;
if(r<=0) return s;
}
return symbols[0];
}

// =========================
// PHYSICS REEL ENGINE
// =========================
function spinReel(el, finalSymbol, delay){
return new Promise(res=>{
let pos=0;
let vel=70;

let loop=setInterval(()=>{
pos-=vel;
vel*=0.92;
el.style.transform=`translateY(${pos}px)`;
},16);

setTimeout(()=>{
clearInterval(loop);
el.innerHTML=finalSymbol.e.repeat(6)
.split("")
.map(e=>`<div class="symbol">${finalSymbol.e}</div>`)
.join("");

res();
},delay);
});
}

// =========================
// MAIN SPIN
// =========================
async function spin(){
if(spinning||balance<bet) return;
spinning=true;

balance-=bet;
jackpot+=Math.floor(bet*0.04);

let result=[];
for(let i=0;i<5;i++) result.push(pick());

await Promise.all(reels.map((r,i)=>spinReel(r,result[i],400+i*180)));

let win=calculate(result);

if(win>0){
balance+=win;
showWin(win);
}

if(result.every(x=>x.e==="⚛️")){
openWheel(); // BONUS WHEEL
}

update();
spinning=false;
}

// =========================
// WIN ENGINE
// =========================
function calculate(res){
let win=0;
let map={};

res.forEach(s=>map[s.e]=(map[s.e]||0)+1);

for(let k in map){
if(map[k]>=3){
let s=symbols.find(x=>x.e===k);
win+=s.v*bet*map[k];
}
}

return Math.floor(win);
}

// =========================
// BONUS WHEEL
// =========================
function openWheel(){
document.getElementById("wheelModal").style.display="flex";
document.getElementById("wheel").innerText="SPINNING BONUS...";
setTimeout(()=>{
let reward=Math.floor(Math.random()*5000)+1000;
balance+=reward;
document.getElementById("wheel").innerText="+"+reward;
update();
},2000);
}

function closeWheel(){
document.getElementById("wheelModal").style.display="none";
}

// =========================
// UI
// =========================
function update(){
document.getElementById("bal").innerText=balance;
document.getElementById("bet").innerText=bet;
document.getElementById("jackpot").innerText=jackpot;
document.getElementById("spin").onclick=spin;
}

function changeBet(x){
bet=Math.max(10,bet+x);
update();
}

function auto(){
setInterval(spin,2000);
}

function holdMode(){
holdModeOn=!holdModeOn;
alert("Hold Mode: "+holdModeOn);
}

// init
update();
