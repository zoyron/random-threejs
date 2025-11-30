import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeJSFluid = ({ className = "" }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const materialRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Shader material
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      varying vec2 vUv;

      float cosRange(float amt, float range, float minimum) {
        return (((1.0 + cos(radians(amt))) * 0.5) * range) + minimum;
      }

      void main() {
        const int zoom = 40;
        const float brightness = 0.85; // Good brightness for vibrant colors
        float time = iTime * 1.25;
        vec2 uv = vUv;
        vec2 fragCoord = vUv * iResolution;
        vec2 p = (2.0 * fragCoord - iResolution.xy) / max(iResolution.x, iResolution.y);

        float ct = cosRange(time * 5.0, 3.0, 1.1);
        float xBoost = cosRange(time * 0.2, 5.0, 5.0);
        float yBoost = cosRange(time * 0.1, 10.0, 5.0);
        float fScale = cosRange(time * 15.5, 1.25, 0.5);

        for(int i = 1; i < zoom; i++) {
          float _i = float(i);
          vec2 newp = p;
          newp.x += 0.25 / _i * sin(_i * p.y + time * cos(ct) * 0.5 / 20.0 + 0.005 * _i) * fScale + xBoost;
          newp.y += 0.25 / _i * sin(_i * p.x + time * ct * 0.3 / 40.0 + 0.03 * float(i + 15)) * fScale + yBoost;
          p = newp;
        }

        // Vibrant purple, blue, and magenta color scheme
        vec3 col = vec3(
          0.5 + 0.4 * sin(3.0 * p.x + 0.5),      // Red channel - creates purples and magentas
          0.3 + 0.3 * sin(3.0 * p.y + 1.0),      // Green channel - balanced for richness
          0.6 + 0.4 * sin(p.x + p.y + 2.0)       // Blue channel - strong blues and purples
        );

        col *= brightness;

        // Add subtle vignette for depth
        float vigAmt = 2.0;
        float vignette = (1. - vigAmt * (uv.y - .5) * (uv.y - .5)) * (1. - vigAmt * (uv.x - .5) * (uv.x - .5));
        col *= vignette;

        // Enhance color vibrancy
        col = pow(col, vec3(0.85));

        // Add slight color shift for more interest
        col.r *= 1.1;
        col.b *= 1.15;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    // Geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      renderer.setSize(width, height);
      material.uniforms.iResolution.value.set(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      if (materialRef.current) {
        materialRef.current.uniforms.iTime.value = performance.now() * 0.001;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className} />;
};

export default ThreeJSFluid;
