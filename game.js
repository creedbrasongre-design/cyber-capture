import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const canvas = document.querySelector("#game");
const statusText = document.querySelector("#status");
const scoreText = document.querySelector("#score");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07101d);
scene.fog = new THREE.Fog(0x07101d, 18, 42);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 7, 10);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// ---------- Materials ----------
const stoneMat = new THREE.MeshStandardMaterial({
  color: 0x30343b,
  roughness: 0.85,
  metalness: 0.25
});

const bronzeMat = new THREE.MeshStandardMaterial({
  color: 0xb9873c,
  roughness: 0.45,
  metalness: 0.75
});

const darkMat = new THREE.MeshStandardMaterial({
  color: 0x080b10,
  roughness: 0.35,
  metalness: 0.25
});

const cyanMat = new THREE.MeshStandardMaterial({
  color: 0x37e9ff,
  emissive: 0x14d9ff,
  emissiveIntensity: 2.2,
  roughness: 0.25,
  metalness: 0.2
});

const redMat = new THREE.MeshStandardMaterial({
  color: 0xff405e,
  emissive: 0xff1738,
  emissiveIntensity: 0.8,
  roughness: 0.45
});

const blueMat = new THREE.MeshStandardMaterial({
  color: 0x2db7ff,
  emissive: 0x0077ff,
  emissiveIntensity: 0.8,
  roughness: 0.45
});

// ---------- Lighting ----------
const hemi = new THREE.HemisphereLight(0x9ff6ff, 0x111018, 1.1);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 10, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
scene.add(keyLight);

const cyanLight = new THREE.PointLight(0x18eaff, 1.4, 18);
cyanLight.position.set(0, 5, 0);
scene.add(cyanLight);

// ---------- Helpers ----------
function addMesh(group, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addGlowSphere(group, position, radius) {
  return addMesh(
    group,
    new THREE.SphereGeometry(radius, 24, 16),
    cyanMat,
    position
  );
}

function addCyanLine(group, position, scale, rotation = [0, 0, 0]) {
  return addMesh(
    group,
    new THREE.BoxGeometry(1, 1, 1),
    cyanMat,
    position,
    scale,
    rotation
  );
}

function addBronzeBand(group, position, scale, rotation = [0, 0, 0]) {
  return addMesh(
    group,
    new THREE.BoxGeometry(1, 1, 1),
    bronzeMat,
    position,
    scale,
    rotation
  );
}

function createHoverRing(radius = 0.32) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.025, 8, 32),
    cyanMat
  );
  ring.rotation.x = Math.PI / 2;
  return ring;
}

