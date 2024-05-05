precision highp float;

#define PI 3.14159265359

uniform float uTime;
uniform vec3 light;
uniform vec3 medium;
uniform vec3 dark;
uniform vec2 uResolution;

varying vec2 vUv;

// 2D Random
float random(in vec2 st) {
    return fract(
        sin(
            dot(
                st.xy,
                vec2(12.9898, 78.233)
            )
        ) * 43758.5453123
    );
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f * f * (3.0 - 2.0 * f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
        (c - a) * u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

mat2 rotate2d(float _angle) {
    return mat2(
        cos(_angle),
        -sin(_angle),
        sin(_angle),
        cos(_angle)
    );
}

const float PHI = 1.61803398874989484820459; // Φ = Golden Ratio

float gold_noise(in vec2 xy, in float seed) {
    return fract(tan(distance(xy * PHI, xy) * seed) * xy.x);
}

void main() {
    gl_FragColor.a = 1.0;
    vec3 color = vec3(0.0);

    // make the uv -1 to 1
    vec2 uv = vUv * 2. - 1.;
    // y aligned uv
    vec2 yuv = uv * uResolution / uResolution.y;

    // draw circle
    vec2 circlePos = vec2(.8, 1.);
    float circleSize = .25;
    circleSize += sin(uTime * 2.) * .01;
    float inCircle = 1.0 - smoothstep(circleSize, circleSize + .25, distance(yuv, circlePos));

    color = mix(dark, light, inCircle);

    // draw water line
    float lineY = sin(uv.x * 5. + uTime) * .05;

    lineY *= uv.x * 2. + sin(uTime * .5) * 0.06;
    lineY -= .7;

    // float belowLine = smoothstep(0.005, 0.007, uv.y - lineY);
    float belowLine = smoothstep(0.005, 0.2, uv.y - lineY);

    color = mix(medium, color, belowLine);

    float strength = 16.0;

    vec2 grainResolution = uv * uResolution;
    gl_FragColor.rgb = color * (1.0 - gold_noise(grainResolution, .6) * .1);
}
