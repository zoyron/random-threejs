import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

/**
 * Base setup
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera and lights(optional)
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

// Texture
const textureLoader = new THREE.TextureLoader();
const colorMap = textureLoader.load("/sunTexture.jpeg");
const alphaMap = textureLoader.load("/sunTexture.jpeg");

const vert = 40;
const geometry = new THREE.IcosahedronGeometry(3, vert);
const material = new THREE.ShaderMaterial({
  uniforms: {
    uColorMap: { value: colorMap },
    uAlphaMap: { value: alphaMap },
    uTime: { value: 0.0 },
    uSize: { value: 3.0 },
    uMouseUV: { value: new THREE.Vector2(0.0, 0.0) },
  },
  transparent: true,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});
const mesh = new THREE.Points(geometry, material);
scene.add(mesh);

/**
 * Adding mouse interactivity
 */

const pointerPos = new THREE.Vector2();
const sunUV = new THREE.Vector2();

// mouse-move event listener and setting the pointerPos vector's values
window.addEventListener("mousemove", (evt) => {
  pointerPos.set(
    (evt.clientX / sizes.width) * 2 - 1, // this changes the range from [0,1] to [-1, 1]
    -(evt.clientY / sizes.height) * 2 + 1
  );
});

// Adding raycaster to set the value of sunUV
const raycaster = new THREE.Raycaster();
function handleRaycast() {
  raycaster.setFromCamera(pointerPos, camera);
  const intersects = raycaster.intersectObjects([mesh], false);
  if (intersects.length > 0) {
    sunUV.copy(intersects[0].uv);
  }
  material.uniforms.uMouseUV.value = sunUV;
}

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
  mesh.rotation.y += 0.005;

  // Update time
  material.uniforms.uTime.value += 0.0025;

  // Update controls
  controls.update();

  // Adding renderer
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
