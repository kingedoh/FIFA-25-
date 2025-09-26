window.onload = function() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const teams = {
    "Liverpool": ["Salah","Van Dijk","Alisson","Diaz","Nunez","Arnold","Mac Allister","Szoboszlai","Konate","Robertson","Jones"],
    "Manchester United": ["Rashford","Fernandes","Casemiro","Martinez","Onana","Antony","Hojlund","Eriksen","Shaw","Dalot","Varane"],
    "Manchester City": ["Haaland","De Bruyne","Foden","Rodri","Ederson","Walker","Dias","Stones","Bernardo","Ake","Alvarez"],
    "Chelsea": ["Sterling","Enzo","Mudryk","Nkunku","Palmer","James","Cucurella","Gallagher","Silva","Jackson","Sanchez"]
  };

  const playerTeamSelect = document.getElementById("playerTeam");
  const aiTeamSelect = document.getElementById("aiTeam");
  const difficultySelect = document.getElementById("difficulty");
  const startMatchBtn = document.getElementById("startMatch");
  const splashScreen = document.getElementById("splashScreen");

  // populate team dropdowns
  Object.keys(teams).forEach(team => {
    let option1 = document.createElement("option"); option1.value = team; option1.textContent = team; playerTeamSelect.appendChild(option1);
    let option2 = document.createElement("option"); option2.value = team; option2.textContent = team; aiTeamSelect.appendChild(option2);
  });

  let players = [];
  let ball = { x: 400, y: 250, owner: null };
  let selectedPlayerIndex = 0;

  startMatchBtn.onclick = function() {
    let playerTeam = playerTeamSelect.value;
    let aiTeam = aiTeamSelect.value;

    if(!playerTeam || !aiTeam){ alert("Select both teams!"); return; }

    // hide splash screen
    splashScreen.style.display = "none";

    // initialize players
    players = [];
    let allPlayers = [...teams[playerTeam], ...teams[aiTeam]];

    allPlayers.forEach((name,i)=>{
      players.push({
        name,
        x: (i<11 ? 200 : 600) + Math.random()*50,
        y: 50 + (i%11)*35,
        team: i<11 ? playerTeam : aiTeam,
        hasBall: i===0
      });
    });

    ball.owner = players[0];
    selectedPlayerIndex = 0;
    drawGame();
  };

  function drawGame() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // draw vertical pitch (90°)
    ctx.fillStyle="green";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw players
    players.forEach((p,i)=>{
      ctx.beginPath();
      ctx.arc(p.y,p.x,15,0,Math.PI*2);
      ctx.fillStyle = (i===selectedPlayerIndex) ? "yellow" : (p.team===playerTeamSelect.value ? "red" : "blue");
      ctx.fill();
      ctx.stroke();

      // name above player
      ctx.fillStyle="white";
      ctx.font="12px Arial";
      ctx.textAlign="center";
      ctx.fillText(p.name,p.y,p.x-20);

      // ball indicator
      if(p.hasBall){
        ctx.beginPath();
        ctx.arc(p.y,p.x+25,7,0,Math.PI*2);
        ctx.fillStyle="white";
        ctx.fill();
      }
    });

    requestAnimationFrame(drawGame);
  }

  // controls
  document.addEventListener("keydown", e=>{
    let p = players[selectedPlayerIndex];
    if(!p) return;

    switch(e.key){
      case "ArrowUp": p.x-=5; break;
      case "ArrowDown": p.x+=5; break;
      case "ArrowLeft": p.y-=5; break;
      case "ArrowRight": p.y+=5; break;
      case " ": selectedPlayerIndex=(selectedPlayerIndex+1)%players.length; break;
    }
  });
};
nvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let playerTeam=[], aiTeam=[], ball={x:400,y:250,radius:10,color:'white',vx:0,vy:0};
let playerScore=0, aiScore=0, activePlayerIndex=0;
let splashActive=true, lineupActive=false;
let currentDifficulty="Normal";

const difficulties = {
  Easy:{aiSpeedMultiplier:0.6, ballSpeedMultiplier:0.8},
  Normal:{aiSpeedMultiplier:0.8, ballSpeedMultiplier:1},
  Amateur:{aiSpeedMultiplier:1, ballSpeedMultiplier:1.1},
  Hard:{aiSpeedMultiplier:1.2, ballSpeedMultiplier:1.2},
  Expert:{aiSpeedMultiplier:1.5, ballSpeedMultiplier:1.5}
};

// Placeholder sprites
const playerSprites=[];
for(let i=1;i<=11;i++){
  const img=new Image();
  img.src=`images/sprites/player${i}.png`;
  playerSprites.push(img);
}

