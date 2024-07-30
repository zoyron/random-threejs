import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * setting base
 */

// canvas and scene
const canvas = document.querySelector("canvas.webgl");
const scene = new THREE.Scene();

// screen sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 5, 5);
scene.add(camera);

/**
 * Renderer and window resizing
 */

// renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// window resizing
window.addEventListener("resize", () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // updating camera settings
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // recaliberating renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * adding objects
 * Generating galaxy in this experiment
 */

const galaxyParameters = {};
galaxyParameters.count = 1000;
galaxyParameters.size = 0.02;
// generate galaxy function
function generateGalaxy() {
  const galaxyGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(galaxyParameters.count * 3);
  for (let i = 0; i < galaxyParameters.count; i++) {
    let i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 3;
    positions[i3 + 1] = (Math.random() - 0.5) * 3;
    positions[i3 + 2] = (Math.random() - 0.5) * 3;
  }

  // setting the position attribute using the positions array
  galaxyGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  // Material
  const galaxyMaterial = new THREE.PointsMaterial({
    size: galaxyParameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Points mesh
  const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxyPoints);
}
generateGalaxy();

/**
 * animate and orbit controls
 */

// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// animate
const animate = () => {
  controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

animate();
