const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 20;

const map = [
"############################",
"#............##............#",
"#.####.#####.##.#####.####.#",
"#o####.#####.##.#####.####o#",
"#.####.#####.##.#####.####.#",
"#..........................#",
"#.####.##.########.##.####.#",
"#.####.##.########.##.####.#",
"#......##....##....##......#",
"######.##### ## #####.######",
"     #.##### ## #####.#     ",
"     #.##          ##.#     ",
"     #.## ###GG### ##.#     ",
"######.## #      # ##.######",
"      .   #      #   .      ",
"######.## #      # ##.######",
"     #.## ######## ##.#     ",
"     #.##          ##.#     ",
"     #.## ######## ##.#     ",
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

let pellets = [];
let ghosts = [];

const pacman = {
    x: 14,
    y: 23,
    dx: 0,
    dy: 0
};

function init() {
    pellets = [];
    ghosts = [];

    map.forEach((row, y) => {
        row.split("").forEach((cell, x) => {
            if (cell === "." || cell === "o") {
                pellets.push({x, y});
            }
            if (cell === "G") {
                ghosts.push({
                    x,
                    y,
                    dx: Math.random() < 0.5 ? 1 : -1,
                    dy: 0
                });
            }
        });
    });
}

function drawMap() {
    map.forEach((row, y) => {
        row.split("").forEach((cell, x) => {
            if (cell === "#") {
                ctx.fillStyle = "#111";
                ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
            }
        });
    });
}

function drawPellets() {
    ctx.fillStyle = "#aaa";
    pellets.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x*tileSize+10, p.y*tileSize+10, 3, 0, Math.PI*2);
        ctx.fill();
    });
}

function drawPacman() {
    ctx.fillStyle = "#7a0000";
    ctx.beginPath();
    ctx.arc(pacman.x*tileSize+10, pacman.y*tileSize+10, 8, 0.2*Math.PI, 1.8*Math.PI);
    ctx.lineTo(pacman.x*tileSize+10, pacman.y*tileSize+10);
    ctx.fill();
}

function drawGhosts() {
    ctx.fillStyle = "#444";
    ghosts.forEach(g => {
        ctx.fillRect(g.x*tileSize, g.y*tileSize, tileSize, tileSize);
    });
}

function isWall(x,y) {
    return map[y][x] === "#";
}

function movePacman() {
    let nextX = pacman.x + pacman.dx;
    let nextY = pacman.y + pacman.dy;

    if (nextX < 0) nextX = map[0].length-1;
    if (nextX >= map[0].length) nextX = 0;

    if (!isWall(nextX,nextY)) {
        pacman.x = nextX;
        pacman.y = nextY;
    }

    pellets = pellets.filter(p => !(p.x===pacman.x && p.y===pacman.y));

    if (pellets.length === 0) {
        window.location.href = "dashboard.html";
    }
}

function moveGhosts() {
    ghosts.forEach(g => {
        let nextX = g.x + g.dx;
        let nextY = g.y + g.dy;

        if (isWall(nextX,nextY)) {
            const dirs = [
                {dx:1,dy:0},
                {dx:-1,dy:0},
                {dx:0,dy:1},
                {dx:0,dy:-1}
            ];
            const dir = dirs[Math.floor(Math.random()*4)];
            g.dx = dir.dx;
            g.dy = dir.dy;
        } else {
            g.x += g.dx;
            g.y += g.dy;
        }

        if (g.x === pacman.x && g.y === pacman.y) {
            init();
            pacman.x = 14;
            pacman.y = 23;
        }
    });
}

function update() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawMap();
    drawPellets();
    drawPacman();
    drawGhosts();
    movePacman();
    moveGhosts();
}

document.addEventListener("keydown", e => {
    switch(e.key.toLowerCase()) {
        case "arrowup":
        case "z":
            pacman.dx = 0; pacman.dy = -1;
            break;
        case "arrowdown":
        case "s":
            pacman.dx = 0; pacman.dy = 1;
            break;
        case "arrowleft":
        case "q":
            pacman.dx = -1; pacman.dy = 0;
            break;
        case "arrowright":
        case "d":
            pacman.dx = 1; pacman.dy = 0;
            break;
    }
});

init();
setInterval(update, 120);