// Example clubs
const clubs=[
  {name:"Liverpool", players:["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11"]},
  {name:"Manchester United", players:["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11"]},
  {name:"Manchester City", players:["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11"]},
  {name:"Chelsea", players:["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10","P11"]}
];

// Populate team selectors
const playerSelect=document.getElementById('playerTeamSelect');
const aiSelect=document.getElementById('aiTeamSelect');
clubs.forEach(c=>{
  let o1=document.createElement('option'); o1.value=c.name; o1.text=c.name; playerSelect.add(o1);
  let o2=document.createElement('option'); o2.value=c.name; o2.text=c.name; aiSelect.add(o2);
});

// Virtual analog stick
const stickContainer=document.getElementById('analogContainer');
const stick=document.getElementById('stick');
let stickTouchId=null, stickX=0, stickY=0;

function updateStick(e){
  const rect=stickContainer.getBoundingClientRect();
  const dx=(e.clientX||e.pageX)-(rect.left+rect.width/2);
  const dy=(e.clientY||e.pageY)-(rect.top+rect.height/2);
  const max=rect.width/2-stick.offsetWidth/2;
  const distance=Math.min(Math.sqrt(dx*dx+dy*dy),max);
  const angle=Math.atan2(dy,dx);
  const x=Math.cos(angle)*distance;
  const y=Math.sin(angle)*distance;
  stick.style.transform=`translate(${x}px,${y}px)`;
  stickX=x/max; stickY=y/max;
}

stickContainer.addEventListener('touchstart',e=>{if(!stickTouchId){stickTouchId=e.changedTouches[0].identifier; updateStick(e.changedTouches[0]);}});
stickContainer.addEventListener('touchmove',e=>{for(let t of e.changedTouches){if(t.identifier===stickTouchId) updateStick(t);} e.preventDefault();});
stickContainer.addEventListener('touchend',e=>{for(let t of e.changedTouches){if(t.identifier===stickTouchId){stickTouchId=null; stick.style.transform=`translate(0,0)`; stickX=0; stickY=0;}}});
stickContainer.addEventListener('mousedown',e=>{stickTouchId='mouse'; updateStick(e);});
document.addEventListener('mousemove',e=>{if(stickTouchId==='mouse') updateStick(e);});
document.addEventListener('mouseup',e=>{if(stickTouchId==='mouse'){stickTouchId=null; stick.style.transform=`translate(0,0)`; stickX=0; stickY=0;}});

// Action and Switch buttons
document.getElementById('action').addEventListener('click', passBall);
document.getElementById('switch').addEventListener('click', ()=>{activePlayerIndex=(activePlayerIndex+1)%playerTeam.length;});

// Start match
document.getElementById('startMatchBtn').addEventListener('click',()=>{
  const playerTeamName=playerSelect.value, aiTeamName=aiSelect.value;
  currentDifficulty=document.getElementById('difficulty').value;
  playerTeam=[]; aiTeam=[];
  clubs.find(c=>c.name===playerTeamName).players.forEach((p,i)=>playerTeam.push({name:p,x:50+i*60,y:canvas.height+50,width:20,height:20,speed:2,sprite:playerSprites[i%playerSprites.length],targetY:400}));
  clubs.find(c=>c.name===aiTeamName).players.forEach((p,i)=>aiTeam.push({name:p,x:50+i*60,y:-50,width:20,height:20,speed:2,sprite:playerSprites[i%playerSprites.length],targetY:100}));
  splashActive=false; lineupActive=true; gameLoop();
});

// Smart pass
function passBall(){
  const active=playerTeam[activePlayerIndex]; 
  let nearest=playerTeam[0], minDist=1e9;
  playerTeam.forEach(p=>{
    const d=Math.hypot(p.x-active.x,p.y-active.y);
    if(d<minDist && p!==active){ minDist=d; nearest=p;}
  });
  ball.vx=(nearest.x-active.x)*0.2*difficulties[currentDifficulty].ballSpeedMultiplier;
  ball.vy=(nearest.y-active.y)*0.2*difficulties[currentDifficulty].ballSpeedMultiplier;
  ball.x=active.x; ball.y=active.y;
}

// Draw all game elements
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw AI team
  aiTeam.forEach(p=>{
    ctx.drawImage(p.sprite,p.x,p.y,p.width,p.width);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, p.x + p.width/2, p.y - 5);
  });

  // Draw player team
  playerTeam.forEach((p,i)=>{
    ctx.drawImage(p.sprite,p.x,p.y,p.width,p.width);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, p.x + p.width/2, p.y - 5);

    // Highlight active player
    if(i === activePlayerIndex){
      ctx.strokeStyle = 'yellow';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.width/2, p.width, 0, Math.PI*2);
      ctx.stroke();
