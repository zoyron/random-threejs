uniform sampler2D uColorMap;
uniform sampler2D uSunColorMap;

varying  vec2 vUv;
varying float vVisible;
varying float vDist;


void main(){
  // took from github
  if (floor(vVisible + 0.1) == 0.0) discard;
  // took from github ends here

  vec3 color = texture2D(uSunColorMap, vUv).rgb;
  if(vDist < 0.05){
    color = mix(texture2D(uColorMap, vUv).rgb,texture2D(uSunColorMap, vUv).rgb, (0.05 - vDist) );
  }
  gl_FragColor = vec4(color, 1.0);
}