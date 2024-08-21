import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshSurfaceSampler, OBJLoader } from "three/examples/jsm/Addons.js";

/**
 * Base setup
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);
const light = new THREE.AmbientLight(0xffffff, 6);
scene.add(light);

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
camera.position.set(0, 18, 40);
scene.add(camera);

/**
 * Adding the 3d object
 */

let character = null;
let sampler = null;
let opp = 0.125;
let pointsGeometry, pointsMaterial, points;

const objectLoader = new OBJLoader();

objectLoader.load("/model/heart1.obj", (obj) => {
  // obj.position.set(0, -15, 0);
  // obj.scale.set(0.5, 0.5, 0.5);
  obj.scale.set(4, 4, 4);
  obj.traverse((child) => {
    if (child.isMesh) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.wireframe = true;
          mat.transparent = true;
          mat.opacity = opp;
          mat.color = new THREE.Color(0xfa0000);
        });
      } else {
        child.material.wireframe = true;
        child.material.transparent = true;
        child.material.opacity = opp;
        child.material.color = new THREE.Color(0xfa0000);
      }
    }
  });
  character = obj.children[0];
  sampler = new MeshSurfaceSampler(character).build();
  console.log(sampler);
  group.add(obj);
  console.log(obj);

  // creating a buffer geometry and points
  pointsGeometry = new THREE.BufferGeometry();
  pointsMaterial = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xfa0000,
    transparent: true,
    opacity: 0.8,
  });
  points = new THREE.Points(pointsGeometry, pointsMaterial);
  points.position.copy(obj.position);
  points.scale.copy(obj.scale); // Apply the same scale to the points

  group.add(points);
});

/**
 * Add points function
 * this function adds a new point in the frame whenever called
 */
let count = 200000;
let vertices = new Float32Array(count * 3);
let tempPosition = new THREE.Vector3();
let i = 0;

function addPoint() {
  if (sampler) {
    sampler.sample(tempPosition);
    vertices[i++] = tempPosition.x;
    vertices[i++] = tempPosition.y;
    vertices[i++] = tempPosition.z;

    // setting the position attribute in the pointsGeometry
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3)
    );
  }
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
  // Rotate the group
  group.rotation.y += 0.0025;

  // adding the points
  if (sampler) {
    for (let x = 0; x < 10; x++) {
      addPoint();
    }
  }
  // Update controls
  controls.update();

  // Adding renderer
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
