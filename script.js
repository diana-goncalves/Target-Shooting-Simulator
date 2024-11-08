// GLOBALS
const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext("2d");
const velocity = document.querySelector("#Vel");
const resistance = document.querySelector("#resistance")

const W = canvas.width, H = canvas.height;
let arrows = new Array(); // arrows (array of objects)
let angle = 0

//Sprite
let player = new Image()
player.src = "./assets/sprites/Idle.png"
let framePlayer = 0;
let frameDelay = 0;
let mouseIn = false;
let arm = new Image()
arm.src = ""
let target = new Image()
target.src = "./assets/semfundo.png"

const bgSky = new Image();
bgSky.src = './assets/background/1.png'

const bgFloor = new Image();
bgFloor.src = './assets/background/2.png'

const bgGrass = new Image();
bgGrass.src = './assets/background/3.png'

const bgCloud = new Image();
bgCloud.src = './assets/background/4.png'

let cloudX = 0; // Posição inicial das nuvens

window.onload = () => {
    // Atualizar o valor da força em tempo real
    velocity.addEventListener("input", (e) => {
        e.preventDefault();
        document.querySelector(".velValue").innerHTML = velocity.value;
    });

    // Atualizar o valor da resistência do ar em tempo real
    resistance.addEventListener("input", (e) => {
        e.preventDefault();
        document.querySelector(".resistanceValue").innerHTML = resistance.value;
    });

    render();
};

//Evento de disparar
canvas.addEventListener('click', e => {
    // add a new cannon ball
    arrows.push(new Arrow(velocity.value, angle))
});

// Evento de angulo
canvas.addEventListener('mousemove', e => {
    //mouse cursor coordinates
    let x = e.offsetX; let y = e.offsetY;

    // update cannon ORIENTATION angle​
    let dx = x - 50;
    let dy = y - (H - 50);
    angle = Math.atan2(dy, dx);
    console.log(angle);

});

// add a attack animation
canvas.addEventListener('mouseenter', e => {
    player.src = "./assets/sprites/Attack.png"
    mouseIn = true
});

// add a idle animation
canvas.addEventListener('mouseleave', e => {
    player.src = "./assets/sprites/Idle.png"
    mouseIn = false
});


function render() {
    ctx.clearRect(0, 0, W, H);

    // Desenhar o background em camadas
    ctx.drawImage(bgSky, 0, 0, W, H * 0.9);          // Céu ocupa 90% da altura do canvas
    ctx.drawImage(bgGrass, 0, H * 0.65, W, H * 0.3);  // Grama ocupa 30% da altura, logo abaixo do céu
    ctx.drawImage(bgFloor, 0, H * 0.8, W, H * 0.2);  // Chão ocupa os últimos 20% da altura do canvas

    // Desenhar o jogador
    ctx.drawImage(player, framePlayer, 0, 42, 42, 0, H - 160, 148, 148);

    ctx.drawImage(target, W-150, H-120, 100,100);  // Chão ocupa os últimos 20% da altura do canvas


    // Animação do frame do jogador
    if (frameDelay == 5) {
        framePlayer += 42;
        frameDelay = 0;
    } else {
        frameDelay++;
    }

    if (framePlayer == 168) {
        framePlayer = 0;
    }

    // Função de animação das nuvens
    animate();

    // Desenhar o braço e ajustar posição conforme o ângulo
    if (mouseIn) {
        if (angle > 0.7) {
            arm.src = "./assets/sprites/4.png";
        } else if (angle < 0.7 && angle > -0.2) {
            arm.src = "./assets/sprites/3.png"
        } else if (angle < -0.2 && angle > -0.7) {
            arm.src = "./assets/sprites/2.png";
        } else if (angle < -0.7) {
            arm.src = "./assets/sprites/1.png";
        }
        ctx.drawImage(arm, 0, 0, 42, 42, 0, H - 145, 148, 148);
    }

    // Desenhar e atualizar as setas
    arrows.forEach(arrow => {
        arrow.draw();
        arrow.update();
    });

    requestAnimationFrame(render);
}

function convertToRad(a) {
    return a / (Math.PI / 180)
}


function animate() {
    // Atualizar posição das nuvens para o efeito de movimento
    cloudX -= 0.3;
    if (cloudX <= -bgCloud.width) {
        cloudX = 0; // Reinicia a posição para repetir a imagem
    }

    // Desenha as nuvens animadas
    ctx.drawImage(bgCloud, cloudX, 0, bgCloud.width, H * 1.2); // Primeira repetição
    ctx.drawImage(bgCloud, cloudX + bgCloud.width, 0, bgCloud.width, H * 1.2); // Segunda repetição
    ctx.drawImage(bgCloud, cloudX + 2 * bgCloud.width, 0, bgCloud.width, H * 1.2); // Terceira repetição
    ctx.drawImage(bgCloud, cloudX + 2 * bgCloud.width, 0, bgCloud.width, H * 1.2); // Quarta repetição
}


class Arrow {
    constructor(vel, angle) {

        this.raius

        this.x = 50 + 60 * Math.cos(angle)			// initial X position
        this.y = H - 40 + 60 * Math.sin(angle) 	// initial Y position

        this.A = 0.1 		// acceleration (gravity = 0.1 pixels per frame)
        this.R = 5;

        this.dX = vel / 10 * Math.cos(angle) //initial velocity in X
        this.dY = vel / 10 * Math.sin(angle)	//initial velocity in Y
    }
    draw() {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.R, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        // if circle hits the bottom of the Canvas
        if (this.y > H - this.R) {
            this.y = H - this.R;
            this.dX = this.dY = 0; // stop

        }
        else {
            this.x += this.dX; // update circle X position (uniform motion)
            this.dY += this.A; // increase circle velocity in Y (accelerated motion)
            this.y += this.dY; // update circle Y position
        }
    }
};
