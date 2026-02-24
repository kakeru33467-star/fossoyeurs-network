// ============================
// MODULE SIMULATION COMBAT 03
// ============================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const music = document.getElementById("music");
const swingSfx = document.getElementById("swing");
const hitSfx = document.getElementById("hit");
const blockSfx = document.getElementById("block");
const koSfx = document.getElementById("ko");

document.addEventListener("click",()=>{
    music.volume = 0.4;
    music.play().catch(()=>{});
},{once:true});

// ============================
// CONSTANTES
// ============================

const GRAVITY = 1800;
const FLOOR_Y = 380;

// ============================
// HITBOX CLASS
// ============================

class Hitbox{
    constructor(owner, offsetX, offsetY, width, height){
        this.owner = owner;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.width = width;
        this.height = height;
        this.active = false;
    }

    getRect(){
        return {
            x: this.owner.x + this.offsetX * this.owner.direction,
            y: this.owner.y + this.offsetY,
            width: this.width,
            height: this.height
        };
    }

    intersects(other){
        const a = this.getRect();
        const b = other.getRect();

        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}

// ============================
// FIGHTER CLASS
// ============================

class Fighter{
    constructor(x, color, isAI=false){
        this.x = x;
        this.y = FLOOR_Y;
        this.vx = 0;
        this.vy = 0;
        this.width = 50;
        this.height = 100;

        this.color = color;
        this.health = 100;

        this.direction = 1;
        this.state = "idle";
        this.frame = 0;
        this.frameTimer = 0;

        this.isAI = isAI;

        this.hitstun = 0;
        this.blocking = false;
        this.comboTimer = 0;
        this.comboStep = 0;

        this.knockback = 0;

        this.hurtbox = new Hitbox(this,0,-this.height,50,100);
        this.hitbox = null;
    }

    update(dt, opponent){

        if(this.health <=0){
            this.state = "KO";
            return;
        }

        this.direction = this.x < opponent.x ? 1 : -1;

        // hitstun
        if(this.hitstun > 0){
            this.hitstun -= dt;
            return;
        }

        this.comboTimer -= dt;

        switch(this.state){

            case "idle":
                this.vx = 0;
                break;

            case "walk":
                break;

            case "jump":
                this.vy += GRAVITY * dt;
                this.y += this.vy * dt;
                if(this.y >= FLOOR_Y){
                    this.y = FLOOR_Y;
                    this.vy = 0;
                    this.state = "idle";
                }
                break;

            case "attack":
                this.handleAttack(dt);
                break;

            case "block":
                break;
        }

        this.x += this.vx * dt;
        this.x += this.knockback;
        this.knockback *= 0.85;
    }

    startAttack(type){

        if(this.state !== "idle" && this.state !== "walk") return;

        swingSfx.currentTime = 0;
        swingSfx.play();

        this.state = "attack";
        this.attackType = type;
        this.attackTimer = 0;

        if(type === "light"){
            this.startup = 0.08;
            this.active = 0.08;
            this.recovery = 0.12;
            this.damage = 8;
        }else{
            this.startup = 0.12;
            this.active = 0.12;
            this.recovery = 0.2;
            this.damage = 15;
        }

        this.hitbox = new Hitbox(this, 40, -70, 40, 30);
    }

    handleAttack(dt){
        this.attackTimer += dt;

        if(this.attackTimer >= this.startup &&
           this.attackTimer <= this.startup + this.active){
            this.hitbox.active = true;
        }else{
            this.hitbox.active = false;
        }

        if(this.attackTimer >= this.startup + this.active + this.recovery){
            this.state = "idle";
            this.hitbox = null;
        }
    }

    receiveHit(damage, heavy=false){

        if(this.blocking){
            blockSfx.play();
            damage *= 0.3;
            this.knockback = heavy ? -2*this.direction : -1*this.direction;
        }else{
            hitSfx.play();
            this.hitstun = 0.2;
            this.knockback = heavy ? -6*this.direction : -3*this.direction;
        }

        this.health -= damage;
        updateHUD();
    }

    draw(){

        // ombre
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.ellipse(this.x+25,FLOOR_Y+5,30,10,0,0,Math.PI*2);
        ctx.fill();

        // corps pixel stylisé
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y-this.height, 50, 80);
        ctx.fillRect(this.x+10, this.y-this.height-20, 30, 20);

        if(this.state === "block"){
            ctx.strokeStyle="#00bcd4";
            ctx.strokeRect(this.x-3,this.y-this.height-25,56,110);
        }
    }
}

// ============================
// INITIALISATION
// ============================

const player = new Fighter(200,"#e6e6e6");
const enemy = new Fighter(600,"#7a0000",true);

let lastTime = 0;

function updateHUD(){
    document.getElementById("playerHP").style.width = player.health+"%";
    document.getElementById("enemyHP").style.width = enemy.health+"%";
}

// ============================
// IA BASIQUE
// ============================

function enemyAI(dt){

    if(enemy.state === "attack" || enemy.hitstun>0) return;

    const dist = Math.abs(enemy.x - player.x);

    if(dist > 120){
        enemy.vx = enemy.direction * -150;
        enemy.state = "walk";
    }else{
        enemy.vx = 0;
        if(Math.random()<0.01){
            enemy.startAttack(Math.random()<0.6?"light":"heavy");
        }
        if(Math.random()<0.005){
            enemy.blocking = true;
            setTimeout(()=>enemy.blocking=false,400);
        }
    }
}

// ============================
// COLLISION
// ============================

function handleCollisions(){

    if(player.hitbox && player.hitbox.active &&
       player.hitbox.intersects(enemy.hurtbox)){
        enemy.receiveHit(player.damage, player.attackType==="heavy");
    }

    if(enemy.hitbox && enemy.hitbox.active &&
       enemy.hitbox.intersects(player.hurtbox)){
        player.receiveHit(enemy.damage, enemy.attackType==="heavy");
    }
}

// ============================
// INPUT
// ============================

const keys = {};

document.addEventListener("keydown",e=>{
    keys[e.key.toLowerCase()] = true;

    if(e.key === "e") player.startAttack("light");
    if(e.key === "r") player.startAttack("heavy");
});

document.addEventListener("keyup",e=>{
    keys[e.key.toLowerCase()] = false;
});

function handleInput(dt){

    if(player.state==="attack" || player.hitstun>0) return;

    player.blocking = keys["a"];

    if(keys["q"]){
        player.vx = -200;
        player.state="walk";
    }
    else if(keys["d"]){
        player.vx = 200;
        player.state="walk";
    }
    else{
        player.vx = 0;
        player.state="idle";
    }

    if(keys["z"] && player.state!=="jump"){
        player.state="jump";
        player.vy = -650;
    }
}

// ============================
// GAME LOOP
// ============================

function gameLoop(timestamp){

    const dt = (timestamp - lastTime)/1000;
    lastTime = timestamp;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#141414";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    handleInput(dt);
    enemyAI(dt);

    player.update(dt, enemy);
    enemy.update(dt, player);

    handleCollisions();

    player.draw();
    enemy.draw();

    requestAnimationFrame(gameLoop);
}

updateHUD();
requestAnimationFrame(gameLoop);
