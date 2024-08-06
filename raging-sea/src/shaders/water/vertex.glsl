uniform float uElevation;
uniform vec2 uFrequency;
uniform float uTime;

varying float vElevation;

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // elevation
  float elevation = sin(modelPosition.x * uFrequency.x + uTime * 1.125) * 
                    sin(modelPosition.z * uFrequency.y + uTime * 1.25) * 
                    uElevation;

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  vElevation = elevation;
}