import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Base setup
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Perspective Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(3, 3, 3);
scene.add(camera);

/**
 * Adding a base mesh
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

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
const animate = () => {
  // Rotate mesh
  mesh.rotation.x += 0.0125;
  mesh.rotation.y += 0.0125;

  // Update controls
  controls.update();

  // Adding renderer
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
