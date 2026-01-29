import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  particles: {
    count: 5000,
    size: 0.015,
    baseIntensity: 0.5,
    maxIntensity: 2.5,
    trailLength: 5
  },
  physics: {
    attractForce: 0.15,
    repelForce: 0.25,
    returnForce: 0.03,
    damping: 0.92,
    maxVelocity: 0.3
  },
  bloom: {
    strength: 1.2,
    radius: 0.4,
    threshold: 0.2
  },
  colors: {
    primary: new THREE.Color(0x8a2be2),    // Purple
    secondary: new THREE.Color(0x00bfff),   // Cyan
    tertiary: new THREE.Color(0xff1493),    // Pink
    quaternary: new THREE.Color(0x00ff88)   // Green
  }
}

// ============================================
// SHAPE FORMATIONS
// ============================================
const SHAPES = {
  COSMOS: 'COSMOS',
  DNA: 'DNA',
  TORUS: 'TORUS',
  GALAXY: 'GALAXY',
  HEART: 'HEART',
  CUBE: 'CUBE'
}

const shapeNames = Object.values(SHAPES)
let currentShapeIndex = 0

// ============================================
// GLOBAL STATE
// ============================================
let scene, camera, renderer, composer, bloomPass
let particles = []
let handData = { left: null, right: null }
let currentGesture = { left: 'none', right: 'none' }
let gestureStartTime = 0
let isTransitioning = false