// ---------- Real 3D Robot Builder ----------
function createRobot(type = "round") {
  const robot = new THREE.Group();
  robot.userData.type = type;

  let config = {
    height: 2.4,
    width: 1.15,
    torsoShape: "sphere",
    headScale: [1.05, 0.75, 0.8],
    torsoScale: [0.85, 0.95, 0.75],
    armLength: 1.0,
    legLength: 0.65,
    speed: 0.075
  };

  if (type === "tall") {
    config = {
      height: 3.15,
      width: 0.95,
      torsoShape: "capsule",
      headScale: [0.9, 0.65, 0.7],
      torsoScale: [0.62, 1.05, 0.55],
      armLength: 1.25,
      legLength: 1.15,
      speed: 0.09
    };
  }

  if (type === "tank") {
    config = {
      height: 2.05,
      width: 1.55,
      torsoShape: "box",
      headScale: [1.15, 0.72, 0.85],
      torsoScale: [1.22, 0.7, 0.78],
      armLength: 0.82,
      legLength: 0.42,
      speed: 0.062
    };
  }

  if (type === "scout") {
    config = {
      height: 2.75,
      width: 0.82,
      torsoShape: "cone",
      headScale: [0.85, 0.85, 0.68],
      torsoScale: [0.65, 1.15, 0.58],
      armLength: 1.05,
      legLength: 0.95,
      speed: 0.11
    };
  }

  robot.userData.speed = config.speed;
  robot.userData.height = config.height;

  const torsoY = 1.2;
  const headY = torsoY + config.height * 0.33;

  // Torso
  if (config.torsoShape === "sphere") {
    addMesh(robot, new THREE.SphereGeometry(0.72, 32, 20), stoneMat, [0, torsoY, 0], config.torsoScale);
  } else if (config.torsoShape === "box") {
    addMesh(robot, new THREE.BoxGeometry(1.25, 1, 0.85), stoneMat, [0, torsoY, 0], config.torsoScale);
  } else if (config.torsoShape === "cone") {
    addMesh(robot, new THREE.ConeGeometry(0.75, 1.45, 5), stoneMat, [0, torsoY, 0], config.torsoScale, [0, Math.PI / 5, Math.PI]);
  } else {
    addMesh(robot, new THREE.CylinderGeometry(0.55, 0.6, 1.4, 18), stoneMat, [0, torsoY, 0], config.torsoScale);
  }

  // Chest core
  addGlowSphere(robot, [0, torsoY + 0.1, 0.56], 0.18);
  addMesh(robot, new THREE.TorusGeometry(0.24, 0.035, 8, 32), bronzeMat, [0, torsoY + 0.1, 0.57], [1, 1, 1], [0, 0, 0]);

  // Cyan circuit lines on body
  addCyanLine(robot, [0, torsoY + 0.48, 0.58], [0.05, 0.45, 0.035]);
  addCyanLine(robot, [-0.22, torsoY - 0.1, 0.58], [0.04, 0.4, 0.035], [0, 0, -0.55]);
  addCyanLine(robot, [0.22, torsoY - 0.1, 0.58], [0.04, 0.4, 0.035], [0, 0, 0.55]);

  // Bronze belt and trim
  addBronzeBand(robot, [0, torsoY - 0.48, 0.02], [config.width, 0.08, 0.82]);
  addBronzeBand(robot, [0, torsoY + 0.52, 0.02], [config.width * 0.8, 0.08, 0.75]);

  // Head
  addMesh(robot, new THREE.SphereGeometry(0.62, 32, 20), stoneMat, [0, headY, 0], config.headScale);

  // Face visor and eyes
  addMesh(robot, new THREE.BoxGeometry(0.72, 0.28, 0.05), darkMat, [0, headY, 0.54], [1, 1, 1]);
  addMesh(robot, new THREE.BoxGeometry(0.13, 0.13, 0.04), cyanMat, [-0.2, headY + 0.02, 0.59], [1, 1, 1]);
  addMesh(robot, new THREE.BoxGeometry(0.13, 0.13, 0.04), cyanMat, [0.2, headY + 0.02, 0.59], [1, 1, 1]);

  // Helmet bronze bands
  addBronzeBand(robot, [0, headY + 0.34, 0.05], [0.55, 0.08, 0.65]);
  addBronzeBand(robot, [0, headY - 0.33, 0.05], [0.9, 0.08, 0.7]);

  // Side ear discs
  const leftEar = addMesh(robot, new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24), bronzeMat, [-0.65 * config.headScale[0], headY, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
  const rightEar = addMesh(robot, new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24), bronzeMat, [0.65 * config.headScale[0], headY, 0], [1, 1, 1], [0, 0, Math.PI / 2]);
  addGlowSphere(robot, [-0.72 * config.headScale[0], headY, 0], 0.07);
  addGlowSphere(robot, [0.72 * config.headScale[0], headY, 0], 0.07);

  // Antenna
  addMesh(robot, new THREE.CylinderGeometry(0.035, 0.035, 0.5, 10), bronzeMat, [0.18, headY + 0.58, 0], [1, 1, 1], [0.35, 0, 0]);
  addGlowSphere(robot, [0.28, headY + 0.86, 0], 0.12);

  // Arms
  const shoulderY = torsoY + 0.35;
  const armSide = config.width * 0.68;

  function makeArm(side) {
    addMesh(robot, new THREE.SphereGeometry(0.22, 20, 12), stoneMat, [side * armSide, shoulderY, 0], [1, 1, 1]);
    addMesh(robot, new THREE.CylinderGeometry(0.09, 0.09, config.armLength, 12), stoneMat, [side * (armSide + 0.32), shoulderY - 0.36, 0], [1, 1, 1], [0.25, 0, side * 0.4]);
    addMesh(robot, new THREE.SphereGeometry(0.14, 16, 10), bronzeMat, [side * (armSide + 0.48), shoulderY - 0.82, 0], [1, 1, 1]);
    addMesh(robot, new THREE.BoxGeometry(0.28, 0.24, 0.22), stoneMat, [side * (armSide + 0.55), shoulderY - 1.02, 0], [1, 1, 1]);
    addGlowSphere(robot, [side * (armSide + 0.25), shoulderY - 0.1, 0.08], 0.055);
  }
  makeArm(-1);
  makeArm(1);

  // Legs / hover feet
  const legX = config.width * 0.32;
  function makeLeg(side) {
    addMesh(robot, new THREE.CylinderGeometry(0.095, 0.095, config.legLength, 12), stoneMat, [side * legX, torsoY - 0.75, 0], [1, 1, 1], [0.1, 0, side * 0.12]);
    addMesh(robot, new THREE.ConeGeometry(0.22, 0.42, 12), stoneMat, [side * legX, torsoY - 1.1 - config.legLength * 0.25, 0.04], [1, 1, 1], [Math.PI, 0, 0]);
    const ring = createHoverRing(0.28);
    ring.position.set(side * legX, torsoY - 1.35 - config.legLength * 0.25, 0.04);
    robot.add(ring);
  }
  makeLeg(-1);
  makeLeg(1);

  // Tiny stone cracks/details: bronze squares and glowing nodes
  addMesh(robot, new THREE.BoxGeometry(0.22, 0.16, 0.04), bronzeMat, [-0.38, torsoY + 0.3, 0.58]);
  addMesh(robot, new THREE.BoxGeometry(0.22, 0.16, 0.04), bronzeMat, [0.38, torsoY + 0.3, 0.58]);
  addGlowSphere(robot, [-0.42, torsoY - 0.18, 0.55], 0.045);
  addGlowSphere(robot, [0.42, torsoY - 0.18, 0.55], 0.045);

  return robot;
}

