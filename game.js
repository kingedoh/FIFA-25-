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
