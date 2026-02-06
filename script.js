const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMessage = document.getElementById("overlay-message");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

const groundY = 210;
const gravity = 0.65;
const jumpVelocity = -12;
const obstacleSpacing = 220;
const baseSpeed = 4.5;

const bestScoreKey = "dino-runner-best";

const dino = {
  x: 80,
  y: groundY,
  width: 42,
  height: 46,
  velocityY: 0,
  isJumping: false,
};

let obstacles = [];
let score = 0;
let bestScore = Number(localStorage.getItem(bestScoreKey)) || 0;
let running = false;
let lastTime = 0;
let speed = baseSpeed;

bestEl.textContent = bestScore.toString();

const cloudLayer = Array.from({ length: 4 }, (_, index) => ({
  x: 150 + index * 220,
  y: 40 + index * 18,
  size: 24 + index * 3,
}));

function resetGame() {
  obstacles = [];
  score = 0;
  speed = baseSpeed;
  dino.y = groundY;
  dino.velocityY = 0;
  dino.isJumping = false;
  updateScore();
  spawnObstacle();
  spawnObstacle();
}

function updateScore() {
  scoreEl.textContent = Math.floor(score).toString();
}

function spawnObstacle() {
  const height = 28 + Math.random() * 28;
  const width = 18 + Math.random() * 20;
  const gap = obstacleSpacing + Math.random() * 140;
  const lastX = obstacles.length ? obstacles[obstacles.length - 1].x : 900;
  obstacles.push({
    x: lastX + gap,
    y: groundY + dino.height - height,
    width,
    height,
  });
}

function startGame() {
  if (running) return;
  resetGame();
  overlay.classList.add("hidden");
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function endGame() {
  running = false;
  overlay.classList.remove("hidden");
  overlayTitle.textContent = "Game Over";
  overlayMessage.textContent = "Press Space or tap to try again.";
  startButton.textContent = "Restart";
  if (score > bestScore) {
    bestScore = Math.floor(score);
    localStorage.setItem(bestScoreKey, bestScore.toString());
    bestEl.textContent = bestScore.toString();
  }
}

function handleJump() {
  if (!running) {
    startGame();
    return;
  }
  if (!dino.isJumping) {
    dino.velocityY = jumpVelocity;
    dino.isJumping = true;
  }
}

function drawGround() {
  context.strokeStyle = "#c7d1e6";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, groundY + dino.height + 2);
  context.lineTo(canvas.width, groundY + dino.height + 2);
  context.stroke();
}

function drawDino() {
  context.fillStyle = "#1c2333";
  context.fillRect(dino.x, dino.y, dino.width, dino.height);
  context.fillStyle = "#ffffff";
  context.fillRect(dino.x + 28, dino.y + 10, 6, 6);
}

function drawObstacles() {
  context.fillStyle = "#3b8f3b";
  obstacles.forEach((obstacle) => {
    context.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

function drawClouds(delta) {
  context.fillStyle = "#dfe6f3";
  cloudLayer.forEach((cloud) => {
    cloud.x -= delta * 0.02;
    if (cloud.x + cloud.size < 0) {
      cloud.x = canvas.width + cloud.size * 2;
    }
    context.beginPath();
    context.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6, 0, 0, Math.PI * 2);
    context.fill();
  });
}

function update(delta) {
  dino.velocityY += gravity;
  dino.y += dino.velocityY;

  if (dino.y >= groundY) {
    dino.y = groundY;
    dino.velocityY = 0;
    dino.isJumping = false;
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= speed;
  });

  if (obstacles.length && obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
    spawnObstacle();
  }

  score += delta * 0.02;
  speed = baseSpeed + score * 0.004;
}

function checkCollisions() {
  return obstacles.some((obstacle) => {
    const hitX = dino.x < obstacle.x + obstacle.width && dino.x + dino.width > obstacle.x;
    const hitY = dino.y < obstacle.y + obstacle.height && dino.y + dino.height > obstacle.y;
    return hitX && hitY;
  });
}

function loop(timestamp) {
  if (!running) return;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  update(delta);
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawClouds(delta);
  drawGround();
  drawObstacles();
  drawDino();
  updateScore();

  if (checkCollisions()) {
    endGame();
    return;
  }

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    handleJump();
  }
});

canvas.addEventListener("pointerdown", () => {
  handleJump();
});

startButton.addEventListener("click", () => {
  startGame();
});

resetButton.addEventListener("click", () => {
  bestScore = 0;
  localStorage.removeItem(bestScoreKey);
  bestEl.textContent = "0";
});

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) {
    handleJump();
  }
});

resetGame();
