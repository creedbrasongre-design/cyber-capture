import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#game");
const statusText = document.querySelector("#status");
const scoreText = document.querySelector("#score");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07101d);
scene.fog = new THREE.Fog(0x07101d, 18, 44);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 7, 10);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// ---------- Lighting ----------
scene.add(new THREE.HemisphereLight(0x9ff6ff, 0x111018, 1.15));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
keyLight.position.set(5, 10, 7);
keyLight.castShadow = true;
scene.add(keyLight);

const cyanLight = new THREE.PointLight(0x18eaff, 1.6, 20);
cyanLight.position.set(0, 5, 0);
scene.add(cyanLight);

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
  emissiveIntensity: 2.0,
  roughness: 0.25
});

const redMat = new THREE.MeshStandardMaterial({
  color: 0xff405e,
  emissive: 0xff1738,
  emissiveIntensity: 0.8
});

const blueMat = new THREE.MeshStandardMaterial({
  color: 0x2db7ff,
  emissive: 0x0077ff,
  emissiveIntensity: 0.8
});

// ---------- World ----------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 28),
  new THREE.MeshStandardMaterial({ color: 0x0c1725, roughness: 0.75 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(28, 28, 0x28d7ff, 0x17445b);
grid.position.y = 0.01;
scene.add(grid);

function makeBase(material, x, z) {
  const base = new THREE.Group();

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.2, 0.3, 32),
    material
  );
  platform.position.y = 0.15;
  platform.castShadow = true;
  platform.receiveShadow = true;
  base.add(platform);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.05, 8, 48), cyanMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.34;
  base.add(ring);

  base.position.set(x, 0, z);
  scene.add(base);
  return base;
}

function makeFlag(material, x, z) {
  const flag = new THREE.Group();

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.4, 12), bronzeMat);
  pole.position.y = 1.2;
  pole.castShadow = true;
  flag.add(pole);

  const banner = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.72, 0.04), material);
  banner.position.set(0.6, 1.75, 0);
  banner.castShadow = true;
  flag.add(banner);

  const gem = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 10), cyanMat);
  gem.position.y = 2.45;
  flag.add(gem);

  flag.position.set(x, 0, z);
  scene.add(flag);
  return flag;
}

const redBase = makeBase(redMat, 0, 9);
makeBase(blueMat, 0, -9);
const blueFlag = makeFlag(blueMat, 0, -9);
const carriedFlag = makeFlag(blueMat, 0, 0);
carriedFlag.scale.set(0.55, 0.55, 0.55);
carriedFlag.visible = false;

// ---------- Backup robot builder ----------
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

function createBackupRobot() {
  const robot = new THREE.Group();

  addMesh(robot, new THREE.SphereGeometry(0.75, 32, 20), stoneMat, [0, 1.2, 0], [0.8, 0.95, 0.65]);
  addMesh(robot, new THREE.SphereGeometry(0.62, 32, 20), stoneMat, [0, 2.3, 0], [0.95, 0.68, 0.72]);

  addMesh(robot, new THREE.BoxGeometry(0.75, 0.27, 0.06), darkMat, [0, 2.3, 0.55]);
  addMesh(robot, new THREE.BoxGeometry(0.14, 0.14, 0.05), cyanMat, [-0.22, 2.33, 0.61]);
  addMesh(robot, new THREE.BoxGeometry(0.14, 0.14, 0.05), cyanMat, [0.22, 2.33, 0.61]);

  addMesh(robot, new THREE.SphereGeometry(0.18, 24, 16), cyanMat, [0, 1.25, 0.62], [1, 1, 0.35]);
  addMesh(robot, new THREE.TorusGeometry(0.25, 0.035, 8, 32), bronzeMat, [0, 1.25, 0.63], [1, 1, 1], [Math.PI / 2, 0, 0]);

  addMesh(robot, new THREE.BoxGeometry(1.15, 0.08, 0.12), bronzeMat, [0, 0.78, 0.5]);
  addMesh(robot, new THREE.BoxGeometry(0.06, 0.55, 0.035), cyanMat, [0, 1.58, 0.64]);

  for (const side of [-1, 1]) {
    addMesh(robot, new THREE.SphereGeometry(0.23, 20, 12), stoneMat, [side * 0.82, 1.48, 0]);
    addMesh(robot, new THREE.CylinderGeometry(0.09, 0.09, 0.75, 12), stoneMat, [side * 1.02, 1.05, 0], [1, 1, 1], [0, 0, side * 0.35]);
    addMesh(robot, new THREE.BoxGeometry(0.28, 0.24, 0.22), stoneMat, [side * 1.25, 0.45, 0.02]);

    addMesh(robot, new THREE.CylinderGeometry(0.095, 0.095, 0.58, 12), stoneMat, [side * 0.36, 0.48, 0.02]);
    addMesh(robot, new THREE.ConeGeometry(0.23, 0.45, 16), stoneMat, [side * 0.42, -0.15, 0.06], [1, 1, 1], [Math.PI, 0, 0]);
    addMesh(robot, new THREE.TorusGeometry(0.28, 0.025, 8, 32), cyanMat, [side * 0.42, -0.42, 0.06], [1, 1, 1], [Math.PI / 2, 0, 0]);
  }

  addMesh(robot, new THREE.CylinderGeometry(0.035, 0.035, 0.55, 12), bronzeMat, [0.25, 2.95, 0.02], [1, 1, 1], [0.38, 0, 0]);
  addMesh(robot, new THREE.SphereGeometry(0.12, 20, 12), cyanMat, [0.34, 3.24, 0.08]);

  return robot;
}

