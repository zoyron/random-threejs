import * as THREE from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
const material = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: false,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.x = 0.5;
camera.position.y = 1;
camera.position.z = 3;
camera.lookAt(mesh.position);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

const animate = () => {
  //update object
  mesh.rotation.y += 0.025;

  // update renderer
  renderer.render(scene, camera);
  // adding the animation
  window.requestAnimationFrame(animate);
};

animate();
