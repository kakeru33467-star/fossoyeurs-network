const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dungeonMusic = document.getElementById("dungeonMusic");
const loseSound = document.getElementById("loseSound");
const winSound = document.getElementById("winSound");

const tile = 40;
let level = 1;
let hasDocument = false;
let anim = 0;
let lastTime = 0;
let isDead = false;

const levels = [/* --- TES NIVEAUX RESTENT IDENTIQUES --- */
{
map:[
"###############",
"#.....#.......#",
"#.....#.......#",
"#.....#####...#",
"###.#######.###",
"#.............#",
"#.#####.#####.#",
"#.#...........#",
"#.#.#########.#",
"#.#...........#",
"#.#####.#####.#",
"#.............#",
"###.#######.###",
"#.............#",
"###############"
],
player:{x:1,y:1},
doc:{x:13,y:1},
exit:{x:13,y:13},
enemies:[
{path:[{x:5,y:5},{x:9,y:5},{x:9,y:9},{x:5,y:9}], speed:400}
]
},
{
map:[
"###############",
"#.............#",
"#.###########.#",
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
],
player:{x:1,y:13},
doc:{x:13,y:1},
exit:{x:1,y:1},
enemies:[
{path:[{x:1,y:7},{x:13,y:7}], speed:300},
{path:[{x:7,y:1},{x:7,y:13}], speed:260}
]
},
{
map:[
"###############",
"#.....#.......#",
"#.###.#.#####.#",
"#.#...#.....#.#",
"#.#.#######.#.#",
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
],
player:{x:1,y:1},
doc:{x:13,y:13},
exit:{x:13,y:1},
enemies:[
{path:[{x:1,y:7},{x:13,y:7}], speed:250},
{path:[{x:7,y:1},{x:7,y:13}], speed:220},
{path:[{x:3,y:3},{x:11,y:11}], speed:200}
]
}
];

let dungeon, player, documentItem, exitDoor, enemies;

function loadLevel(){
    const lvl = levels[level-1];
    dungeon = lvl.map;
    player = {...lvl.player};
    documentItem = {...lvl.doc};
    exitDoor = {...lvl.exit};
    hasDocument = false;
    isDead = false;

    enemies = lvl.enemies.map(e => ({
        x:e.path[0].x,
        y:e.path[0].y,
        path:e.path,
        target:1,
        speed:e.speed,
        timer:0
    }));
}

function isWall(x,y){
    return dungeon[y][x] === "#";
}

function drawMap(){
    dungeon.forEach((row,y)=>{
        row.split("").forEach((cell,x)=>{
            ctx.fillStyle = cell === "#" ? "#3b332c" : "#1a1714";
            ctx.fillRect(x*tile,y*tile,tile,tile);
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
}

function drawDocument(){
    if(!hasDocument){
        const px = documentItem.x*tile+12;
        const py = documentItem.y*tile+12;
        ctx.fillStyle="#e8e0c8";
        ctx.fillRect(px,py,16,20);
    }
}

function drawExit(){
    const px = exitDoor.x*tile+10;
    const py = exitDoor.y*tile+10;
    ctx.fillStyle="#2f5e3b";
    ctx.fillRect(px,py,20,30);
}

function drawMatriarche(e){
    const px = e.x*tile+10;
    const py = e.y*tile+10;

    ctx.fillStyle="#111";
    ctx.fillRect(px+6,py+14,12,18);

    ctx.fillStyle="rgba(200,0,0,0.15)";
    ctx.beginPath();
    ctx.arc(e.x*tile+20,e.y*tile+20,tile*1.2,0,Math.PI*2);
    ctx.fill();
}

function moveEnemies(delta){
    enemies.forEach(e=>{

        e.timer += delta;
        if(e.timer >= e.speed){
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

        const playerCenterX = player.x * tile + tile/2;
        const playerCenterY = player.y * tile + tile/2;
        const enemyCenterX = e.x * tile + tile/2;
        const enemyCenterY = e.y * tile + tile/2;

        const distance = Math.hypot(
            playerCenterX - enemyCenterX,
            playerCenterY - enemyCenterY
        );

        const dangerRadius = tile * 1.2;

        if(distance < dangerRadius && !isDead){
            isDead = true;

            loseSound.currentTime = 0;
            loseSound.play();

            setTimeout(()=>{
                loadLevel();
            },600);
        }
    });
}

function update(timestamp){
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawMap();
    drawDocument();
    drawExit();
    drawPlayer();
    enemies.forEach(drawMatriarche);

    moveEnemies(delta);

    if(player.x===documentItem.x && player.y===documentItem.y){
        hasDocument=true;
    }

    if(player.x===exitDoor.x && player.y===exitDoor.y && hasDocument){

        winSound.currentTime = 0;
        winSound.play();

        level++;

        if(level>3){
            setTimeout(()=>window.location.href="dashboard.html",1500);
        }else{
            setTimeout(()=>loadLevel(),800);
        }
    }

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

/* 🎵 Lancement musique au premier clic */
document.addEventListener("click",()=>{
    dungeonMusic.volume = 0.4;
    dungeonMusic.play().catch(()=>{});
},{once:true});

loadLevel();
requestAnimationFrame(update);
