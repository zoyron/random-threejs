uniform float uElevation;

void main(){
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // elevation
  float elevation = sin(modelPosition.x * 10.0) * uElevation;

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}