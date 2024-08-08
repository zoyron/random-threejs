import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertex from "../shaders/vertex.glsl";
import fragment from "../shaders/fragment.glsl";

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
const geometry = new THREE.IcosahedronGeometry(2, 15);
const material = new THREE.ShaderMaterial({
  wireframe: true,
  vertexShader: vertex,
  fragmentShader: fragment,
  uniforms: {
    uResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
    uTime: { value: 0 },
  },
});
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
  // update time uniform
  material.uniforms.uTime.value += 0.0125;

  // Rotate mesh
  mesh.rotation.y += 0.005;

  // Update controls
  controls.update();

  // Adding renderer
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
