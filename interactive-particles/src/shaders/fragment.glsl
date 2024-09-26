uniform sampler2D uColorMap;

varying  vec2 vUv;
varying float vVisible;


void main(){
  // took from github
  if (floor(vVisible + 0.1) == 0.0) discard;
  // took from github ends here

  vec3 color = texture2D(uColorMap, vUv).rgb;
  gl_FragColor = vec4(color, 1.0);
}