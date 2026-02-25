// ============================
// MODULE SIMULATION COMBAT 03
// PHASE 2 – VISUAL UPGRADE
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

const GRAVITY = 1800;
const FLOOR_Y = 380;

let screenShake = 0;
let flashTimer = 0;

// ============================
// HIT SPARK
// ============================

class HitSpark{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.life=0.15;
    }
    update(dt){ this.life -= dt; }
    draw(){
        ctx.fillStyle="#fff";
        for(let i=0;i<6;i++){
            ctx.fillRect(this.x+(Math.random()*20-10),
                         this.y+(Math.random()*20-10),4,4);
        }
    }
}

let sparks = [];

// ============================
// HITBOX
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
        const a=this.getRect();
        const b=other.getRect();
        return(
            a.x<b.x+b.width &&
            a.x+a.width>b.x &&
            a.y<b.y+b.height &&
            a.y+a.height>b.y
        );
    }
}

// ============================
// FIGHTER
// ============================

class Fighter{
    constructor(x,color,isAI=false){
        this.x=x;
        this.y=FLOOR_Y;
        this.vx=0;
        this.vy=0;
        this.width=50;
        this.height=100;
        this.color=color;
        this.health=100;
        this.direction=1;
        this.state="idle";
        this.frame=0;
        this.animTimer=0;
        this.isAI=isAI;
        this.hitstun=0;
        this.blocking=false;
        this.knockback=0;
        this.hurtbox=new Hitbox(this,0,-this.height,50,100);
        this.hitbox=null;
    }

    update(dt,opponent){

        if(this.health<=0){
            this.state="KO";
            return;
        }

        this.direction = this.x < opponent.x ? 1 : -1;

        if(this.hitstun>0){
            this.hitstun-=dt;
            return;
        }

        this.animTimer+=dt;

        switch(this.state){

            case "jump":
                this.vy+=GRAVITY*dt;
                this.y+=this.vy*dt;
                if(this.y>=FLOOR_Y){
                    this.y=FLOOR_Y;
                    this.vy=0;
                    this.state="idle";
                }
                break;

            case "attack":
                this.handleAttack(dt);
                break;
        }

        this.x+=this.vx*dt;
        this.x+=this.knockback;
        this.knockback*=0.85;
    }

    startAttack(type){
        if(this.state!=="idle" && this.state!=="walk") return;

        swingSfx.currentTime=0;
        swingSfx.play();

        this.state="attack";
        this.attackType=type;
        this.attackTimer=0;

        if(type==="light"){
            this.startup=0.07;
            this.active=0.08;
            this.recovery=0.12;
            this.damage=8;
        }else{
            this.startup=0.12;
            this.active=0.12;
            this.recovery=0.25;
            this.damage=18;
        }

        this.hitbox=new Hitbox(this,50,-70,40,30);
    }

    handleAttack(dt){
        this.attackTimer+=dt;

        if(this.attackTimer>=this.startup &&
           this.attackTimer<=this.startup+this.active){
            this.hitbox.active=true;
        }else{
            this.hitbox.active=false;
        }

        if(this.attackTimer>=this.startup+this.active+this.recovery){
            this.state="idle";
            this.hitbox=null;
        }
    }

    receiveHit(damage,heavy=false){

        if(this.blocking){
            blockSfx.play();
            damage*=0.3;
            this.knockback=-2*this.direction;
        }else{
            hitSfx.play();
            flashTimer=0.05;
            sparks.push(new HitSpark(this.x+25,this.y-50));
            this.hitstun=0.2;
            this.knockback=heavy?-8*this.direction:-4*this.direction;

            if(heavy) screenShake=10;
        }

        this.health-=damage;
        updateHUD();
    }