// ---------- 3D World ----------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 28, 28, 28),
  new THREE.MeshStandardMaterial({
    color: 0x0c1725,
    roughness: 0.75,
    metalness: 0.1,
    wireframe: false
  })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Grid lines
const grid = new THREE.GridHelper(28, 28, 0x28d7ff, 0x17445b);
grid.position.y = 0.01;
scene.add(grid);

// Map border blocks
function makeBorderBlock(x, z, sx, sz) {
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(sx, 0.7, sz),
    new THREE.MeshStandardMaterial({
      color: 0x152231,
      emissive: 0x063044,
      emissiveIntensity: 0.3
    })
  );
  block.position.set(x, 0.35, z);
  block.castShadow = true;
  block.receiveShadow = true;
  scene.add(block);
}
makeBorderBlock(0, -14, 28, 0.4);
makeBorderBlock(0, 14, 28, 0.4);
makeBorderBlock(-14, 0, 0.4, 28);
makeBorderBlock(14, 0, 0.4, 28);

// Bases
function createBase(colorMat, x, z) {
  const base = new THREE.Group();

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.2, 0.3, 32),
    colorMat
  );
  platform.position.y = 0.15;
  platform.castShadow = true;
  platform.receiveShadow = true;
  base.add(platform);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.05, 8, 48),
    cyanMat
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.34;
  base.add(ring);

  base.position.set(x, 0, z);
  scene.add(base);
  return base;
}

const redBase = createBase(redMat, 0, 9);
const blueBase = createBase(blueMat, 0, -9);

// Flag
function createFlag(material, x, z) {
  const flag = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 2.4, 12),
    bronzeMat
  );
  pole.position.y = 1.2;
  flag.add(pole);

  const banner = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.72, 0.04),
    material
  );
  banner.position.set(0.6, 1.75, 0);
  flag.add(banner);

  const gem = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 10),
    cyanMat
  );
  gem.position.y = 2.45;
  flag.add(gem);

  flag.position.set(x, 0, z);
  scene.add(flag);
  return flag;
}

const blueFlag = createFlag(blueMat, 0, -9);
const carriedFlag = createFlag(blueMat, 0, 0);
carriedFlag.scale.set(0.55, 0.55, 0.55);
carriedFlag.visible = false;

// ---------- Player ----------
const robotTypes = {
  "1": "tall",
  "2": "tank",
  "3": "round",
  "4": "scout"
};

let player = createRobot("round");
player.position.set(0, 0, 6.2);
scene.add(player);

let hasFlag = false;
let score = 0;
const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;

  if (robotTypes[event.key]) {
    switchRobot(robotTypes[event.key]);
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

function switchRobot(type) {
  const oldPosition = player.position.clone();
  const oldRotation = player.rotation.y;
  scene.remove(player);

  player = createRobot(type);
  player.position.copy(oldPosition);
  player.rotation.y = oldRotation;
  scene.add(player);

  statusText.textContent = `Switched to ${type} robot.`;
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

    player.position.x += dx * player.userData.speed;
    player.position.z += dz * player.userData.speed;

    player.position.x = THREE.MathUtils.clamp(player.position.x, -12, 12);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -12, 12);

    // Turn toward movement direction
    player.rotation.y = Math.atan2(dx, dz);
  }

  // Hover bob
  const t = performance.now() * 0.003;
  player.position.y = Math.sin(t) * 0.07;

  // Little arm/leg motion by moving whole model slightly
  player.rotation.z = Math.sin(t * 1.7) * 0.025;

  carriedFlag.position.set(player.position.x + 0.7, 1.1, player.position.z + 0.1);
  carriedFlag.rotation.y += 0.015;
}

function updateRules() {
  if (!hasFlag && distance2D(player.position, blueFlag.position) < 1.6) {
    hasFlag = true;
    blueFlag.visible = false;
    carriedFlag.visible = true;
    statusText.textContent = "You captured the blue flag! Return to the red base.";
  }

  if (hasFlag && distance2D(player.position, redBase.position) < 2.0) {
    hasFlag = false;
    score += 1;
    blueFlag.visible = true;
    carriedFlag.visible = false;
    player.position.set(0, 0, 6.2);

    scoreText.textContent = `Score: ${score} / 3`;

    if (score >= 3) {
      statusText.textContent = "You win! The 3D robot captured 3 flags!";
    } else {
      statusText.textContent = "Score! Go capture the flag again.";
    }
  }
}

function updateCamera() {
  camera.position.x += (player.position.x - camera.position.x) * 0.055;
  camera.position.z += (player.position.z + 9 - camera.position.z) * 0.055;
  camera.position.y += (6.2 - camera.position.y) * 0.04;
  camera.lookAt(player.position.x, 1.1, player.position.z);
}

function animate() {
  updatePlayer();
  updateRules();
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
