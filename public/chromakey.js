AFRAME.registerShader("white-chroma-key", {
  schema: {
    src: { type: "map", is: "uniform" },
    brightnessCutoff: { type: "number", default: 0.82, is: "uniform" },
    saturationCutoff: { type: "number", default: 0.16, is: "uniform" },
    edgeSoftness: { type: "number", default: 0.08, is: "uniform" },
    cropLeft: { type: "number", default: 0.38, is: "uniform" },
    cropRight: { type: "number", default: 0.98, is: "uniform" },
    cropBottom: { type: "number", default: 0.05, is: "uniform" },
    cropTop: { type: "number", default: 0.95, is: "uniform" },
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
    uniform float brightnessCutoff;
    uniform float saturationCutoff;
    uniform float edgeSoftness;
    uniform float cropLeft;
    uniform float cropRight;
    uniform float cropBottom;
    uniform float cropTop;
    varying vec2 vUv;

    void main() {
      if (vUv.x < cropLeft || vUv.x > cropRight || vUv.y < cropBottom || vUv.y > cropTop) {
        discard;
      }

      vec4 videoColor = texture2D(src, vUv);
      float maxChannel = max(max(videoColor.r, videoColor.g), videoColor.b);
      float minChannel = min(min(videoColor.r, videoColor.g), videoColor.b);
      float saturation = maxChannel - minChannel;
      float brightness = dot(videoColor.rgb, vec3(0.299, 0.587, 0.114));

      float brightMask = smoothstep(brightnessCutoff, brightnessCutoff + edgeSoftness, brightness);
      float lowSaturationMask = 1.0 - smoothstep(saturationCutoff, saturationCutoff + edgeSoftness, saturation);
      float backgroundMask = brightMask * lowSaturationMask;
      float alpha = 1.0 - backgroundMask;

      if (alpha < 0.05) {
        discard;
      }

      gl_FragColor = vec4(videoColor.rgb, alpha);
    }
  `,
});