    draw(){

        // ombre
        ctx.fillStyle="rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.ellipse(this.x+25,FLOOR_Y+5,30,10,0,0,Math.PI*2);
        ctx.fill();

        // animation simple 2 frames
        const bounce = Math.sin(this.animTimer*10)*2;

        ctx.fillStyle=this.color;
        ctx.fillRect(this.x, this.y-this.height+bounce, 50, 80);
        ctx.fillRect(this.x+10, this.y-this.height-20+bounce, 30, 20);

        if(this.blocking){
            ctx.strokeStyle="#00bcd4";
            ctx.strokeRect(this.x-4,this.y-this.height-24,58,110);
        }
    }
}

// ============================
// INIT
// ============================

const player=new Fighter(200,"#e6e6e6");
const enemy=new Fighter(600,"#7a0000",true);

let lastTime=0;

function updateHUD(){
    document.getElementById("playerHP").style.width=player.health+"%";
    document.getElementById("enemyHP").style.width=enemy.health+"%";
}

// ============================
// IA
// ============================

function enemyAI(dt){

    if(enemy.state==="attack" || enemy.hitstun>0) return;

    const dist=Math.abs(enemy.x-player.x);

    if(dist>130){
        enemy.vx=enemy.direction*-180;
        enemy.state="walk";
    }else{
        enemy.vx=0;
        if(Math.random()<0.015){
            enemy.startAttack(Math.random()<0.6?"light":"heavy");
        }
        if(Math.random()<0.01){
            enemy.blocking=true;
            setTimeout(()=>enemy.blocking=false,400);
        }
    }
}

// ============================
// COLLISIONS
// ============================

function handleCollisions(){

    if(player.hitbox && player.hitbox.active &&
       player.hitbox.intersects(enemy.hurtbox)){
        enemy.receiveHit(player.damage,player.attackType==="heavy");
    }

    if(enemy.hitbox && enemy.hitbox.active &&
       enemy.hitbox.intersects(player.hurtbox)){
        player.receiveHit(enemy.damage,enemy.attackType==="heavy");
    }
}

// ============================
// INPUT
// ============================

const keys={};

document.addEventListener("keydown",e=>{
    keys[e.key.toLowerCase()]=true;
    if(e.key==="e") player.startAttack("light");
    if(e.key==="r") player.startAttack("heavy");
});

document.addEventListener("keyup",e=>{
    keys[e.key.toLowerCase()]=false;
});

function handleInput(dt){

    if(player.state==="attack" || player.hitstun>0) return;

    player.blocking=keys["a"];

    if(keys["q"]){
        player.vx=-250;
        player.state="walk";
    }
    else if(keys["d"]){
        player.vx=250;
        player.state="walk";
    }
    else{
        player.vx=0;
        player.state="idle";
    }

    if(keys["z"] && player.state!=="jump"){
        player.state="jump";
        player.vy=-700;
    }
}

// ============================
// BACKGROUND
// ============================

function drawBackground(){

    ctx.fillStyle="#141414";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#1c1c1c";
    ctx.fillRect(0,FLOOR_Y,canvas.width,80);

    // grille animée
    ctx.strokeStyle="rgba(122,0,0,0.2)";
    for(let i=0;i<canvas.width;i+=60){
        ctx.beginPath();
        ctx.moveTo(i,0);
        ctx.lineTo(i,canvas.height);
        ctx.stroke();
    }
}

// ============================
// GAME LOOP
// ============================

function gameLoop(timestamp){

    const dt=(timestamp-lastTime)/1000;
    lastTime=timestamp;

    ctx.save();

    if(screenShake>0){
        ctx.translate(Math.random()*screenShake-5,
                      Math.random()*screenShake-5);
        screenShake*=0.9;
    }

    drawBackground();

    handleInput(dt);
    enemyAI(dt);

    player.update(dt,enemy);
    enemy.update(dt,player);

    handleCollisions();

    player.draw();
    enemy.draw();

    sparks=sparks.filter(s=>s.life>0);
    sparks.forEach(s=>{
        s.update(dt);
        s.draw();
    });

    if(flashTimer>0){
        ctx.fillStyle="rgba(255,255,255,0.4)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        flashTimer-=dt;
    }

    ctx.restore();

    requestAnimationFrame(gameLoop);
}

updateHUD();
requestAnimationFrame(gameLoop);
