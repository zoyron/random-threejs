import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const vertexShader = `
    uniform float uTextureWidth;
    uniform float uTextureHeight;

    varying vec2 vUv;
    varying vec2 vTextureCoord;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        vec2 textureCoord = vec4(position, 1.0).xy / vec2(uTextureWidth, uTextureHeight);
 
        vUv = uv;
        vTextureCoord = textureCoord;
    }
`;

const fragmentShader = `
    uniform float uFade;
    uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying vec2 vTextureCoord;

    void main() {
        vec4 textureSample = texture2D(uTexture, vTextureCoord);
        vec3 color = textureSample.rgb;

        float wave = sin(uTime * 0.15) * 0.5 + 0.5;
        float highlightLowerBound = wave - 0.025;
        float highlightUpperBound = wave + 0.025;
        wave = smoothstep(highlightLowerBound, wave, vUv.x) + 1.0 - smoothstep(wave, highlightUpperBound, vUv.x);
        wave = (wave - 1.0) * 0.1;

        color = mix(color, vec3(1.0), wave);

        float alpha = textureSample.a * step(vUv.x, uFade);

        gl_FragColor = vec4(color, alpha);
    }
`;

class ImageTraceLines {
    constructor(imageUrl, options = {}) {
        this.imageUrl = imageUrl;
        this.options = {
            numberLines: 400,
            maxDistance: 11,
            sampleSize: 2500,
            brightnessThreshold: 6,
            ...options
        };

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.camera.position.z = 10;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 0.5, 0);

        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        const loader = new THREE.TextureLoader();
        loader.load(this.imageUrl, (texture) => {
            this.createLines(texture);
            this.animate();
        });
    }

    createLines(texture) {
        const { width, height } = texture.image;
        const positions = this.getPositionsFromTexture(texture);
        const lines = this.generateLines(positions);

        const group = new THREE.Group();
        group.scale.set(0.03, 0.03, 0.03);
        group.position.set(-width / 2 * 0.03, -height / 2 * 0.03, 0);

        lines.forEach(lineVertices => {
            const curve = new THREE.CatmullRomCurve3(lineVertices);
            const geometry = new THREE.TubeGeometry(curve, 50, 0.25, 6, false);
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uFade: { value: 0 },
                    uTexture: { value: texture },
                    uTextureWidth: { value: width },
                    uTextureHeight: { value: height },
                },
                transparent: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
        });

        this.scene.add(group);
    }

    getPositionsFromTexture(texture) {
        const { width, height } = texture.image;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(texture.image, 0, 0, width, height);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const positions = [];

        for (let i = 0; i < width * height; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            const brightness = (r + g + b) / 3;

            if (brightness < this.options.brightnessThreshold) continue;

            positions.push(new THREE.Vector3(i % width, Math.floor(i / width), brightness / 15));
        }

        return positions;
    }

    generateLines(positions) {
        const lines = [];
        const currentPoint = new THREE.Vector3();
        const previousPoint = new THREE.Vector3();

        for (let i = 0; i < this.options.numberLines; i++) {
            const lineVertices = [];

            currentPoint.copy(positions[Math.floor(Math.random() * positions.length)]);
            previousPoint.copy(currentPoint);

            for (let j = 0; j < this.options.sampleSize; j++) {
                currentPoint.copy(positions[Math.floor(Math.random() * positions.length)]);

                if (currentPoint.distanceTo(previousPoint) >= this.options.maxDistance) {
                    continue;
                }

                lineVertices.push(currentPoint.clone());
                previousPoint.copy(currentPoint);
            }

            if (lineVertices.length >= 3) {
                lines.push(lineVertices);
            }
        }

        return lines;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        this.scene.traverse(child => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                child.material.uniforms.uTime.value = elapsedTime;
                child.material.uniforms.uFade.value = THREE.MathUtils.lerp(
                    child.material.uniforms.uFade.value,
                    1,
                    0.02
                );
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Usage
const imageTraceLines = new ImageTraceLines('/krishna.jpg', {
    numberLines: 4000,
    maxDistance: 18,
    sampleSize: 2500,
    brightnessThreshold: 9
});
