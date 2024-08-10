uniform vec2 uResolution;

void main(){
  vec2 color = gl_FragCoord.xy / uResolution;
  gl_FragColor = vec4(0.25, 0.5 * color.y, 0.75 * color.x, 1.0);
}