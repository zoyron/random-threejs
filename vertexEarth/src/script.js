import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import getStarField from "./getStarField";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

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

// Creating a group
const group = new THREE.Group();
scene.add(group);
/**
 * Camera and textures
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

// Texture loader
const textureLoader = new THREE.TextureLoader();
const starTexture = textureLoader.load("/circle.png");
const colorMap = textureLoader.load("/earthmap1k.jpg");
const elevationMap = textureLoader.load("/earthbump1k.jpg");
const alphaMap = textureLoader.load("/earthspec1k.jpg");

/**
 * Adding a base mesh
 */
const geometry = new THREE.IcosahedronGeometry(2.5, 10);
const material = new THREE.MeshBasicMaterial({
  color: 0x202020,
  wireframe: true,
});
const mesh = new THREE.Mesh(geometry, material);
// group.add(mesh);

// points mesh
const vert = 200;
// const pointsGeometry = new THREE.SphereGeometry(2.5, vert, vert, vert);
const pointsGeometry = new THREE.IcosahedronGeometry(2.75, vert);
// const pointsMaterial = new THREE.PointsMaterial({
//   size: 0.03,
//   map: colorMap,
// });

// Shader material
const pointsMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uTime: { value: 0.0 },
    uSize: { value: 3.0 },
    uColorMap: { value: colorMap },
    uElevationMap: { value: elevationMap },
    uAlphaMap: { value: alphaMap },
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
});
const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
group.add(pointsMesh);

// adding the star field
const stars = getStarField({ numStars: 4500, sprite: starTexture });
scene.add(stars);

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
  // group.rotation.x += 0.0125;
  group.rotation.y += 0.0025;

  // Update time
  pointsMaterial.uniforms.uTime.value += 0.0215;

  // Update controls
  controls.update();

  // Adding renderer
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
