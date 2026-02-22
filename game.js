const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tile = 40;
const size = 15;

let level = 1;
let hasDocument = false;

const dungeon = [
"###############",
"#.............#",
"#.#####.#####.#",
"#.#...........#",
"#.#.#########.#",
"#.#.#.......#.#",
"#...#.#####.#.#",
"###.#.#...#.#.#",
"#...#.#.#.#.#.#",
"#.###.#.#.#.#.#",
"#.....#.#.#...#",
"#.#####.#.#####",
"#.............#",
"#.............#",
"###############"
];

let player;
let documentItem;
let exitDoor;
let enemies = [];

function initLevel() {
    player = { x: 1, y: 1 };
    documentItem = { x: 13, y: 1 };
    exitDoor = { x: 13, y: 13 };
    hasDocument = false;

    enemies = [];

    enemies.push(createMatriarche([
        {x:3,y:3},
        {x:11,y:3},
        {x:11,y:11},
        {x:3,y:11}
    ]));

    if(level >= 2){
        enemies.push(createMatriarche([
            {x:7,y:1},
            {x:7,y:13}
        ]));
    }

    if(level >= 3){
        enemies.push(createMatriarche([
            {x:1,y:7},
            {x:13,y:7}
        ]));
    }
}

function createMatriarche(path){
    return {
        x:path[0].x,
        y:path[0].y,
        path:path,
        target:1,
        speed:0.05 + level*0.01
    };
}

function drawMap(){
    dungeon.forEach((row,y)=>{
        row.split("").forEach((cell,x)=>{
            if(cell==="#"){
                ctx.fillStyle="#2b2b2b";
                ctx.fillRect(x*tile,y*tile,tile,tile);
                ctx.strokeStyle="#1a1a1a";
                ctx.strokeRect(x*tile,y*tile,tile,tile);
            }else{
                ctx.fillStyle="#111";
                ctx.fillRect(x*tile,y*tile,tile,tile);
            }
        });
    });
}

function drawPlayer(){
    const px = player.x*tile+10;
    const py = player.y*tile+10;

    ctx.fillStyle="#f5f5f5";
    ctx.fillRect(px+8,py+8,8,16); // corps

    ctx.beginPath(); // tête
    ctx.arc(px+12,py+6,6,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#000"; // yeux
    ctx.fillRect(px+10,py+4,2,2);
    ctx.fillRect(px+14,py+4,2,2);
}

function drawMatriarche(e){
    const px = e.x*tile+10;
    const py = e.y*tile+10;

    ctx.fillStyle="#111"; // robe
    ctx.fillRect(px+6,py+10,12,16);

    ctx.fillStyle="#aaa"; // tête
    ctx.beginPath();
    ctx.arc(px+12,py+6,6,0,Math.PI*2);
    ctx.fill();
}

function drawDocument(){
    if(!hasDocument){
        ctx.fillStyle="#7a0000";
        ctx.fillRect(documentItem.x*tile+14,documentItem.y*tile+14,12,12);
    }
}

function drawExit(){
    ctx.fillStyle="#004422";
    ctx.fillRect(exitDoor.x*tile+10,exitDoor.y*tile+10,20,20);
}

function isWall(x,y){
    return dungeon[y][x]==="#";
}

function moveEnemies(){
    enemies.forEach(e=>{
        const target = e.path[e.target];
        const dx = target.x - e.x;
        const dy = target.y - e.y;

        if(Math.abs(dx)>0){
            e.x += Math.sign(dx)*e.speed;
        }
        if(Math.abs(dy)>0){
            e.y += Math.sign(dy)*e.speed;
        }

        if(Math.round(e.x)===target.x && Math.round(e.y)===target.y){
            e.target = (e.target+1)%e.path.length;
        }

        if(Math.round(e.x)===player.x && Math.round(e.y)===player.y){
            initLevel();
        }
    });
}

function drawHUD(){
    ctx.fillStyle="#999";
    ctx.font="16px monospace";
    ctx.fillText("NIVEAU "+level,20,20);
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawDocument();
    drawExit();
    drawPlayer();
    enemies.forEach(drawMatriarche);
    drawHUD();

    if(player.x===documentItem.x && player.y===documentItem.y){
        hasDocument=true;
    }

    if(player.x===exitDoor.x && player.y===exitDoor.y && hasDocument){
        level++;
        if(level>3){
            window.location.href="dashboard.html";
        }else{
            initLevel();
        }
    }

    moveEnemies();
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
