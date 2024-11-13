import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";

let cubes = [];

const cursor = new THREE.Vector3();
const oPos = new THREE.Vector3();
const vec = new THREE.Vector3();
const dir = new THREE.Vector3();

const gap = 0.1;
const stride = 5;
const displacement = 3;
const intensity = 1;

/**
 * Base setup
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color("#151520");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera and Lights
 */
// Perspective Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(5, 5, 5);
scene.add(camera);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xaaaaaa, 1.5);
scene.add(ambientLight);

// Spotlight
const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(-10, 20, 20);
spotLight.angle = 0.15;
spotLight.penumbra = 1;
spotLight.decay = 0;
spotLight.castShadow = true;
scene.add(spotLight);

/**
 * Adding a base mesh
 */
const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.15);
const material = new THREE.MeshLambertMaterial();
const center = stride / 2;
for (let x = 0; x < stride; x++) {
  for (let y = 0; y < stride; y++) {
    for (let z = 0; z < stride; z++) {
      const cube = new THREE.Mesh(geometry, material.clone());
      const position = new THREE.Vector3(
        x + x * gap - center,
        y + y * gap - center,
        z + z * gap - center
      );
      cube.position.copy(position);
      cube.userData.originalPosition = position.clone();
      cube.castShadow = true;
      cube.receiveShadow = true;
      scene.add(cube);
      cubes.push(cube);
    }
  }
}

/**
 *
 */
// Mouse move
window.addEventListener("mousemove", (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  // Change this line
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  cursor.set(mouse.x, mouse.y, 0.5).unproject(camera);
  dir.copy(cursor).sub(camera.position).normalize();
  cursor.add(dir.multiplyScalar(camera.position.length()));
});

/**
 * Renderer and Resizing
 */
// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resizing
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate and controls
 */
// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  cubes.forEach((cube) => {
    oPos.copy(cube.userData.originalPosition);
    dir.copy(oPos).sub(cursor).normalize();
    const dist = oPos.distanceTo(cursor);
    const distInv = displacement - dist;
    const col = Math.max(0.5, distInv) / 1.5;
    if (dist > displacement * 1.1) {
      cube.material.color.lerp(new THREE.Color("white"), 0.1);
    } else {
      cube.material.color.lerp(new THREE.Color(col / 2, col * 2, col * 4), 0.2);
    }
    if (dist > displacement) {
      cube.position.lerp(oPos, 0.2);
    } else {
      vec.copy(oPos).add(dir.multiplyScalar(distInv * intensity));
      cube.position.lerp(vec, 0.2);
    }
  });
  renderer.render(scene, camera);
}
animate();

