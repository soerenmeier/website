// https://www.shadertoy.com/view/Ml2XDt
// SmallStars - @P_Malin
// My attempt to play at starfield code golf.
// Along the lines of https://www.shadertoy.com/view/MdlXWr

// Fully initialize f by using iDate.wwww - 138 characters

precision highp float;

uniform float uTime; // Time variable for animation
uniform vec2 uResolution; // Resolution of the screen/texture
// range 0.0 to 0.05
uniform vec2 uDirection; // Direction vector for star movement
uniform float intensity;

varying vec2 vUv; // UV coordinates passed from vertex shader

void mainImage(out vec4 fragColor, vec2 fragCoord)
{
    // Normalize coordinates from [0, 1] to [-1, 1]
    vec2 normalizedPos = vUv * 2.0 - 1.0;

    // range 0.0 to 0.05
    // vec2 uDirection = vec2(0., 0.); // Direction vector for star movement
    // Apply time-based movement in the specified direction
    normalizedPos += uDirection * uTime * 0.1;

    normalizedPos *= 0.3; // Zoom out to see more stars

    // Calculate angle for star pattern and create a repeating pattern
    float angle = ceil(atan(normalizedPos.x, normalizedPos.y) * 600.0);

    // Calculate brightness modulation based on the angle
    float brightnessMod = cos(angle);

    // Calculate the inverse distance from the center, affecting star size and brightness
    float inverseDist = brightnessMod / dot(normalizedPos, normalizedPos);

    // inverseDist += -0.5;

    // Generate the final color with an exponential function for the star effect
    float color = exp(fract(inverseDist + brightnessMod * angle + uTime * 0.3) * -100.0) / inverseDist;
    color = clamp(color, 0.0, 1.0);
    fragColor = vec4(vec3(color * intensity), 1.0);
    // fragColor = exp(fract(inverseDist + brightnessMod * angle + vec4(uTime * 0.3)) * -100.0) / inverseDist;
}

void main() {
    // Call the mainImage function to compute the fragment color
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
