import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let grid = [];
let cols = 10; // Reduced from 20
let rows = 10; // Reduced from 20
let layers = 10; // Reduced from 20
let cellSize = 0.5; // Increased from 1
let start, end;
let openSet = [];
let closedSet = [];
let path = [];
let current;
let finished = false;

// Apple-inspired color scheme
const colors = {
  bg: 0x0080fa,
  cell: 0xffffff,
  wall: 0xdcdce1,
  openSet: 0x007aff,
  closedSet: 0x5856d6,
  path: 0xff9500,
  start: 0x34c759,
  end: 0xff3b30
};

// Reusable geometries
const cellGeometry = new THREE.BoxGeometry(cellSize * 0.9, cellSize * 0.9, cellSize * 0.9);
const wallGeometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize);

// Reusable materials
const cellMaterial = new THREE.MeshLambertMaterial({ color: colors.cell });
const wallMaterial = new THREE.MeshLambertMaterial({ color: colors.wall });
const openSetMaterial = new THREE.MeshLambertMaterial({ color: colors.openSet });
const closedSetMaterial = new THREE.MeshLambertMaterial({ color: colors.closedSet });
const startMaterial = new THREE.MeshLambertMaterial({ color: colors.start });
const endMaterial = new THREE.MeshLambertMaterial({ color: colors.end });

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.bg);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(cols * cellSize * -1.5, rows * cellSize*2, layers * cellSize * -1.5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 20, 15);
  scene.add(directionalLight);

  initializeGrid();
  createMeshes();
  animate();
}

function initializeGrid() {
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = [];
      for (let k = 0; k < layers; k++) {
        grid[i][j][k] = new Cell(i, j, k);
        if (Math.random() < 0.3) {
          grid[i][j][k].wall = true;
        }
      }
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      for (let k = 0; k < layers; k++) {
        grid[i][j][k].addNeighbors(grid);
      }
    }
  }

  start = grid[0][0][0];
  end = grid[cols-1][rows-1][layers-1];
  start.wall = false;
  end.wall = false;

  openSet.push(start);
}

function createMeshes() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      for (let k = 0; k < layers; k++) {
        const cell = grid[i][j][k];
        if (cell.wall) {
          cell.mesh = new THREE.Mesh(wallGeometry, wallMaterial);
        } else {
          cell.mesh = new THREE.Mesh(cellGeometry, cellMaterial);
        }
        cell.mesh.position.set(i * cellSize, j * cellSize, k * cellSize);
        scene.add(cell.mesh);
      }
    }
  }
  start.mesh.material = startMaterial;
  end.mesh.material = endMaterial;
}

function animate() {
  requestAnimationFrame(animate);
  updateAlgorithm();
  render();
}

function updateAlgorithm() {
  if (!finished && openSet.length > 0) {
    current = openSet.reduce((a, b) => a.f < b.f ? a : b);

    if (current === end) {
      console.log("Path found!");
      finished = true;
      return;
    }

    openSet = openSet.filter(cell => cell !== current);
    closedSet.push(current);

    for (let neighbor of current.neighbors) {
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        let tempG = current.g + 1;

        let newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
  } else if (!finished) {
    console.log("No solution");
    finished = true;
    return;
  }

  path = [];
  let temp = current;
  while (temp.previous) {
    path.push(temp);
    temp = temp.previous;
  }
}

function render() {
  openSet.forEach(cell => cell.mesh.material = openSetMaterial);
  closedSet.forEach(cell => cell.mesh.material = closedSetMaterial);
  path.forEach(cell => cell.mesh.material = new THREE.MeshLambertMaterial({ color: colors.path }));

  start.mesh.material = startMaterial;
  end.mesh.material = endMaterial;

  renderer.render(scene, camera);
}

class Cell {
  constructor(i, j, k) {
    this.i = i;
    this.j = j;
    this.k = k;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    this.wall = false;
    this.mesh = null;
  }

  addNeighbors(grid) {
    let i = this.i;
    let j = this.j;
    let k = this.k;
    
    if (i < cols - 1) this.neighbors.push(grid[i+1][j][k]);
    if (i > 0) this.neighbors.push(grid[i-1][j][k]);
    if (j < rows - 1) this.neighbors.push(grid[i][j+1][k]);
    if (j > 0) this.neighbors.push(grid[i][j-1][k]);
    if (k < layers - 1) this.neighbors.push(grid[i][j][k+1]);
    if (k > 0) this.neighbors.push(grid[i][j][k-1]);
  }
}

function heuristic(a, b) {
  return Math.abs(a.i - b.i)/2 + Math.abs(a.j - b.j) + Math.abs(a.k - b.k)/2;
}

init();

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
