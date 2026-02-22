const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tile = 20;
const rows = 28;
const cols = 28;

let map = [];
let pellets = [];
let ghosts = [];

const layout = [
"############################",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#o####.#####.##.#####.####o#",
"#..........................#",
"#.####.##.########.##.####.#",
"#......##....##....##......#",
"######.##### ## #####.######",
"     #.##### ## #####.#     ",
"     #.##          ##.#     ",
"######.## ###GG### ##.######",
"      .   #      #   .      ",
"######.## ######## ##.######",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#o..##................##..o#",
"###.##.##.########.##.##.###",
"#......##....##....##......#",
"#.##########.##.##########.#",
"#..........................#",
"############################"
];

function init() {
    pellets = [];
    ghosts = [];
    map = layout.map(row => row.split(""));

    map.forEach((row,y)=>{
        row.forEach((cell,x)=>{
            if(cell==="."||cell==="o"){
                pellets.push({x,y});
            }
            if(cell==="G"){
                ghosts.push({
                    x,y,
                    dx:1,dy:0,
                    color:"#555"
                });
            }
        });
    });
}

const child = {
    x:14,
    y:15,
    dx:0,
    dy:0
};

function drawWalls(){
    ctx.fillStyle="#0011aa";
    map.forEach((row,y)=>{
        row.forEach((cell,x)=>{
            if(cell==="#"){
                ctx.fillRect(x*tile,y*tile,tile,tile);
            }
        });
    });
}

function drawPellets(){
    ctx.fillStyle="#7a0000";
    pellets.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x*tile+10,p.y*tile+10,3,0,Math.PI*2);
        ctx.fill();
    });
}

function drawChild(){
    ctx.fillStyle="#fff";
    ctx.fillRect(child.x*tile+5,child.y*tile+5,10,10);
}

function drawGhosts(){
    ghosts.forEach(g=>{
        ctx.fillStyle="#888";
        ctx.fillRect(g.x*tile+4,g.y*tile+4,12,12);
    });
}

function isWall(x,y){
    if(y<0||y>=map.length) return true;
    if(x<0||x>=map[0].length) return false;
    return map[y][x]==="#";
}

function moveChild(){
    let nx=child.x+child.dx;
    let ny=child.y+child.dy;

    if(nx<0) nx=map[0].length-1;
    if(nx>=map[0].length) nx=0;

    if(!isWall(nx,ny)){
        child.x=nx;
        child.y=ny;
    }

    pellets=pellets.filter(p=>{
        if(p.x===child.x&&p.y===child.y){
            return false;
        }
        return true;
    });

    if(pellets.length===0){
        window.location.href="dashboard.html";
    }
}

function moveGhosts(){
    ghosts.forEach(g=>{
        let nx=g.x+g.dx;
        let ny=g.y+g.dy;

        if(isWall(nx,ny)){
            const dirs=[
                {dx:1,dy:0},
                {dx:-1,dy:0},
                {dx:0,dy:1},
                {dx:0,dy:-1}
            ];
            const dir=dirs[Math.floor(Math.random()*4)];
            g.dx=dir.dx;
            g.dy=dir.dy;
        }else{
            g.x+=g.dx;
            g.y+=g.dy;
        }

        if(g.x===child.x&&g.y===child.y){
            init();
            child.x=14;
            child.y=15;
        }
    });
}

function update(){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawWalls();
    drawPellets();
    drawChild();
    drawGhosts();
    moveChild();
    moveGhosts();
}

document.addEventListener("keydown",e=>{
    switch(e.key.toLowerCase()){
        case "arrowup":
        case "z": child.dx=0;child.dy=-1;break;
        case "arrowdown":
        case "s": child.dx=0;child.dy=1;break;
        case "arrowleft":
        case "q": child.dx=-1;child.dy=0;break;
        case "arrowright":
        case "d": child.dx=1;child.dy=0;break;
    }
});

init();
setInterval(update,120);
