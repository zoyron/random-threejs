uniform sampler2D uColorMap;

varying vec2 vUv;

void main(){
  vec3 color = texture2D(uColorMap, vUv).rgb;
  gl_FragColor = vec4(color, 1.0);
}