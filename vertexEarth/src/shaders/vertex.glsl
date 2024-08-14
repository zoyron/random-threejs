uniform float uSize;
uniform sampler2D uElevationMap;

varying float vVisible;
varying vec2 vUv;

void main(){
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  float elevation = texture2D(uElevationMap,uv).r;


  mvPosition.z += elevation * 0.6 ;

  // took this from github.
  // I dont understand how it works, but it hides the continents once they are at the backside
  vec3 vNormal = normalMatrix * normal;
  vVisible = step(0.0, dot( -normalize(mvPosition.xyz), normalize(vNormal)));
  // the part I took from github ends here

  vec4 projectedPosition = projectionMatrix * mvPosition;

  gl_PointSize = uSize;
  gl_Position = projectedPosition;
  vUv = uv;
}