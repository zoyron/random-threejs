import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import GUI from "lil-gui";
import particlesVertexShader from "./shaders/vertex.glsl";
import particlesFragmentShader from "./shaders/fragment.glsl";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {
  clearColor: "#160920",
};

// Canvas
const canvas = document.querySelector(
  "canvas.webgl"
) as HTMLCanvasElement | null;

if (!canvas) {
  throw new Error("Canvas element not found");
}

// Scene
const scene = new THREE.Scene();

// Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

  // Materials
  if (particles) {
    particles.material.uniforms.uResolution.value.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    );
  }

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 8 * 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});
renderer.setClearColor(debugObject.clearColor);

// Load Models
let particles: any = null;
gltfLoader.load("./models.glb", (gltf) => {
  /**
   * Particles
   * instead of creating just a particles variable, we created it an object
   * since, lil-gui only acts on objects, hence this is done so that we can use lil-gui to morph it into other things
   */
  particles = {};

  /**
   * we want to extract the geometries from the objects in the models
   * more specifically, we want the "position" attribute of the models
   */
  // Positions
  // the purpose of the map function is to return something new from the array, to extract something from each child element in the array
  const positions: Array<Float32Array> = gltf.scene.children
    .filter(
      (child): child is THREE.Mesh =>
        (child as THREE.Mesh).geometry !== undefined
    )
    .map((child: THREE.Mesh) => {
      const positionArray = child.geometry.attributes.position
        .array as Float32Array;
      // Check for NaN values in the position array
      for (let i = 0; i < positionArray.length; i++) {
        if (isNaN(positionArray[i])) {
          console.error(`NaN value found in position array at index ${i}`);
          return new Float32Array(); // Return an empty array to avoid issues
        }
      }
      return positionArray;
    });

  particles.maxCount = 0;

  // setting the same number of positions for each model.
  // setting each to max number of positions
  for (const position of positions) {
    if (position.length / 3 > particles.maxCount)
      // Divide by 3 because each vertex has 3 coordinates (x, y, z)
      particles.maxCount = position.length / 3;
  }

  // Geometry
  particles.geometry = new THREE.BufferGeometry();
  particles.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(particles.maxCount * 3), 3)
  );

  // Compute bounding sphere
  particles.geometry.computeBoundingSphere();

  // Material
  particles.material = new THREE.ShaderMaterial({
    vertexShader: particlesVertexShader,
    fragmentShader: particlesFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.4),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          sizes.width * sizes.pixelRatio,
          sizes.height * sizes.pixelRatio
        )
      ),
    },
    blending: THREE.AdditiveBlending, // it draws the fragments on top of the previous fragments making the result brighter. The colors combine to create a glowing luminous appearance
    depthWrite: false,
  });

  // Points
  particles.points = new THREE.Points(particles.geometry, particles.material);
  scene.add(particles.points);
});

/**
 * Animate
 */
const animate = () => {
  // Update controls
  controls.update();

  // Render normal scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();
