const canvas = document.getElementById('gameCanvas');
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
    }
  });

  // Highlight player with the ball
  let ballHolder = null;
  playerTeam.concat(aiTeam).forEach(p=>{
    if(Math.hypot(p.x - ball.x, p.y - ball.y) < 20){ ballHolder = p; }
  });
  if(ballHolder){
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballHolder.x + ballHolder.width/2, ballHolder.y + ballHolder.width/2, ballHolder.width+5, 0, Math.PI*2);
    ctx.stroke();
  }

  // Draw ball
  ctx.fillStyle=ball.color;
  ctx.beginPath();
  ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);
  ctx.fill();

  // Update scoreboard
  document.getElementById('scoreboard').innerText=`Score: ${playerScore} | AI: ${aiScore}`;
}

// Main game loop
function
