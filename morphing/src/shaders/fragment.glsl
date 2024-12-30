void main()
{
    vec2 uv = gl_PointCoord;

    // distance from center for each pixel
    float distanceToCenter = length(uv - 0.5);

    // the formula used here is "smallNumber / distanceToCenter - doubleOfSmallNumber"
    float alpha = 0.05/distanceToCenter - 0.1;

    // setting the color of fragments based on their distance from center
    // the darker the color, the nearer to the center, black means right at the center
    gl_FragColor = vec4(vec3(1.0), alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
