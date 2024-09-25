uniform sampler2D uColorMap;
uniform sampler2D uAlphaMap;

varying  vec2 vUv;
varying float vVisible;


void main(){
  // took from github
  if (floor(vVisible + 0.1) == 0.0) discard;
  // took from github ends here
  float alpha = texture2D(uAlphaMap, vUv).r;

  vec3 color = texture2D(uColorMap, vUv).rgb;
  gl_FragColor = vec4(color, alpha - 0.5);
}