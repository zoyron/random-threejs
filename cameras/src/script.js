import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// canvas
const canvas = document.querySelector("canvas.webgl");

// sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//scene
const scene = new THREE.Scene();

/**
 * creating the object, cube in this case
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
const material = new THREE.MeshBasicMaterial({ color: "red", wireframe: true });
const mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

/**
 * camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);

camera.position.set(2, 2, 2);
camera.lookAt(mesh.position);
scene.add(camera);

/**
 * window resize event listener
 */
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // update the camera
  camera.aspect = sizes.width / sizes.height;

  // update projection matrix
  camera.updateProjectionMatrix();

  // update the renderer after resizing the page
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * controls
 */
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * adding the full screen function
 * fuck, this style of comments  is so good, the double slash comments make the code looks so cluttered
 */
window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

const animate = () => {
  //   mesh.rotation.y += 0.015;

  controls.update();
  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
};

animate();
