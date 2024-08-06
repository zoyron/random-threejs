uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

varying float vElevation;

void main(){
  vec3 color = mix(uDepthColor, uSurfaceColor, vElevation);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}