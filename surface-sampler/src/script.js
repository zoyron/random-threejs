import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/Addons.js";
import { MTLLoader } from "three/examples/jsm/Addons.js";

/**
 * Base setup
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const light = new THREE.AmbientLight(0xffffff, 4);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(20, 20, 20);
scene.add(camera);

/**
 * Adding the 3d object
 */

const materialLoader = new MTLLoader();
const objectLoader = new OBJLoader();
materialLoader.load("/model/treeMaterial.mtl", (material) => {
  material.preload();

  objectLoader.setMaterials(material);
  objectLoader.load("/model/tree.obj", (obj) => {
    obj.position.set(0, -12, 0);
    obj.traverse((child) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            mat.wireframe = true;
          });
        } else {
          child.material.wireframe = true;
        }
      }
    });
    scene.add(obj);
    console.log(obj);
  });
});

/**
 * Adding a base mesh
 */
const geometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

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
