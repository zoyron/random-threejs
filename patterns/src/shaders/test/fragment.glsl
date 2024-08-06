varying vec2 vUv;

void main()
{
    // float strength = vUv.y;

    // pattern 6
    // float strength = vUv.y * 10.0;

    // pattern 7
    // float strength = mod((vUv.y * 10.0), 1.0);

    // pattern 8
    // float strength = mod((vUv.y * 10.0), 1.0);
    // strength = step(0.5, strength);

    // pattern 9
    // float strength = mod((vUv.y * 10.0), 1.0);
    // strength = step(0.8, strength);

    // pattern 10
    float strength = abs(vUv.x - 0.5);
    strength += abs(vUv.y - 0.5);


    gl_FragColor = vec4(strength, strength, strength, 1.0);
}