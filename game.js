const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tile = 40;
const size = 15;

let level = 1;
let hasDocument = false;
let gameState = "playing";
let animationFrame = 0;

const dungeon = [
"###############",
"#.....#.......#",
"#.###.#.#####.#",
"#.#...#.....#.#",
"#.#.#######.#.#",
"#.#.#.....#.#.#",
"#...#.###.#...#",
"###.#.#.#.#.###",
"#...#.#.#.#...#",
"#.###.#.#.###.#",
"#.....#.#.....#",
"#.#####.#.#####",
"#.......#.....#",
"#.......#.....#",
"###############"
];

let player, documentItem, exitDoor, enemies;

function initLevel() {
    player = { x: 1, y: 1, step: 0 };
    documentItem = { x: 13, y: 1 };
    exitDoor = { x: 13, y: 13 };
    hasDocument = false;
    gameState = "playing";

    enemies = [
        createMatriarche([
            {x:3,y:1},{x:11,y:1},{x:11,y:7},{x:3,y:7}
        ]),
        ...(level >= 2 ? [createMatriarche([
            {x:5,y:9},{x:9,y:9},{x:9,y:13},{x:5,y:13}
        ])] : []),
        ...(level >= 3 ? [createMatriarche([
            {x:1,y:5},{x:13,y:5}
        ])] : [])
    ];
}

function createMatriarche(path){
    return {
        x:path[0].x,
        y:path[0].y,
        path:path,
        target:1,
        dir:{x:1,y:0},
        speed:0.08 + level*0.02
    };
}

function isWall(x,y){
    return dungeon[y][x] === "#";
}

function drawMap(){
    dungeon.forEach((row,y)=>{
        row.split("").forEach((cell,x)=>{
            if(cell==="#"){
                ctx.fillStyle="#2d2a26";
                ctx.fillRect(x*tile,y*tile,tile,tile);
            }else{
                ctx.fillStyle="#12100e";
                ctx.fillRect(x*tile,y*tile,tile,tile);
            }
        });
    });
}

function drawPlayer(){
    const px = player.x*tile+10;
    const py = player.y*tile+10;

    ctx.fillStyle="#f4f1e8";
    ctx.beginPath();
    ctx.arc(px+12,py+8,6,0,Math.PI*2);
    ctx.fill();

    ctx.fillRect(px+8,py+14,8,14);

    if(animationFrame%20<10){
        ctx.fillRect(px+6,py+26,4,6);
        ctx.fillRect(px+14,py+26,4,6);
    }else{
        ctx.fillRect(px+8,py+26,4,6);
        ctx.fillRect(px+12,py+26,4,6);
    }
}

function drawDocument(){
    if(!hasDocument){
        const px = documentItem.x*tile+12;
        const py = documentItem.y*tile+12;

        ctx.fillStyle="#e8e2cf";
        ctx.fillRect(px,py,16,20);

        ctx.fillStyle="#aaa";
        ctx.fillRect(px+3,py+5,10,2);
        ctx.fillRect(px+3,py+10,10,2);
    }
}

function drawExit(){
    ctx.fillStyle="#3a5f3a";
    ctx.fillRect(exitDoor.x*tile+8,exitDoor.y*tile+8,24,24);
}

function drawMatriarche(e){
    const px = e.x*tile+10;
    const py = e.y*tile+10;

    ctx.fillStyle="#0f0f0f";
    ctx.fillRect(px+6,py+14,12,18);

    ctx.fillStyle="#bbb";
    ctx.beginPath();
    ctx.arc(px+12,py+8,6,0,Math.PI*2);
    ctx.fill();

    drawVisionCone(e);
}

function drawVisionCone(e){
    ctx.fillStyle="rgba(255,0,0,0.08)";
    ctx.beginPath();
    ctx.moveTo(e.x*tile+20,e.y*tile+20);
    ctx.arc(e.x*tile+20,e.y*tile+20,80,0,Math.PI*2);
    ctx.fill();
}

function moveEnemies(){
    enemies.forEach(e=>{
        const target = e.path[e.target];
        const dx = target.x - e.x;
        const dy = target.y - e.y;

        if(Math.abs(dx)>0){
            let nx = e.x + Math.sign(dx)*e.speed;
            if(!isWall(Math.round(nx),e.y)) e.x = nx;
        }
        if(Math.abs(dy)>0){
            let ny = e.y + Math.sign(dy)*e.speed;
            if(!isWall(e.x,Math.round(ny))) e.y = ny;
        }

        if(Math.round(e.x)===target.x && Math.round(e.y)===target.y){
            e.target = (e.target+1)%e.path.length;
        }

        const dist = Math.hypot(e.x-player.x,e.y-player.y);
        if(dist<0.6){
            initLevel();
        }
    });
}

function drawFog(){
    ctx.fillStyle="rgba(0,0,0,0.85)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.globalCompositeOperation="destination-out";
    ctx.beginPath();
    ctx.arc(player.x*tile+20,player.y*tile+20,100,0,Math.PI*2);
    ctx.fill();
    ctx.globalCompositeOperation="source-over";
}

function drawHUD(){
    ctx.fillStyle="#999";
    ctx.font="16px monospace";
    ctx.fillText("NIVEAU "+level,20,20);
}

function drawVictory(){
    ctx.fillStyle="rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#e8e2cf";
    ctx.font="40px monospace";
    ctx.fillText("VALIDATION",150,250);
    ctx.fillText("ACCEPTÉE",150,300);
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawDocument();
    drawExit();
    drawPlayer();
    enemies.forEach(drawMatriarche);
    drawHUD();

    moveEnemies();

    if(player.x===documentItem.x && player.y===documentItem.y){
        hasDocument=true;
    }

    if(player.x===exitDoor.x && player.y===exitDoor.y && hasDocument){
        level++;
        if(level>3){
            gameState="win";
            setTimeout(()=>window.location.href="dashboard.html",2000);
        }else{
            initLevel();
        }
    }

    drawFog();

    if(gameState==="win"){
        drawVictory();
    }

    animationFrame++;
}

document.addEventListener("keydown",e=>{
    let nx=player.x;
    let ny=player.y;

    switch(e.key.toLowerCase()){
        case "arrowup":
        case "z": ny--; break;
        case "arrowdown":
        case "s": ny++; break;
        case "arrowleft":
        case "q": nx--; break;
        case "arrowright":
        case "d": nx++; break;
    }

    if(!isWall(nx,ny)){
        player.x=nx;
        player.y=ny;
    }
});

initLevel();
setInterval(update,40);
