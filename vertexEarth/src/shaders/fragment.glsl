uniform sampler2D uColorMap;
uniform sampler2D uAlphaMap;

varying float vVisible;
varying vec2 vUv;

void main(){

  // took from github
  if (floor(vVisible + 0.1) == 0.0) discard;
  // took from github ends here

  vec3 color = texture2D(uColorMap, vUv).rgb;
  float alpha = 1.0 - texture2D(uAlphaMap, vUv).r;
  
  // putting 1.0 in alpha would give complete earth
  // putting the "alpha" variable there would give just land
  // to get just water from the "alpha" variable, remove "1.0 -"
  gl_FragColor = vec4(color, 1.0);
}
