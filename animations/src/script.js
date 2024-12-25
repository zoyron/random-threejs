import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GUI } from 'lil-gui';

class ParticleCloud {
  constructor() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    document.body.appendChild(this.renderer.domElement);

    // Parameters for GUI
    this.params = {
      color1: '#88ccff',
      color2: '#7dabf1',
      color3: '#6a8dff',
      updateColors: () => this.updateParticleColors()
    };

    // Camera position and controls
    this.camera.position.z = 5;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Post-processing setup
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.1
    );
    this.composer.addPass(bloomPass);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x88ccff, 1);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    // Group for all particles
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Mouse tracking with raycaster
    this.mouse = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.mousePos = new THREE.Vector2();
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Initialize GUI
    this.initGUI();

    // Initialize particles
    this.particles = this.createParticles();
    
    // Interactive parameters
    this.interactionRadius = 1.5;
    this.maxGlowIntensity = 5;
    this.baseGlowIntensity = 0.5;
    this.dispersalForce = 0.08;
    this.returnForce = 0.02;
    this.dampingFactor = 0.95;
    this.rotationSpeed = 0.0025;

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Start animation loop
    this.animate();
  }

  initGUI() {
    const gui = new GUI();
    const colorFolder = gui.addFolder('Particle Colors');
    
    colorFolder.addColor(this.params, 'color1').name('Color 1').onChange(() => this.updateParticleColors());
    colorFolder.addColor(this.params, 'color2').name('Color 2').onChange(() => this.updateParticleColors());
    colorFolder.addColor(this.params, 'color3').name('Color 3').onChange(() => this.updateParticleColors());
    
    colorFolder.open();
  }

  updateParticleColors() {
    const colors = [
      new THREE.Color(this.params.color1),
      new THREE.Color(this.params.color2),
      new THREE.Color(this.params.color3)
    ];

    this.particles.forEach((particle, index) => {
      const colorIndex = index % 3;
      particle.baseColor = colors[colorIndex];
      particle.mesh.material.color = colors[colorIndex];
      particle.mesh.material.emissive = colors[colorIndex].clone().multiplyScalar(this.baseGlowIntensity);
    });
  }

  createParticles() {
    const particles = [];
    const count = 5000;
    const radius = 2;
    
    const geometry = new THREE.SphereGeometry(0.015, 12, 12);
    
    // Base colors for particles
    const colors = [
      new THREE.Color(this.params.color1),
      new THREE.Color(this.params.color2),
      new THREE.Color(this.params.color3)
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const position = new THREE.Vector3(x, y, z);
      
      // Create material with emissive color
      const baseColor = colors[i % colors.length];
      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveMap: null,
        metalness: 0.5,
        roughness: 0.2,
        toneMapped: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      
      this.group.add(mesh);
      
      particles.push({
        mesh,
        position: position.clone(),
        originalPosition: position.clone(),
        velocity: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        baseColor: baseColor.clone(),
        currentIntensity: this.baseGlowIntensity
      });
    }
    
    return particles;
  }

  updateParticles() {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mousePosition3D = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(intersectPlane, mousePosition3D);

    this.particles.forEach(particle => {
      const distanceToMouse = mousePosition3D.distanceTo(particle.position);
      const isInRange = distanceToMouse < this.interactionRadius;
      
      const force = isInRange 
        ? this.dispersalForce * (1 - distanceToMouse / this.interactionRadius)
        : 0;

      if (isInRange) {
        const repulsionDir = particle.position.clone()
          .sub(mousePosition3D)
          .normalize();
        
        particle.velocity.add(
          repulsionDir.multiplyScalar(force * (1 + Math.random() * 0.2))
        );
        
        const intensity = THREE.MathUtils.lerp(
          this.maxGlowIntensity,
          this.baseGlowIntensity,
          distanceToMouse / this.interactionRadius
        );
        
        const glowColor = particle.baseColor.clone().multiplyScalar(intensity);
        particle.mesh.material.emissive = glowColor;
      } else {
        particle.mesh.material.emissive = particle.baseColor.clone().multiplyScalar(this.baseGlowIntensity);
      }

      const distanceToOrigin = particle.position.distanceTo(particle.originalPosition);
      const returnForce = particle.originalPosition
        .clone()
        .sub(particle.position)
        .normalize()
        .multiplyScalar(this.returnForce * distanceToOrigin);
      
      particle.velocity.add(returnForce);
      particle.velocity.multiplyScalar(this.dampingFactor);
      
      particle.position.add(particle.velocity);
      particle.mesh.position.copy(particle.position);

      if (particle.velocity.length() > 0.001) {
        particle.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          particle.velocity.clone().normalize()
        );
        particle.mesh.quaternion.slerp(particle.quaternion, 0.1);
      }
    });

    this.group.rotation.y += this.rotationSpeed;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.viewport.width = window.innerWidth;
    this.viewport.height = window.innerHeight;
  }

  onMouseMove(event) {
    this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mousePos.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.updateParticles();
    this.controls.update();
    this.composer.render();
  }
}

// Initialize the application
new ParticleCloud();