// ============================================
// THREE.JS SETUP
// ============================================
function initThree() {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000008)

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 6

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('webgl'),
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  // Post-processing
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    CONFIG.bloom.strength,
    CONFIG.bloom.radius,
    CONFIG.bloom.threshold
  )
  composer.addPass(bloomPass)

  // Chromatic aberration shader
  const chromaticShader = {
    uniforms: {
      tDiffuse: { value: null },
      amount: { value: 0.003 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float amount;
      varying vec2 vUv;
      void main() {
        vec2 center = vec2(0.5);
        vec2 dir = vUv - center;
        float dist = length(dir);

        float r = texture2D(tDiffuse, vUv + dir * amount * dist).r;
        float g = texture2D(tDiffuse, vUv).g;
        float b = texture2D(tDiffuse, vUv - dir * amount * dist).b;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `
  }
  composer.addPass(new ShaderPass(chromaticShader))

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x222233, 0.5)
  scene.add(ambientLight)

  const pointLight1 = new THREE.PointLight(0x8a2be2, 2, 20)
  pointLight1.position.set(5, 5, 5)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x00bfff, 2, 20)
  pointLight2.position.set(-5, -5, 5)
  scene.add(pointLight2)

  // Handle resize
  window.addEventListener('resize', onResize)
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

// ============================================
// SHAPE POSITION GENERATORS
// ============================================
function getShapePosition(shape, index, total) {
  const t = index / total

  switch (shape) {
    case SHAPES.COSMOS: {
      // Spherical distribution with more spread
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = 2.5 + Math.random() * 1.0
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      )
    }

    case SHAPES.DNA: {
      // Double helix
      const strand = index % 2
      const height = (t - 0.5) * 6
      const angle = t * Math.PI * 8 + strand * Math.PI
      const radius = 1.2
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      )
    }

    case SHAPES.TORUS: {
      // Torus knot distribution
      const p = 3, q = 2
      const u = t * Math.PI * 4
      const R = 1.5
      const r = 0.6
      const x = (R + r * Math.cos(q * u)) * Math.cos(p * u)
      const y = (R + r * Math.cos(q * u)) * Math.sin(p * u)
      const z = r * Math.sin(q * u)
      return new THREE.Vector3(x, y, z)
    }

    case SHAPES.GALAXY: {
      // Spiral galaxy
      const arm = index % 4
      const armAngle = (arm / 4) * Math.PI * 2
      const spiralT = Math.pow(t, 0.7)
      const spiralAngle = spiralT * Math.PI * 3 + armAngle
      const radius = spiralT * 3 + 0.3
      const height = (Math.random() - 0.5) * 0.3 * (1 - spiralT)
      return new THREE.Vector3(
        Math.cos(spiralAngle) * radius,
        height,
        Math.sin(spiralAngle) * radius
      )
    }

    case SHAPES.HEART: {
      // 3D heart shape
      const u = t * Math.PI * 2
      const v = Math.random() * Math.PI
      const scale = 0.12
      const x = scale * 16 * Math.pow(Math.sin(u), 3)
      const y = scale * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u))
      const z = (Math.random() - 0.5) * 0.8
      return new THREE.Vector3(x, y, z)
    }

    case SHAPES.CUBE: {
      // Hollow cube with particles on edges/faces
      const face = Math.floor(Math.random() * 6)
      const s = 1.8
      let x = (Math.random() - 0.5) * 2 * s
      let y = (Math.random() - 0.5) * 2 * s
      let z = (Math.random() - 0.5) * 2 * s

      switch (face) {
        case 0: x = s; break
        case 1: x = -s; break
        case 2: y = s; break
        case 3: y = -s; break
        case 4: z = s; break
        case 5: z = -s; break
      }
      return new THREE.Vector3(x, y, z)
    }

    default:
      return new THREE.Vector3(0, 0, 0)
  }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function createParticles() {
  const geometry = new THREE.IcosahedronGeometry(CONFIG.particles.size, 1)
  const colors = [CONFIG.colors.primary, CONFIG.colors.secondary, CONFIG.colors.tertiary, CONFIG.colors.quaternary]

  for (let i = 0; i < CONFIG.particles.count; i++) {
    const colorIndex = i % colors.length
    const baseColor = colors[colorIndex].clone()

    // Vary the color slightly
    baseColor.offsetHSL(Math.random() * 0.1 - 0.05, 0, Math.random() * 0.2 - 0.1)

    const material = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: CONFIG.particles.baseIntensity,
      metalness: 0.8,
      roughness: 0.2,
      toneMapped: false
    })

    const mesh = new THREE.Mesh(geometry, material)
    const position = getShapePosition(SHAPES.COSMOS, i, CONFIG.particles.count)
    mesh.position.copy(position)

    scene.add(mesh)

    particles.push({
      mesh,
      position: position.clone(),
      targetPosition: position.clone(),
      originalPosition: position.clone(),
      velocity: new THREE.Vector3(),
      baseColor: baseColor.clone(),
      intensity: CONFIG.particles.baseIntensity,
      scale: 1,
      colorIndex
    })
  }
}

function morphToShape(shapeName) {
  if (isTransitioning) return

  isTransitioning = true
  const duration = 2000
  const startTime = Date.now()

  particles.forEach((particle, i) => {
    particle.targetPosition = getShapePosition(shapeName, i, CONFIG.particles.count)
  })

  function animateMorph() {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)

    particles.forEach(particle => {
      particle.originalPosition.lerpVectors(
        particle.originalPosition,
        particle.targetPosition,
        eased * 0.1
      )
    })

    if (progress < 1) {
      requestAnimationFrame(animateMorph)
    } else {
      particles.forEach(particle => {
        particle.originalPosition.copy(particle.targetPosition)
      })
      isTransitioning = false
    }
  }

  animateMorph()
  document.getElementById('shape-text').textContent = shapeName
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ============================================
// MEDIAPIPE HAND TRACKING
// ============================================
async function initHandTracking() {
  const video = document.getElementById('video')
  const handCanvas = document.getElementById('hand-canvas')
  const ctx = handCanvas.getContext('2d')

  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  })

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
  })

  hands.onResults((results) => {
    // Draw hand landmarks on debug canvas
    ctx.save()
    ctx.clearRect(0, 0, handCanvas.width, handCanvas.height)

    if (results.image) {
      ctx.drawImage(results.image, 0, 0, handCanvas.width, handCanvas.height)
    }

    // Reset hand data
    handData.left = null
    handData.right = null

    if (results.multiHandLandmarks && results.multiHandedness) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index].label

        // Draw landmarks
        drawLandmarks(ctx, landmarks, handCanvas.width, handCanvas.height)

        // Process hand data
        const processedHand = processHandLandmarks(landmarks)

        // Note: MediaPipe mirrors the handedness
        if (handedness === 'Left') {
          handData.right = processedHand
        } else {
          handData.left = processedHand
        }
      })
    }

    ctx.restore()

    // Detect gestures
    detectGestures()

    // Update gesture display
    updateGestureDisplay()
  })

  // Setup camera
  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video })
    },
    width: 640,
    height: 480
  })

  try {
    await cam.start()
    handCanvas.width = 240
    handCanvas.height = 180
    console.log('Hand tracking initialized')
  } catch (err) {
    console.log('Camera unavailable, using mouse:', err.message)
    handCanvas.style.display = 'none'
  }
}

function drawLandmarks(ctx, landmarks, width, height) {
  ctx.fillStyle = '#8a2be2'
  ctx.strokeStyle = '#00bfff'
  ctx.lineWidth = 2

  // Draw connections
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12],
    [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
    [5, 9], [9, 13], [13, 17]
  ]

  connections.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(landmarks[a].x * width, landmarks[a].y * height)
    ctx.lineTo(landmarks[b].x * width, landmarks[b].y * height)
    ctx.stroke()
  })

  // Draw points
  landmarks.forEach(point => {
    ctx.beginPath()
    ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2)
    ctx.fill()
  })
}

function processHandLandmarks(landmarks) {
  // Get key points
  const wrist = landmarks[0]
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const pinkyTip = landmarks[20]
  const palm = landmarks[9]

  // Convert to 3D space (mirrored to match user movement)
  const position = new THREE.Vector3(
    -(wrist.x - 0.5) * 8,
    -(wrist.y - 0.5) * 6,
    (wrist.z || 0) * -5
  )

  // Calculate pinch distance (thumb to index)
  const pinchDistance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) +
    Math.pow(thumbTip.y - indexTip.y, 2)
  )

  // Calculate finger extensions
  const fingerExtensions = {
    thumb: getFingerExtension(landmarks, [1, 2, 3, 4]),
    index: getFingerExtension(landmarks, [5, 6, 7, 8]),
    middle: getFingerExtension(landmarks, [9, 10, 11, 12]),
    ring: getFingerExtension(landmarks, [13, 14, 15, 16]),
    pinky: getFingerExtension(landmarks, [17, 18, 19, 20])
  }

  return {
    position,
    pinchDistance,
    fingerExtensions,
    landmarks
  }
}

function getFingerExtension(landmarks, indices) {
  // Calculate how extended a finger is (0 = closed, 1 = fully extended)
  const base = landmarks[indices[0]]
  const tip = landmarks[indices[3]]
  const middle = landmarks[indices[2]]

  const fullLength = Math.sqrt(
    Math.pow(tip.x - base.x, 2) +
    Math.pow(tip.y - base.y, 2)
  )

  return Math.min(fullLength * 4, 1)
}

function detectGestures() {
  ['left', 'right'].forEach(side => {
    const hand = handData[side]
    if (!hand) {
      currentGesture[side] = 'none'
      return
    }

    const ext = hand.fingerExtensions
    const pinch = hand.pinchDistance

    // Pinch: thumb and index close together
    if (pinch < 0.08) {
      currentGesture[side] = 'pinch'
    }
    // Fist: all fingers closed
    else if (ext.index < 0.4 && ext.middle < 0.4 && ext.ring < 0.4 && ext.pinky < 0.4) {
      currentGesture[side] = 'fist'
    }
    // Victory: index and middle extended, others closed
    else if (ext.index > 0.6 && ext.middle > 0.6 && ext.ring < 0.4 && ext.pinky < 0.4) {
      currentGesture[side] = 'victory'
    }
    // Open palm: all fingers extended
    else if (ext.index > 0.5 && ext.middle > 0.5 && ext.ring > 0.5 && ext.pinky > 0.5) {
      currentGesture[side] = 'open'
    }
    // Default
    else {
      currentGesture[side] = 'neutral'
    }
  })

  // Handle victory gesture for shape change
  if (currentGesture.left === 'victory' || currentGesture.right === 'victory') {
    if (Date.now() - gestureStartTime > 1000) {
      gestureStartTime = Date.now()
      nextShape()
    }
  }
}

function nextShape() {
  currentShapeIndex = (currentShapeIndex + 1) % shapeNames.length
  morphToShape(shapeNames[currentShapeIndex])
}

function updateGestureDisplay() {
  const gestureText = document.getElementById('gesture-text')

  // Only show meaningful gestures, keep it minimal
  const activeGestures = []
  if (currentGesture.left === 'pinch' || currentGesture.left === 'fist') activeGestures.push(currentGesture.left)
  if (currentGesture.right === 'pinch' || currentGesture.right === 'fist') activeGestures.push(currentGesture.right)

  gestureText.textContent = activeGestures.length > 0 ? activeGestures[0].toUpperCase() : ''
}

// ============================================
// MOUSE FALLBACK
// ============================================
let mousePosition = new THREE.Vector3()
let isMouseDown = false

function initMouseFallback() {
  const canvas = document.getElementById('webgl')

  canvas.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth - 0.5) * 8
    mousePosition.y = -(e.clientY / window.innerHeight - 0.5) * 6
    mousePosition.z = 0

    // Simulate hand data for mouse
    if (!handData.right) {
      handData.right = {
        position: mousePosition.clone(),
        pinchDistance: isMouseDown ? 0.05 : 0.2,
        fingerExtensions: {
          thumb: 1, index: 1, middle: 1, ring: 1, pinky: 1
        }
      }
      currentGesture.right = isMouseDown ? 'pinch' : 'open'
    }
  })

  canvas.addEventListener('mousedown', () => {
    isMouseDown = true
  })

  canvas.addEventListener('mouseup', () => {
    isMouseDown = false
  })

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      nextShape()
    }
  })
}

// ============================================
// PHYSICS & ANIMATION
// ============================================
function updateParticles() {
  const time = Date.now() * 0.001

  particles.forEach((particle, i) => {
    const { mesh, velocity, originalPosition, baseColor } = particle

    // Calculate forces from hands
    let totalForce = new THREE.Vector3()
    let maxIntensity = CONFIG.particles.baseIntensity

    ;['left', 'right'].forEach(side => {
      const hand = handData[side]
      if (!hand) return

      const gesture = currentGesture[side]
      const handPos = hand.position
      const toHand = new THREE.Vector3().subVectors(handPos, mesh.position)
      const distance = toHand.length()

      if (distance < 4) {
        const strength = 1 - distance / 4

        switch (gesture) {
          case 'pinch':
            // Attract particles
            totalForce.add(toHand.normalize().multiplyScalar(CONFIG.physics.attractForce * strength))
            maxIntensity = Math.max(maxIntensity, CONFIG.particles.maxIntensity * strength)
            break

          case 'open':
            // Repel particles
            totalForce.add(toHand.normalize().multiplyScalar(-CONFIG.physics.repelForce * strength))
            maxIntensity = Math.max(maxIntensity, CONFIG.particles.maxIntensity * strength * 0.7)
            break

          case 'fist':
            // Pull toward center
            const toCenter = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), mesh.position)
            totalForce.add(toCenter.normalize().multiplyScalar(CONFIG.physics.attractForce * 0.5 * strength))
            maxIntensity = Math.max(maxIntensity, CONFIG.particles.maxIntensity * strength * 0.5)
            break

          case 'neutral':
          default:
            // Gentle attraction toward hand
            totalForce.add(toHand.normalize().multiplyScalar(CONFIG.physics.attractForce * 0.2 * strength))
            maxIntensity = Math.max(maxIntensity, CONFIG.particles.baseIntensity + strength)
            break
        }
      }
    })

    // Return force to original position
    const toOrigin = new THREE.Vector3().subVectors(originalPosition, mesh.position)
    const originDistance = toOrigin.length()
    totalForce.add(toOrigin.normalize().multiplyScalar(CONFIG.physics.returnForce * originDistance))

    // Apply forces
    velocity.add(totalForce)
    velocity.multiplyScalar(CONFIG.physics.damping)

    // Clamp velocity
    if (velocity.length() > CONFIG.physics.maxVelocity) {
      velocity.normalize().multiplyScalar(CONFIG.physics.maxVelocity)
    }

    // Update position
    mesh.position.add(velocity)
    particle.position.copy(mesh.position)

    // Update intensity with smooth transition
    particle.intensity += (maxIntensity - particle.intensity) * 0.1
    mesh.material.emissiveIntensity = particle.intensity

    // Subtle rotation based on velocity
    mesh.rotation.x += velocity.y * 0.5
    mesh.rotation.y += velocity.x * 0.5

    // Color pulsing
    const pulse = Math.sin(time * 2 + i * 0.1) * 0.1 + 1
    mesh.scale.setScalar(pulse * (1 + velocity.length() * 2))
  })

  // Subtle global rotation when no hands detected
  if (!handData.left && !handData.right) {
    scene.rotation.y += 0.002
    scene.rotation.x = Math.sin(time * 0.5) * 0.1
  } else {
    // Slowly return to neutral rotation
    scene.rotation.y *= 0.99
    scene.rotation.x *= 0.99
  }
}

// ============================================
// UI SETUP
// ============================================
function initUI() {
  const handCanvas = document.getElementById('hand-canvas')

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      nextShape()
    }
    if (e.key === 'c' || e.key === 'C') {
      handCanvas.classList.toggle('hidden')
    }
  })
}

// ============================================
// MAIN LOOP
// ============================================
function animate() {
  requestAnimationFrame(animate)
  updateParticles()
  composer.render()
}

// ============================================
// INITIALIZATION
// ============================================
function init() {
  try {
    console.log('Starting init...')
    initThree()
    console.log('Three.js initialized')
    createParticles()
    console.log('Particles created')
    initUI()
    initMouseFallback()

    // Hide loading and start animation immediately
    document.getElementById('loading').classList.add('hidden')
    console.log('Starting animation')
    animate()

    // Initialize hand tracking in background (non-blocking)
    initHandTracking().catch(err => {
      console.log('Hand tracking unavailable:', err)
    })
  } catch (err) {
    console.error('Init error:', err)
    document.getElementById('loading').innerHTML = `<p style="color:red">Error: ${err.message}</p>`
  }
}

init()
