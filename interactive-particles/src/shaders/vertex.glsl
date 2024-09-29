uniform float uSize;
uniform float uTime;
uniform vec2 uMouseUV;

varying float vVisible;
varying vec2 vUv;
varying float vDist;

void main(){
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // took this from github.
  // I dont understand how it works, but it hides the continents once they are at the backside
  vec3 vNormal = normalMatrix * normal;
  vVisible = step(0.0, dot( -normalize(mvPosition.xyz), normalize(vNormal)));
  // the part I took from github ends here

  float dist = distance(uMouseUV, vUv);
  vDist = dist;
  float zDisp = 0.0;
  if(dist < 0.05){
    zDisp = (0.05 - dist) * 10.0;
  }
  mvPosition.z += zDisp;
  gl_PointSize = uSize;
  gl_Position = projectionMatrix * mvPosition;
}