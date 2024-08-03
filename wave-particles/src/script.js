import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import matcap from "../static/ocean.jpg";
import ocean from "../static/ocean2.jpg";
/**
 * base setup - scene, camera
 */
const scene = new THREE.Scene();
// camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
// texture
const matcapTexture = new THREE.TextureLoader().load(matcap);
const oceanTexture = new THREE.TextureLoader().load(ocean);
matcapTexture.colorSpace = THREE.SRGBColorSpace;
oceanTexture.colorSpace = THREE.SRGBColorSpace;
/**
 * Geometry, material and mesh
 */
// simple mesh, no points
const geometry = new THREE.PlaneGeometry(10, 10, 150, 150).rotateX(
  -Math.PI / 2
);
const material = new THREE.MeshMatcapMaterial({
  matcap: matcapTexture,
  side: THREE.DoubleSide,
});
material.color.setHSL(0.6, 1, 0.5); // Adjust as needed
const plane = new THREE.Mesh(geometry, material);

// Points and points material
// const geometry = new THREE.PlaneGeometry(10, 10, 150, 150).rotateX(
//   -Math.PI / 2
// );
// const material = new THREE.PointsMaterial({
//   size: 0.0005,
//   map: oceanTexture,
//   transparent: true,
//   blending: THREE.AdditiveBlending,
//   depthWrite: false,
//   depthTest: true, // Adjust based on your needs
//   opacity: 0.7,
//   // alphaTest: 0.01,
//   side: THREE.DoubleSide,
// });

// material.color.setHSL(0.6, 1, 0.5); // Adjust as needed
// const plane = new THREE.Points(geometry, material);
scene.add(plane);
console.log(plane.position);
camera.position.set(0, 7.5, 5);
camera.lookAt(plane.position);
/**
 * Adding motion to the mesh
 * Gerstner waves in this case
 */
// console.log(originalPositions);
let originalPositions = [...geometry.attributes.position.array];
function updateGeometry(time) {
  let positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    let x = originalPositions[i];
    let y = originalPositions[i + 1];
    let z = originalPositions[i + 2];
    positions[i] = x;
    positions[i + 1] = y;
    positions[i] -= 0.4 * Math.sin(x * 0.5 + time);
    positions[i + 1] += 0.4 * Math.cos(x * 0.5 + time);
    positions[i] -= 0.2 * Math.sin(x + time * 0.5);
    positions[i + 1] += 0.2 * Math.cos(x + time * 0.5);
    positions[i] -= 0.1 * Math.sin(x * 2 + time * 0.425);
    positions[i + 1] += 0.1 * Math.cos(x * 2 + time * 0.425);
    positions[i] -= 0.5 * Math.sin(x * 2 + 2 * z + time * 0.5);
    positions[i + 1] += 0.5 * Math.cos(x * 2 + 2 * z + time * 0.5);
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
}
/**
 * Resize eventlistener
 */
window.addEventListener("resize", () => {
  // update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  // update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
/**
 * orbit controls and animate function
 */
const controls = new OrbitControls(camera, renderer.domElement);
function animate(time) {
  updateGeometry(time / 2000);
  renderer.render(scene, camera);
}
