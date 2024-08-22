import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { data } from "./Data";

const PATHS = data.economics[0].paths;
console.log(PATHS);

function CreateTube() {
  let points = [];
  for (let i = 0; i < 10; i++) {
    points.push(new THREE.Vector3((i - 5) * 2, Math.sin(i * 2) * 10 + 5, 0));
  }
  let curve = new THREE.CatmullRomCurve3(points);
  return (
    <>
      <mesh>
        <tubeGeometry args={[curve, 64, 0.1, 8, false]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <CreateTube />
      </Canvas>
    </>
  );
}
