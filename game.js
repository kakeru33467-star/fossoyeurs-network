const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 20;
const tiles = 20;

let score = 0;

const pacman = {
    x: 1,
    y: 1,
    dx: 0,
    dy: 0
};

const ghost = {
    x: 18,
    y: 18
};

let pellets = [];

for (let y = 0; y < tiles; y++) {
    for (let x = 0; x < tiles; x++) {
        if (!(x === 1 && y === 1)) {
            pellets.push({x, y});
        }
    }
}

function drawGrid() {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPacman() {
    ctx.fillStyle = "#7a0000";
    ctx.beginPath();
    ctx.arc(pacman.x * tileSize + 10, pacman.y * tileSize + 10, 8, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x * tileSize + 10, pacman.y * tileSize + 10);
    ctx.fill();
}

function drawGhost() {
    ctx.fillStyle = "#444";
    ctx.fillRect(ghost.x * tileSize, ghost.y * tileSize, tileSize, tileSize);
}

function drawPellets() {
    ctx.fillStyle = "#999";
    pellets.forEach(p => {
        ctx.fillRect(p.x * tileSize + 8, p.y * tileSize + 8, 4, 4);
    });
}

function moveGhost() {
    const directions = [
        {dx:1,dy:0},{dx:-1,dy:0},
        {dx:0,dy:1},{dx:0,dy:-1}
    ];
    const dir = directions[Math.floor(Math.random()*4)];
    ghost.x += dir.dx;
    ghost.y += dir.dy;

    if (ghost.x < 0) ghost.x = 0;
    if (ghost.y < 0) ghost.y = 0;
    if (ghost.x >= tiles) ghost.x = tiles-1;
    if (ghost.y >= tiles) ghost.y = tiles-1;
}

function update() {
    pacman.x += pacman.dx;
    pacman.y += pacman.dy;

    if (pacman.x < 0) pacman.x = 0;
    if (pacman.y < 0) pacman.y = 0;
    if (pacman.x >= tiles) pacman.x = tiles-1;
    if (pacman.y >= tiles) pacman.y = tiles-1;

    pellets = pellets.filter(p => {
        if (p.x === pacman.x && p.y === pacman.y) {
            score++;
            return false;
        }
        return true;
    });

    if (score >= 20) {
        window.location.href = "dashboard.html";
    }

    if (pacman.x === ghost.x && pacman.y === ghost.y) {
        score = 0;
        pacman.x = 1;
        pacman.y = 1;
    }

    moveGhost();
}

function draw() {
    drawGrid();
    drawPellets();
    drawPacman();
    drawGhost();
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 150);
}

document.addEventListener("keydown", e => {
    switch(e.key.toLowerCase()) {
        case "arrowup":
        case "z":
            pacman.dx = 0;
            pacman.dy = -1;
            break;
        case "arrowdown":
        case "s":
            pacman.dx = 0;
            pacman.dy = 1;
            break;
        case "arrowleft":
        case "q":
            pacman.dx = -1;
            pacman.dy = 0;
            break;
        case "arrowright":
        case "d":
            pacman.dx = 1;
            pacman.dy = 0;
            break;
    }
});

gameLoop();
