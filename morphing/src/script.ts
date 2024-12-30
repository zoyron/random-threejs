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
  // the purpose of the map function is to return something new from the array, to exract something from each child element in the array
  gltf.scene.children.map((child) => {
    console.log(child);
  });

  // Geometry
  particles.geometry = new THREE.SphereGeometry(3);
  particles.geometry.setIndex(null);

  /**
   * The idea is that we are going to send 2 sets of positions to vertex shader.
   *
   * Currently, the sphere we have is just one set of positions.
   * Sphere particles will be named "position" because vertex shader expects one argument to be named "position", so why not just give the starting figure that variable name. This would be marked as the initial shape.
   *
   * And the shape we are targetting to morph into would be named as "aTargetPosition" while sending the position attributes of the new shape to the vertex shaders.
   *
   * And to morph between the two shapes, we will be using a uniform named "uProgress" that will range from 0 to 1, and will be used to mix between the two shapes
   */

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
