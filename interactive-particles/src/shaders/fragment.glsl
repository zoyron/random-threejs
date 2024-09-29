uniform sampler2D uColorMap;
uniform sampler2D uLightMap;

varying  vec2 vUv;
varying float vVisible;
varying float vDist;


void main(){
  // took from github
  if (floor(vVisible + 0.1) == 0.0) discard;
  // took from github ends here

  vec3 color = texture2D(uColorMap, vUv).rgb;
  if(vDist < 0.05){
    color = mix(texture2D(uLightMap, vUv).rgb,texture2D(uColorMap, vUv).rgb, (0.05 - vDist) * 2.0);
  }
  gl_FragColor = vec4(color, 1.0);
}