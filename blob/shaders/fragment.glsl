uniform vec2 uResolution;

void main(){
  vec2 color = gl_FragCoord.xy / uResolution;
  gl_FragColor = vec4(0.025 + color.x - color.y, 0.25 + color.y, 0.75 + color.x + color.y, 1.0);
}