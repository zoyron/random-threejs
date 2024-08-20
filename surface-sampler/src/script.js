import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

/**
 * Base setup
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene and a group
const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);
const ambientLight = new THREE.AmbientLight(0xffffff, 4.0);
scene.add(ambientLight);

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
camera.position.set(0, 1, 4);
scene.add(camera);

/**
 * Loading the model
 */
let sampler = null;
let chatacter = null;
const loader = new GLTFLoader();
loader.load("/model/Character.glb", (obj) => {
  console.log(obj.scene);
  // obj.scene.scale.set(0.035, 0.035, 0.035);
  obj.scene.position.set(0, -1.5, 0);
  chatacter = obj.scene;
  chatacter.traverse((child) => {
    if (child.isMesh) {
      child.material.wireframe = true;
    }
  });
  scene.add(obj.scene);
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
const animate = () => {
  // Rotate mesh
  group.rotation.x += 0.0125;
  group.rotation.y += 0.0125;

  // Update controls
  controls.update();

  // Adding renderer
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
