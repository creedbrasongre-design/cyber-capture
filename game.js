import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#game");
const statusText = document.querySelector("#status");
const scoreText = document.querySelector("#score");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07101d);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 8, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const loader = new THREE.TextureLoader();

function makeSprite(imagePath, width, height) {
  const texture = loader.load(imagePath);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);
  scene.add(sprite);
  return sprite;
}

// Floor
const floorTexture = loader.load("assets/world/cyber_floor.png");
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(10, 10);
floorTexture.colorSpace = THREE.SRGBColorSpace;

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.MeshBasicMaterial({ map: floorTexture })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Light grid walls / border
function makeWall(x, z, width, height) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.2),
    new THREE.MeshBasicMaterial({ color: 0x123247, wireframe: true })
  );
  wall.position.set(x, height / 2, z);
  scene.add(wall);
  return wall;
}
makeWall(0, -12, 24, 3);
makeWall(0, 12, 24, 3);

// Bases and flags are image sprites inside 3D space
const redBase = makeSprite("assets/world/red_base.png", 3, 3);
redBase.position.set(0, 1.4, 8);

const blueBase = makeSprite("assets/world/blue_base.png", 3, 3);
blueBase.position.set(0, 1.4, -8);

const blueFlag = makeSprite("assets/world/blue_flag.png", 1.8, 1.8);
blueFlag.position.set(0, 1.2, -8);

// Robot player
const robotChoices = {
  "1": { file: "assets/robots/patch_tall.png", width: 1.8, height: 3.2, speed: 0.09 },
  "2": { file: "assets/robots/patch_short.png", width: 2.2, height: 2.0, speed: 0.065 },
  "3": { file: "assets/robots/patch_round.png", width: 2.2, height: 2.2, speed: 0.075 },
  "4": { file: "assets/robots/patch_scout.png", width: 1.8, height: 2.7, speed: 0.11 }
};

let currentRobot = robotChoices["3"];
let player = makeSprite(currentRobot.file, currentRobot.width, currentRobot.height);
player.position.set(0, currentRobot.height / 2, 5.5);

let hasFlag = false;
let score = 0;

// A small flag that follows the player when captured
const carriedFlag = makeSprite("assets/world/blue_flag.png", 0.9, 0.9);
carriedFlag.visible = false;

const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (robotChoices[event.key]) {
    switchRobot(event.key);
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

function switchRobot(numberKey) {
  const oldPosition = player.position.clone();
  scene.remove(player);

  currentRobot = robotChoices[numberKey];
  player = makeSprite(currentRobot.file, currentRobot.width, currentRobot.height);
  player.position.copy(oldPosition);
  player.position.y = currentRobot.height / 2;

  statusText.textContent = `Robot changed. Current speed: ${currentRobot.speed.toFixed(2)}`;
}

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

function updatePlayer() {
  let dx = 0;
  let dz = 0;

  if (keys["w"] || keys["arrowup"]) dz -= 1;
  if (keys["s"] || keys["arrowdown"]) dz += 1;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;

  if (dx !== 0 || dz !== 0) {
    const length = Math.sqrt(dx * dx + dz * dz);
    dx /= length;
    dz /= length;

    player.position.x += dx * currentRobot.speed;
    player.position.z += dz * currentRobot.speed;

    // Keep player inside the map
    player.position.x = THREE.MathUtils.clamp(player.position.x, -10, 10);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -10, 10);
  }

  // Gentle hover animation
  const t = performance.now() * 0.003;
  player.position.y = currentRobot.height / 2 + Math.sin(t) * 0.08;

  carriedFlag.position.set(player.position.x + 0.85, player.position.y + 0.5, player.position.z);
}

function updateGameRules() {
  if (!hasFlag && distance2D(player.position, blueFlag.position) < 1.4) {
    hasFlag = true;
    blueFlag.visible = false;
    carriedFlag.visible = true;
    statusText.textContent = "You captured the blue flag! Return to the red base!";
  }

  if (hasFlag && distance2D(player.position, redBase.position) < 1.8) {
    hasFlag = false;
    score += 1;
    blueFlag.visible = true;
    carriedFlag.visible = false;
    player.position.set(0, currentRobot.height / 2, 5.5);

    scoreText.textContent = `Score: ${score} / 3`;

    if (score >= 3) {
      statusText.textContent = "You win! You captured 3 flags!";
    } else {
      statusText.textContent = "Score! Go capture the flag again.";
    }
  }
}

function updateCamera() {
  // Follow from above and behind
  camera.position.x += (player.position.x - camera.position.x) * 0.06;
  camera.position.z += (player.position.z + 8 - camera.position.z) * 0.06;
  camera.lookAt(player.position.x, 0.7, player.position.z);
}

function animate() {
  updatePlayer();
  updateGameRules();
  updateCamera();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
