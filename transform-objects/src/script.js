import * as THREE from 'three';

const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

/*
* Objects
*/

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 'red' });
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.y = 0.5

scene.add(mesh);
scene.add(new THREE.AxesHelper(2));
/**
 * screen sizes
 */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height);
camera.position.y = 1.5;
camera.position.z = 3;
// camera ko thode pata hai ki cube pe focus karna hai. wo to bas upar ho gaya jab humne position set kari.
// par looAt function ki wajah use pata hai ki ab cube ko dekhna hai, wo camera ab upar jaake neeche(cube) ki or dekh raha hai
// pehle camera upar jaake apne saamne hi dekh raha tha.
camera.lookAt(mesh.position);
scene.add(camera);

/**
 * renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);