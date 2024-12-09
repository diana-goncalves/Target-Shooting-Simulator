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
const targetX = W - 115;
const targetY = H - 85;
const targetRadius = 40;

// Background
const background = new Image();
background.src = "./assets/background/earth.png";

const bgSky = new Image();
bgSky.src = "./assets/background/earth_sky.png";

const bgFloor = new Image();
bgFloor.src = "./assets/background/earth_floor.png";

const bgGrass = new Image();
bgGrass.src = "./assets/background/earth_grass.png";

const bgCloud = new Image();
bgCloud.src = "./assets/background/earth_cloud.png";
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
  arrowsList.push(new Arrow(velocity.value, angle, gravity, resistance.value));
});

// Angle event
canvas.addEventListener("mousemove", (e) => {
  //mouse cursor coordinates
  let x = e.offsetX;
  let y = e.offsetY;

  // update arrow ORIENTATION angle​
  let dx = x - 50;
  let dy = y - (H - 50);
  angle = Math.atan2(dy, dx);
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

const backgrounds = [
  {
    image: "",
    cloud: "./assets/background/earth_cloud.png",
    floor: "./assets/background/earth_floor.png",
    sky: "./assets/background/earth_sky.png",
    grass: "./assets/background/earth_grass.png",
  },
  {
    image: "./assets/background/Mars.webp",
    sky: "",
    floor: "",
    cloud: "",
    grass: "",
  },
  {
    image: "./assets/background/Moon.webp",
    sky: "",
    floor: "",
    cloud: "",
    grass: "",
  },
];

function updateBackground(planet) {
  const selectedBackground = backgrounds[planet];

  background.src = selectedBackground.image;
  bgCloud.src = selectedBackground.cloud;
  bgFloor.src = selectedBackground.floor;
  bgSky.src = selectedBackground.sky;
  bgGrass.src = selectedBackground.grass;
}

// Adiciona eventos às opções de planeta
document.querySelector(".terra").addEventListener("click", () => {
  updateBackground(0);
});

document.querySelector(".marte").addEventListener("click", () => {
  updateBackground(1);
});

document.querySelector(".lua").addEventListener("click", () => {
  updateBackground(2);
});

function render() {
  ctx.clearRect(0, 0, W, H);

  // Draw the background layers
  ctx.drawImage(background, 0, 0, W, H);
  ctx.drawImage(bgSky, 0, 0, W, H * 0.9);
  ctx.drawImage(bgGrass, 0, H * 0.65, W, H * 0.3);
  ctx.drawImage(bgFloor, 0, H * 0.7, W, H * 0.3);

  // Draw the player
  ctx.drawImage(player, framePlayer, 0, 42, 42, 0, H - 160, 148, 148);

  // Draw the target
  ctx.drawImage(target, W - 150, H - 120, 100, 100);

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
  cloudX -= 0.3; // cloudX value is reduced by 0.3 pixels and moves to the left

  if (cloudX <= -bgCloud.width) {
    cloudX = 0; // Reset position to repeat image
  }

  // Ensures that the cloud image covers the entire canvas horizontally
  ctx.drawImage(bgCloud, cloudX, 0, bgCloud.width, H * 1.2); // First repetition
  ctx.drawImage(bgCloud, cloudX + bgCloud.width, 0, bgCloud.width, H * 1.2); // Second repetition
  ctx.drawImage(bgCloud, cloudX + 2 * bgCloud.width, 0, bgCloud.width, H * 1.2); // Third repetition
  ctx.drawImage(bgCloud, cloudX + 3 * bgCloud.width, 0, bgCloud.width, H * 1.2); // Fourth repetition
}

class Arrow {
  constructor(vel, angle, gravity, resistance) {
    this.x = 50 + 60 * Math.cos(angle); // Initial arrow position X
    this.y = H - 100 + 60 * Math.sin(angle); // initial arrow position Y

    this.R = 5;
    this.A = gravity; // Gravity selected
    this.resistance = resistance; // Add air resistence

    this.dX = (vel / 10) * Math.cos(angle); // velocidade inicial em X
    this.dY = (vel / 10) * Math.sin(angle); // velocidade inicial em Y

    this.hasReachedPeak = false; // Flag to indicate whether the arrow has reached peak curvature
    this.isDescending = false; // Flag to indicate that the arrow is descending
    this.currentAngle = -Math.PI / 7.2; // Starting angle (25° up)
    this.targetAngle = -Math.PI / 7.2; // Initial target angle (25° down)
    this.angleSpeed = 0.05; // Angle change speed
    this.stuck = false;
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

  checkCollisionWithTarget() {
    // Calculates the distance between the center of the arrow and the center of the target
    const dx = this.x - targetX;
    const dy = this.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Checks whether the distance is less than or equal to the sum of the rays (collision)
    if (distance <= this.R + targetRadius) {
      this.stuck = true; // Marca a flecha como presa no alvo
      this.dX = 0; // Zera a velocidade para garantir que a flecha pare
      this.dY = 0;
    }
  }

  update() {
    // // Checks if the arrow is stuck in the target; if so, it does not update the position
    if (this.stuck) {
      return;
    }

    // if circle hits the bottom of the Canvas
    if (this.y > H - 44) {
      this.y = H - 44;
      this.dX = this.dY = 0;
    } else {
      this.dY += this.A * this.resistance;

      this.x += this.dX;
      this.y += this.dY;
      console.log(this.y);
      console.log("ALTURA CANVAS: " + H);
    }

    this.getInclinationAngle();

    this.checkCollisionWithTarget();
  }
}
