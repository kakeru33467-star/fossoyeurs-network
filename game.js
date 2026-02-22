const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tile = 30; // plus petit pour map 20x20
let level = 1;
let hasDocument = false;
let gameState = "playing";
let anim = 0;

const levels = [

{
map:[
"####################",
"#......#......#....#",
"#.####.#.####.#.##.#",
"#.#....#....#.#....#",
"#.#.########.#.####.#",
"#.#........#.#......#",
"#.######.##.#.######.#",
"#........##.#........#",
"########.##.########.#",
"#........##.#........#",
"#.######.##.#.######.#",
"#.#......##.#......#.#",
"#.#.##############.#.#",
"#.#.................#.#",
"#.########.##########.#",
"#........#.#...........#",
"#.######.#.#.#########.#",
"#........#.#...........#",
"#........#.............#",
"####################"
],
player:{x:1,y:1},
doc:{x:18,y:1},
exit:{x:18,y:18},
enemies:[
{path:[{x:3,y:1},{x:16,y:1},{x:16,y:8},{x:3,y:8}], speed:350}
]
},

{
map:[
"####################",
"#....#......#......#",
"#.##.#.####.#.####.#",
"#.#..#....#.#.#....#",
"#.#.######.#.#.#.##.#",
"#.#......#.#.#.#.#..#",
"#.######.#.#.#.#.#.##",
"#......#.#.#.#.#.#..#",
"######.#.#.#.#.#.####",
"#......#.#.#.#.#.....#",
"#.######.#.#.#.#####.#",
"#........#.#.#.......#",
"#.########.#.#########",
"#..........#.........#",
"#.##########.#########",
"#.............#......#",
"#.#############.####.#",
"#...............#....#",
"#...............#....#",
"####################"
],
player:{x:1,y:18},
doc:{x:18,y:1},
exit:{x:1,y:1},
enemies:[
{path:[{x:3,y:3},{x:16,y:3},{x:16,y:15},{x:3,y:15}], speed:280},
{path:[{x:10,y:1},{x:10,y:18}], speed:240}
]
},

{
map:[
"####################",
"#.#........#.......#",
"#.#.######.#.#####.#",
"#.#.#....#.#.#...#.#",
"#.#.#.##.#.#.#.#.#.#",
"#...#.#..#.#.#.#.#.#",
"###.#.#.##.#.#.#.#.#",
"#...#.#....#.#.#.#.#",
"#.###.######.#.#.#.#",
"#.....#......#.#.#.#",
"#.#####.######.#.#.#",
"#.#.....#......#.#.#",
"#.#.#####.######.#.#",
"#.#.#.....#........#",
"#.#.#.#####.########",
"#.#.#.#.....#......#",
"#.#.#.#.#####.####.#",
"#...#.#.......#....#",
"#.....#########....#",
"####################"
],
player:{x:1,y:1},
doc:{x:18,y:18},
exit:{x:18,y:1},
enemies:[
{path:[{x:1,y:9},{x:18,y:9}], speed:200},
{path:[{x:9,y:1},{x:9,y:18}], speed:180},
{path:[{x:3,y:3},{x:16,y:16}], speed:160}
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

    enemies = lvl.enemies.map(e => ({
        x:e.path[0].x,
        y:e.path[0].y,
        path:e.path,
        target:1,
        speed:e.speed,
        timer:0,
        vision:1.2
    }));
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
            }else{
                ctx.fillStyle="#1a1714";
                ctx.fillRect(x*tile,y*tile,tile,tile);
            }
        });
    });
}

function drawPlayer(){
    const px = player.x*tile+5;
    const py = player.y*tile+5;

    ctx.fillStyle="#f0ede6";
    ctx.beginPath();
    ctx.arc(px+10,py+6,5,0,Math.PI*2);
    ctx.fill();

    ctx.fillRect(px+7,py+10,6,12);
}

function drawDocument(){
    if(!hasDocument){
        const px = documentItem.x*tile+7;
        const py = documentItem.y*tile+5;

        ctx.fillStyle="#e8e0c8";
        ctx.fillRect(px,py,12,16);
    }
}

function drawExit(){
    ctx.fillStyle="#2f5e3b";
    ctx.fillRect(exitDoor.x*tile+5,exitDoor.y*tile+5,20,20);
}

function drawMatriarche(e){
    const px = e.x*tile+5;
    const py = e.y*tile+5;

    ctx.fillStyle="#111";
    ctx.fillRect(px+5,py+10,10,15);

    ctx.fillStyle="#bdbdbd";
    ctx.beginPath();
    ctx.arc(px+10,py+6,5,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="rgba(200,0,0,0.15)";
    ctx.beginPath();
    ctx.arc(e.x*tile+15,e.y*tile+15,tile*e.vision,0,Math.PI*2);
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

        const dist = Math.hypot(e.x-player.x,e.y-player.y);
        if(dist < e.vision){
            loadLevel();
        }
    });
}

let lastTime=0;

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
        level++;
        if(level>3){
            setTimeout(()=>window.location.href="dashboard.html",1500);
        }else{
            loadLevel();
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

loadLevel();
requestAnimationFrame(update);