// ---------- Player ----------
let player = new THREE.Group();
player.position.set(0, 0.55, 6.2);
scene.add(player);

// Show backup robot immediately.
let backupRobot = createBackupRobot();
backupRobot.rotation.y = Math.PI;
player.add(backupRobot);

let robotModel = null;

// IMPORTANT: this looks for patch_robot.glb in the same root folder as index.html and game.js.
const loader = new GLTFLoader();
loader.load(
  "./patch_robot.glb",
  (gltf) => {
    if (backupRobot) {
      player.remove(backupRobot);
      backupRobot = null;
    }

    robotModel = gltf.scene;
    robotModel.scale.set(0.9, 0.9, 0.9);
    robotModel.rotation.y = Math.PI;

    robotModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const name = child.name.toLowerCase();
        if (
          name.includes("glow") ||
          name.includes("cyan") ||
          name.includes("eye") ||
          name.includes("core")
        ) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x14d9ff);
          child.material.emissiveIntensity = 1.8;
        }
      }
    });

    player.add(robotModel);
    statusText.textContent = "GLB robot loaded. Find the blue flag.";
  },
  undefined,
  (error) => {
    console.error("GLB load error:", error);
    statusText.textContent = "Using backup robot. The GLB did not load.";
  }
);

// ---------- Controls and game rules ----------
let hasFlag = false;
let score = 0;
const keys = {};

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

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

    player.position.x += dx * 0.085;
    player.position.z += dz * 0.085;

    player.position.x = THREE.MathUtils.clamp(player.position.x, -12, 12);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -12, 12);

    player.rotation.y = Math.atan2(dx, dz);
  }

  const t = performance.now() * 0.003;
  player.position.y = 0.55 + Math.sin(t) * 0.07;

  if (robotModel) robotModel.rotation.z = Math.sin(t * 1.7) * 0.025;
  if (backupRobot) backupRobot.rotation.z = Math.sin(t * 1.7) * 0.025;

  carriedFlag.position.set(player.position.x + 0.75, 0.8, player.position.z + 0.1);
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
    player.position.set(0, 0.55, 6.2);

    scoreText.textContent = `Score: ${score} / 3`;

    if (score >= 3) {
      statusText.textContent = "You win! The robot captured 3 flags!";
    } else {
      statusText.textContent = "Score! Go capture the flag again.";
    }
  }
}

function updateCamera() {
  camera.position.x += (player.position.x - camera.position.x) * 0.055;
  camera.position.z += (player.position.z + 9 - camera.position.z) * 0.055;
  camera.position.y += (6.4 - camera.position.y) * 0.04;
  camera.lookAt(player.position.x, 1.2, player.position.z);
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
