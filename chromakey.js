AFRAME.registerShader("white-chroma-key", {
  schema: {
    src: { type: "map", is: "uniform" },
    keyColor: { type: "color", default: "#fff8f2", is: "uniform" },
    similarity: { type: "number", default: 0.22, is: "uniform" },
    smoothness: { type: "number", default: 0.09, is: "uniform" },
    spill: { type: "number", default: 0.06, is: "uniform" },
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    precision mediump float;

    uniform sampler2D src;
    uniform vec3 keyColor;
    uniform float similarity;
    uniform float smoothness;
    uniform float spill;
    varying vec2 vUv;

    void main() {
      vec4 videoColor = texture2D(src, vUv);
      float diff = distance(videoColor.rgb, keyColor);
      float alpha = smoothstep(similarity, similarity + smoothness, diff);

      float whiteness = min(min(videoColor.r, videoColor.g), videoColor.b);
      alpha *= smoothstep(0.78, 0.98, 1.0 - whiteness + spill);

      if (alpha < 0.03) {
        discard;
      }

      gl_FragColor = vec4(videoColor.rgb, alpha);
    }
  `,
});
