const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tile = 40;

let level = 1;
let hasDocument = false;
let gameState = "playing";
let anim = 0;

const dungeon = [
"###############",
"#.....#...#...#",
"#.###.#.#.#.#.#",
"#.#...#.#...#.#",
"#.#.###.#####.#",
"#...#.....#...#",
"###.#.###.#.###",
"#...#.#...#...#",
"#.###.#.###.#.#",
"#.....#.....#.#",
"#.#####.#####.#",
"#.......#.....#",
"#.#####.#.###.#",
"#.....#...#...#",
"###############"
];

let player, documentItem, exitDoor, enemies;

function initLevel() {
    player = { x: 1, y: 1 };
    documentItem = { x: 13, y: 1 };
    exitDoor = { x: 13, y: 13 };
    hasDocument = false;
    gameState = "playing";

    enemies = [];

    // Boucle centrale carrée
    enemies.push(createMatriarche([
        {x:3,y:1},{x:11,y:1},
        {x:11,y:9},{x:3,y:9}
    ], 600));

    if(level >= 2){
        // Patrouille verticale
        enemies.push(createMatriarche([
            {x:7,y:1},{x:7,y:13}
        ], 500));
    }

    if(level >= 3){
        // Patrouille horizontale critique
        enemies.push(createMatriarche([
            {x:1,y:7},{x:13,y:7}
        ], 450));
    }
}

function createMatriarche(path, delay){
    return {
        x:path[0].x,
        y:path[0].y,
        path:path,
        target:1,
        delay:delay,
        timer:0,
        vision:1.5
    };
}

function isWall(x,y){
    return dungeon[y][x] === "#";
}

function drawMap(){
    dungeon.forEach((row,y)=>{
        row.split("").forEach((cell,x)=>{
            if(cell==="#"){
                ctx.fillStyle="#3b332c";
                ctx.fillRect(x*tile,y*tile,tile,tile);
                ctx.strokeStyle="#2a241f";
                ctx.strokeRect(x*tile,y*tile,tile,tile);
            }else{
                ctx.fillStyle="#1a1714";
                ctx.fillRect(x*tile,y*tile,tile,tile);
            }
        });
    });
}

function drawPlayer(){
    const px = player.x*tile+10;
    const py = player.y*tile+10;

    ctx.fillStyle="#f0ede6";
    ctx.beginPath();
    ctx.arc(px+12,py+8,6,0,Math.PI*2);
    ctx.fill();

    ctx.fillRect(px+8,py+14,8,14);

    if(anim%20<10){
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

        ctx.fillStyle="#e8e0c8";
        ctx.fillRect(px,py,16,20);

        ctx.fillStyle="#b0a890";
        ctx.fillRect(px+3,py+5,10,2);
        ctx.fillRect(px+3,py+10,10,2);
    }
}

function drawExit(){
    ctx.fillStyle="#2f5e3b";
    ctx.fillRect(exitDoor.x*tile+8,exitDoor.y*tile+8,24,24);
}

function drawMatriarche(e){
    const px = e.x*tile+10;
    const py = e.y*tile+10;

    ctx.fillStyle="#101010";
    ctx.fillRect(px+6,py+14,12,18);

    ctx.fillStyle="#bdbdbd";
    ctx.beginPath();
    ctx.arc(px+12,py+8,6,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="rgba(200,0,0,0.15)";
    ctx.beginPath();
    ctx.arc(e.x*tile+20,e.y*tile+20,tile*e.vision,0,Math.PI*2);
    ctx.fill();
}

function moveEnemies(delta){
    enemies.forEach(e=>{
        e.timer += delta;

        if(e.timer >= e.delay){
            e.timer = 0;

            const target = e.path[e.target];

            if(e.x < target.x) e.x++;
            else if(e.x > target.x) e.x--;
            else if(e.y < target.y) e.y++;
            else if(e.y > target.y) e.y--;

            if(e.x === target.x && e.y === target.y){
                e.target = (e.target+1)%e.path.length;
            }
        }

        const dist = Math.hypot(e.x-player.x,e.y-player.y);
        if(dist < e.vision){
            initLevel();
        }
    });
}

function drawHUD(){
    ctx.fillStyle="#aaa";
    ctx.font="16px monospace";
    ctx.fillText("NIVEAU "+level,20,20);
}

function drawVictory(){
    ctx.fillStyle="rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#e8e0c8";
    ctx.font="40px monospace";
    ctx.fillText("VALIDATION",150,250);
    ctx.fillText("ACCEPTÉE",150,300);
}

let lastTime = 0;

function update(timestamp){
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawDocument();
    drawExit();
    drawPlayer();
    enemies.forEach(drawMatriarche);
    drawHUD();

    moveEnemies(delta);

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

    if(gameState==="win"){
        drawVictory();
    }

    anim++;
    requestAnimationFrame(update);
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
requestAnimationFrame(update);
