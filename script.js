// GLOBALS
const canvas = document.querySelector("#myCanvas");
const ctx = canvas.getContext("2d");
const velocity = document.querySelector("#Vel");
const resistance = document.querySelector("#resistance");

const W = canvas.width,
  H = canvas.height;
let arrowsList = new Array(); // arrowsList (array of objects)
let angle = 0;

//Sprite
let player = new Image();
player.src = "./assets/sprites/Idle.png";
let framePlayer = 0;
let frameDelay = 0;
let mouseIn = false;
let arm = new Image();
arm.src = "";

// Arrow
let arrow = new Image();
arrow.src = "./assets/Arrow.png";

// Target
let target = new Image();
target.src = "./assets/Target.png";

// Background
const bgSky = new Image();
bgSky.src = "./assets/background/1.png";

const bgFloor = new Image();
bgFloor.src = "./assets/background/2.png";

const bgGrass = new Image();
bgGrass.src = "./assets/background/3.png";

const bgCloud = new Image();
bgCloud.src = "./assets/background/4.png";
let cloudX = 0; // Initial position of the clouds

window.onload = () => {
  // Updates the force value in real time
  velocity.addEventListener("input", (e) => {
    e.preventDefault();
    document.querySelector(".velValue").innerHTML = velocity.value;
  });

  // Update air resistance value in real time
  resistance.addEventListener("input", (e) => {
    e.preventDefault();
    document.querySelector(".resistanceValue").innerHTML = resistance.value;
  });

  render();
};

// Trigger event
canvas.addEventListener("click", (e) => {
  let gravity = +document.querySelector('input[name="gravity"]:checked').value;

  // add a new cannon ball
  arrowsList.push(new Arrow(velocity.value, angle, gravity));
});

// Angle event
canvas.addEventListener("mousemove", (e) => {
  //mouse cursor coordinates
  let x = e.offsetX;
  let y = e.offsetY;

  // update cannon ORIENTATION angle​
  let dx = x - 50;
  let dy = y - (H - 50);
  angle = Math.atan2(dy, dx);
  console.log(angle);
});

// add a attack animation
canvas.addEventListener("mouseenter", (e) => {
  player.src = "./assets/sprites/Attack.png";
  mouseIn = true;
});

// add a idle animation
canvas.addEventListener("mouseleave", (e) => {
  player.src = "./assets/sprites/Idle.png";
  mouseIn = false;
});

function render() {
  ctx.clearRect(0, 0, W, H);

  // Draw the background layers
  ctx.drawImage(bgSky, 0, 0, W, H * 0.9); // Céu ocupa 90% da altura do canvas
  ctx.drawImage(bgGrass, 0, H * 0.65, W, H * 0.3); // Grama ocupa 30% da altura, logo abaixo do céu
  ctx.drawImage(bgFloor, 0, H * 0.8, W, H * 0.2); // Chão ocupa os últimos 20% da altura do canvas

  // Draw the player
  ctx.drawImage(player, framePlayer, 0, 42, 42, 0, H - 160, 148, 148);

  // Draw the target
  ctx.drawImage(target, W - 150, H - 120, 100, 100); // Chão ocupa os últimos 20% da altura do canvas

  // Player frame animation
  if (frameDelay == 5) {
    framePlayer += 42;
    frameDelay = 0;
  } else {
    frameDelay++;
  }

  if (framePlayer == 168) {
    framePlayer = 0;
  }

  // Cloud animation function
  animate();

  // Draw the arm and adjust its position according to the angle
  if (mouseIn) {
    if (angle > 0.7) {
      arm.src = "./assets/sprites/4.png";
    } else if (angle < 0.7 && angle > -0.2) {
      arm.src = "./assets/sprites/3.png";
    } else if (angle < -0.2 && angle > -0.7) {
      arm.src = "./assets/sprites/2.png";
    } else if (angle < -0.7) {
      arm.src = "./assets/sprites/1.png";
    }
    ctx.drawImage(arm, 0, 0, 42, 42, 0, H - 145, 148, 148);
  }

  // Draw and update arrows
  arrowsList.forEach((arrow) => {
    arrow.draw();
    arrow.update();
  });

  requestAnimationFrame(render);
}

function convertToDegrees(a) {
  return a / (Math.PI / 180);
}

function animate() {
  // Update cloud position for motion effect
  cloudX -= 0.3;
  if (cloudX <= -bgCloud.width) {
    cloudX = 0; // Reset position to repeat image
  }

  ctx.drawImage(bgCloud, cloudX, 0, bgCloud.width, H * 1.2); // First repetition
  ctx.drawImage(bgCloud, cloudX + bgCloud.width, 0, bgCloud.width, H * 1.2); // Second repetition
  ctx.drawImage(bgCloud, cloudX + 2 * bgCloud.width, 0, bgCloud.width, H * 1.2); // Third repetition
  ctx.drawImage(bgCloud, cloudX + 2 * bgCloud.width, 0, bgCloud.width, H * 1.2); // Fourth repetition
}

class Arrow {
  constructor(vel, angle, gravity) {
    this.x = 50 + 60 * Math.cos(angle); // posição inicial X
    this.y = H - 100 + 60 * Math.sin(angle); // posição inicial Y

    this.A = gravity;
    this.R = 5;

    this.dX = (vel / 10) * Math.cos(angle); // velocidade inicial em X
    this.dY = (vel / 10) * Math.sin(angle); // velocidade inicial em Y

    this.hasReachedPeak = false; // Flag to indicate whether the arrow has reached peak curvature
    this.isDescending = false; // Flag to indicate that the arrow is descending
    this.currentAngle = -Math.PI / 7.2; // Starting angle (25° up)
    this.targetAngle = -Math.PI / 7.2; // Initial target angle (25° down)
    this.angleSpeed = 0.05; // Angle change speed
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Applies rotation smoothly
    this.currentAngle +=
      (this.targetAngle - this.currentAngle) * this.angleSpeed;
    ctx.rotate(this.currentAngle);

    ctx.drawImage(arrow, -this.R, -this.R);
    ctx.restore();
  }

  getInclinationAngle() {
    // Checks if the arrow has reached the highest point
    if (this.dY > 0 && !this.hasReachedPeak) {
      this.hasReachedPeak = true;
    }

    // Marks the beginning of the descent after reaching the maximum point
    if (this.hasReachedPeak && this.dY > 0) {
      this.isDescending = true;
    }

    // Sets target angle based on trajectory status
    if (!this.hasReachedPeak) {
      this.targetAngle = -Math.PI / 7.2; // Tilt 25° upwards
    } else if (this.hasReachedPeak && !this.isDescending) {
      this.targetAngle = 0; // Slope equal to zero at peak
    } else if (this.isDescending) {
      this.targetAngle = Math.PI / 7.2; // Tilt 25° down
    }
  }

  update() {
    // if circle hits the bottom of the Canvas
    if (this.y > H - this.R) {
      this.y = H - this.R;
      this.dX = this.dY = 0;
    } else {
      this.x += this.dX;
      this.dY += this.A;
      this.y += this.dY;
      console.log(`${convertToDegrees(Math.atan2(this.dX, this.dY))}`);
    }

    // Atualiza o ângulo alvo para um movimento mais fluido
    this.getInclinationAngle();
  }
}
