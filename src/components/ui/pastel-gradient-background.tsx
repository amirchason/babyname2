import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import UnicornScene from "unicornstudio-react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

interface PastelGradientBackgroundProps {
  className?: string;
  opacity?: number;
}

export const PastelGradientBackground: React.FC<PastelGradientBackgroundProps> = ({
  className,
  opacity = 0.6
}) => {
  const { width, height } = useWindowSize();

  // UnicornStudio gradient scene configuration
  const sceneData = {
    "history": [
      {
        "breakpoints": [],
        "visible": true,
        "aspectRatio": 1,
        "userDownsample": 1,
        "layerType": "effect",
        "type": "gradient",
        "usesPingPong": false,
        "speed": 0.25,
        "trackMouse": 0,
        "trackAxes": "xy",
        "mouseMomentum": 0,
        "texture": false,
        "animating": false,
        "isMask": 0,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float;in vec2 vTextureCoord;uniform float uTime; uniform vec2 uMousePos;vec3 getColor(int index) { switch(index) { case 0: return vec3(0.8705882352941177, 0.792156862745098, 0.8549019607843137); case 1: return vec3(0.6784313725490196, 0.29411764705882354, 0.7450980392156863); case 2: return vec3(0.8627450980392157, 0.44313725490196076, 0.34901960784313724); case 3: return vec3(0.24705882352941178, 0.3254901960784314, 0.9098039215686274); case 4: return vec3(0, 0, 0); case 5: return vec3(0, 0, 0); case 6: return vec3(0, 0, 0); case 7: return vec3(0, 0, 0); case 8: return vec3(0, 0, 0); case 9: return vec3(0, 0, 0); case 10: return vec3(0, 0, 0); case 11: return vec3(0, 0, 0); case 12: return vec3(0, 0, 0); case 13: return vec3(0, 0, 0); case 14: return vec3(0, 0, 0); case 15: return vec3(0, 0, 0); default: return vec3(0.0); } }float getStop(int index) { switch(index) { case 0: return 0.0000; case 1: return 0.3333; case 2: return 0.6667; case 3: return 1.0000; case 4: return 0.0000; case 5: return 0.0000; case 6: return 0.0000; case 7: return 0.0000; case 8: return 0.0000; case 9: return 0.0000; case 10: return 0.0000; case 11: return 0.0000; case 12: return 0.0000; case 13: return 0.0000; case 14: return 0.0000; case 15: return 0.0000; default: return 0.0; } }const float PI = 3.14159265;vec2 rotate(vec2 coord, float angle) { float s = sin(angle); float c = cos(angle); return vec2( coord.x * c - coord.y * s, coord.x * s + coord.y * c ); }float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453); }vec3 linear_from_srgb(vec3 rgb) { return pow(rgb, vec3(2.2)); }vec3 srgb_from_linear(vec3 lin) { return pow(lin, vec3(1.0/2.2)); }vec3 oklab_mix(vec3 lin1, vec3 lin2, float a) { const mat3 kCONEtoLMS = mat3( 0.4121656120, 0.2118591070, 0.0883097947, 0.5362752080, 0.6807189584, 0.2818474174, 0.0514575653, 0.1074065790, 0.6302613616); const mat3 kLMStoCONE = mat3( 4.0767245293, -1.2681437731, -0.0041119885, -3.3072168827, 2.6093323231, -0.7034763098, 0.2307590544, -0.3411344290, 1.7068625689); vec3 lms1 = pow( kCONEtoLMS*lin1, vec3(1.0/3.0) ); vec3 lms2 = pow( kCONEtoLMS*lin2, vec3(1.0/3.0) ); vec3 lms = mix( lms1, lms2, a ); lms *= 1.0 + 0.025 * a * (1.0-a); return kLMStoCONE * (lms * lms * lms); }vec3 getGradientColor(float position) { position = clamp(position, 0.0, 1.0); for (int i = 0; i < 4 - 1; i++) { float colorPosition = getStop(i); float nextColorPosition = getStop(i + 1); if (position <= nextColorPosition) { float mixFactor = (position - colorPosition) / (nextColorPosition - colorPosition); vec3 linStart = linear_from_srgb(getColor(i)); vec3 linEnd = linear_from_srgb(getColor(i + 1)); vec3 mixedLin = oklab_mix(linStart, linEnd, mixFactor); return srgb_from_linear(mixedLin); } } return getColor(4 - 1); }out vec4 fragColor;vec3 applyColorToPosition(float position) { vec3 color = vec3(0); position -= (uTime * 0.01 + 0.0000); float cycle = floor(position); bool reverse = 1.0000 > 0.5 && int(cycle) % 2 == 0; float animatedPos = reverse ? 1.0 - fract(position) : fract(position);color = getGradientColor(animatedPos); float dither = rand(gl_FragCoord.xy) * 0.005; color += dither; return color; }vec3 linearGrad(vec2 uv) { float position = (uv.x+0.5); return applyColorToPosition(position); }vec3 getGradient(vec2 uv) { return linearGrad(uv); }vec3 getColor(vec2 uv) {return getGradient(uv);return vec3(0.8705882352941177, 0.792156862745098, 0.8549019607843137); }void main() {vec2 uv = vTextureCoord; vec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000); uv -= pos; uv /= (0.5000*2.); uv = rotate(uv, (0.0783 - 0.5) * 2. * PI); vec4 color = vec4(getColor(uv), 1.); fragColor = color; }"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = aTextureCoord; }"
        ],
        "data": {
          "depth": false,
          "uniforms": {},
          "isBackground": true
        },
        "id": "effect"
      },
      {
        "breakpoints": [],
        "visible": true,
        "locked": false,
        "aspectRatio": 0.9823284823284824,
        "layerName": "",
        "userDownsample": 1,
        "isElement": true,
        "opacity": 1,
        "effects": [],
        "displace": 0,
        "trackMouse": 0.7,
        "anchorPoint": "center",
        "mouseMomentum": 1,
        "blendMode": "NORMAL",
        "bgDisplace": 0,
        "mask": 0,
        "maskBackground": {
          "type": "Vec3",
          "_x": 0,
          "_y": 0,
          "_z": 0
        },
        "maskAlpha": 0,
        "maskDepth": 0,
        "dispersion": 0,
        "axisTilt": 0,
        "states": {
          "appear": [],
          "scroll": [],
          "hover": []
        },
        "layerType": "shape",
        "width": 0.6139553014553014,
        "widthMode": "auto",
        "height": 1,
        "heightMode": "relative",
        "left": 0.33246527777777785,
        "leftMode": "relative",
        "top": 0.7567567567567568,
        "topMode": "relative",
        "rotation": 0,
        "trackAxes": "xy",
        "pos": {
          "type": "Vec2",
          "_x": 0.5,
          "_y": 0.5
        },
        "borderRadius": 0,
        "gradientAngle": 0,
        "strokeWidth": 0,
        "coords": [[0, 0], [0.6139553014553014, 0], [0.6139553014553014, 1], [0, 1]],
        "fill": ["#45c1ff"],
        "fitToCanvas": false,
        "gradientType": "linear",
        "type": "circle",
        "stroke": ["#000000"],
        "numSides": 3,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float; in vec2 vTextureCoord; in vec3 vVertexPosition;uniform sampler2D uBgTexture; uniform sampler2D uTexture; uniform vec2 uMousePos; uniform int uSampleBg;out vec4 fragColor;void main() { vec2 uv = vTextureCoord; vec2 pos = mix(vec2(0), (uMousePos - 0.5), 0.7000);uv = uv - pos;vec4 color = texture(uTexture, uv); vec4 background = vec4(0);if(uSampleBg == 1) { background = texture(uBgTexture, vTextureCoord); }color = mix(background, color / max(color.a, 0.0001), color.a * 1.0000);fragColor = color; }"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision highp float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix; uniform vec2 uMousePos;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { float angleX = uMousePos.y * 0.5 - 0.25; float angleY = (1.-uMousePos.x) * 0.5 - 0.25;mat4 rotateX = mat4(1.0, 0.0, 0.0, 0.0, 0.0, cos(angleX), -sin(angleX), 0.0, 0.0, sin(angleX), cos(angleX), 0.0, 0.0, 0.0, 0.0, 1.0); mat4 rotateY = mat4(cos(angleY), 0.0, sin(angleY), 0.0, 0.0, 1.0, 0.0, 0.0, -sin(angleY), 0.0, cos(angleY), 0.0, 0.0, 0.0, 0.0, 1.0);mat4 rotationMatrix = rotateX * rotateY; gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vVertexPosition = (rotationMatrix * vec4(aVertexPosition, 1.0)).xyz; vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }"
        ],
        "data": {
          "uniforms": {}
        },
        "id": "shape"
      },
      {
        "breakpoints": [
          {
            "max": null,
            "min": 992,
            "name": "Desktop",
            "props": {
              "top": 0.3113513513513514,
              "left": 0.6652199074074074
            }
          },
          {
            "max": 575,
            "props": {
              "left": 1.403681445868946,
              "top": -0.09860125528371971
            },
            "name": "Mobile",
            "min": 0
          }
        ],
        "visible": true,
        "locked": false,
        "aspectRatio": 0.9823284823284824,
        "layerName": "Circle 2",
        "userDownsample": 1,
        "isElement": true,
        "opacity": 1,
        "effects": [],
        "displace": 0,
        "trackMouse": 0.6,
        "anchorPoint": "center",
        "mouseMomentum": 1,
        "blendMode": "NORMAL",
        "bgDisplace": 0,
        "mask": 0,
        "maskBackground": {
          "type": "Vec3",
          "_x": 0,
          "_y": 0,
          "_z": 0
        },
        "maskAlpha": 0,
        "maskDepth": 0,
        "dispersion": 0,
        "axisTilt": 0,
        "states": {
          "appear": [],
          "scroll": [],
          "hover": []
        },
        "layerType": "shape",
        "width": 0.6139553014553014,
        "widthMode": "auto",
        "height": 1,
        "heightMode": "relative",
        "left": 0.6652199074074074,
        "leftMode": "relative",
        "top": 0.3113513513513514,
        "topMode": "relative",
        "rotation": 0,
        "trackAxes": "xy",
        "pos": {
          "type": "Vec2",
          "_x": 0.5,
          "_y": 0.5
        },
        "borderRadius": 0,
        "gradientAngle": 0,
        "strokeWidth": 0,
        "coords": [[0, 0], [0.6139553014553014, 0], [0.6139553014553014, 1], [0, 1]],
        "fill": ["#c980d4"],
        "fitToCanvas": false,
        "gradientType": "linear",
        "type": "circle",
        "stroke": ["#000000"],
        "numSides": 3,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float; in vec2 vTextureCoord; in vec3 vVertexPosition;uniform sampler2D uBgTexture; uniform sampler2D uTexture; uniform vec2 uMousePos; uniform int uSampleBg;out vec4 fragColor;void main() { vec2 uv = vTextureCoord; vec2 pos = mix(vec2(0), (uMousePos - 0.5), 0.6000);uv = uv - pos;vec4 color = texture(uTexture, uv); vec4 background = vec4(0);if(uSampleBg == 1) { background = texture(uBgTexture, vTextureCoord); }color = mix(background, color / max(color.a, 0.0001), color.a * 1.0000);fragColor = color; }"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision highp float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix; uniform vec2 uMousePos;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { float angleX = uMousePos.y * 0.5 - 0.25; float angleY = (1.-uMousePos.x) * 0.5 - 0.25;mat4 rotateX = mat4(1.0, 0.0, 0.0, 0.0, 0.0, cos(angleX), -sin(angleX), 0.0, 0.0, sin(angleX), cos(angleX), 0.0, 0.0, 0.0, 0.0, 1.0); mat4 rotateY = mat4(cos(angleY), 0.0, sin(angleY), 0.0, 0.0, 1.0, 0.0, 0.0, -sin(angleY), 0.0, cos(angleY), 0.0, 0.0, 0.0, 0.0, 1.0);mat4 rotationMatrix = rotateX * rotateY; gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vVertexPosition = (rotationMatrix * vec4(aVertexPosition, 1.0)).xyz; vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }"
        ],
        "data": {
          "uniforms": {}
        },
        "id": "shape1"
      },
      {
        "breakpoints": [],
        "visible": true,
        "aspectRatio": 1,
        "userDownsample": 1,
        "layerType": "effect",
        "type": "blur",
        "usesPingPong": false,
        "trackMouse": 0,
        "trackAxes": "xy",
        "mouseMomentum": 0,
        "texture": false,
        "animating": false,
        "isMask": 0,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float; precision highp int;in vec3 vVertexPosition; in vec2 vTextureCoord;uniform sampler2D uTexture; uniform vec2 uMousePos; uniform vec2 uResolution; float ease (int easingFunc, float t) { return t; }out vec4 fragColor;const int kernelSize = 36;vec4 BoxBlur(sampler2D tex, vec2 uv, vec2 direction) { vec4 color = vec4(0.0);vec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000); float inner = distance(uv, pos); float outer = max(0., 1.-distance(uv, pos)); float amount = 3.0000 * ease(0, mix(inner, outer, 0.5000)); for (int i = 0; i < kernelSize; i++) { float x = float(i - kernelSize / 2) * amount/144.; color += texture(tex, uv + vec2(x) * direction * vec2(0.5000, 1. - 0.5000)); } return color/float(kernelSize); }vec4 blur(vec2 uv, vec2 direction) { return BoxBlur(uTexture, uv, direction); }void main() { vec2 uv = vTextureCoord; vec4 color = vec4(0); int dir = 0 % 2; vec2 direction = dir == 1 ? vec2(0, uResolution.x/uResolution.y) : vec2(1, 0);color = blur(uv, direction); fragColor = color;}",
          "#version 300 es\nprecision highp float; precision highp int;in vec3 vVertexPosition; in vec2 vTextureCoord;uniform sampler2D uTexture; uniform vec2 uMousePos; uniform vec2 uResolution; float ease (int easingFunc, float t) { return t; }out vec4 fragColor;const int kernelSize = 36;vec4 BoxBlur(sampler2D tex, vec2 uv, vec2 direction) { vec4 color = vec4(0.0);vec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000); float inner = distance(uv, pos); float outer = max(0., 1.-distance(uv, pos)); float amount = 3.0000 * ease(0, mix(inner, outer, 0.5000)); for (int i = 0; i < kernelSize; i++) { float x = float(i - kernelSize / 2) * amount/144.; color += texture(tex, uv + vec2(x) * direction * vec2(0.5000, 1. - 0.5000)); } return color/float(kernelSize); }vec4 blur(vec2 uv, vec2 direction) { return BoxBlur(uTexture, uv, direction); }void main() { vec2 uv = vTextureCoord; vec4 color = vec4(0); int dir = 1 % 2; vec2 direction = dir == 1 ? vec2(0, uResolution.x/uResolution.y) : vec2(1, 0);color = blur(uv, direction); fragColor = color;}",
          "#version 300 es\nprecision highp float; precision highp int;in vec3 vVertexPosition; in vec2 vTextureCoord;uniform sampler2D uTexture; uniform vec2 uMousePos; uniform vec2 uResolution; float ease (int easingFunc, float t) { return t; }out vec4 fragColor;const int kernelSize = 36;vec4 BoxBlur(sampler2D tex, vec2 uv, vec2 direction) { vec4 color = vec4(0.0);vec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000); float inner = distance(uv, pos); float outer = max(0., 1.-distance(uv, pos)); float amount = 3.0000 * ease(0, mix(inner, outer, 0.5000)); for (int i = 0; i < kernelSize; i++) { float x = float(i - kernelSize / 2) * amount/144.; color += texture(tex, uv + vec2(x) * direction * vec2(0.5000, 1. - 0.5000)); } return color/float(kernelSize); }vec4 blur(vec2 uv, vec2 direction) { return BoxBlur(uTexture, uv, direction); }void main() { vec2 uv = vTextureCoord; vec4 color = vec4(0); int dir = 2 % 2; vec2 direction = dir == 1 ? vec2(0, uResolution.x/uResolution.y) : vec2(1, 0);color = blur(uv, direction); fragColor = color;}",
          "#version 300 es\nprecision highp float; precision highp int;in vec3 vVertexPosition; in vec2 vTextureCoord;uniform sampler2D uTexture; uniform vec2 uMousePos; uniform vec2 uResolution; float ease (int easingFunc, float t) { return t; } uvec2 pcg2d(uvec2 v) { v = v * 1664525u + 1013904223u; v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u; v ^= v >> 16; v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u; return v; }float randFibo(vec2 p) { uvec2 v = floatBitsToUint(p); v = pcg2d(v); uint r = v.x ^ v.y; return float(r) / float(0xffffffffu); }out vec4 fragColor;const int kernelSize = 36;vec4 BoxBlur(sampler2D tex, vec2 uv, vec2 direction) { vec4 color = vec4(0.0);vec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000); float inner = distance(uv, pos); float outer = max(0., 1.-distance(uv, pos)); float amount = 3.0000 * ease(0, mix(inner, outer, 0.5000)); for (int i = 0; i < kernelSize; i++) { float x = float(i - kernelSize / 2) * amount/144.; color += texture(tex, uv + vec2(x) * direction * vec2(0.5000, 1. - 0.5000)); } return color/float(kernelSize); }vec4 blur(vec2 uv, vec2 direction) { return BoxBlur(uTexture, uv, direction); }void main() { vec2 uv = vTextureCoord; vec4 color = vec4(0); int dir = 3 % 2; vec2 direction = dir == 1 ? vec2(0, uResolution.x/uResolution.y) : vec2(1, 0);color = blur(uv, direction);float dither = (randFibo(gl_FragCoord.xy) - 0.5) / 255.0; color.rgb += dither; fragColor = color;}"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }"
        ],
        "data": {
          "downSample": 0.25,
          "depth": false,
          "uniforms": {},
          "isBackground": false,
          "passes": [
            {
              "prop": "vertical",
              "value": 1,
              "downSample": 0.25
            },
            {
              "prop": "vertical",
              "value": 2,
              "downSample": 0.5
            },
            {
              "prop": "vertical",
              "value": 3,
              "downSample": 0.5
            }
          ]
        },
        "id": "effect1"
      },
      {
        "breakpoints": [],
        "visible": true,
        "aspectRatio": 1,
        "userDownsample": 1,
        "layerType": "effect",
        "type": "flowField",
        "usesPingPong": false,
        "speed": 0.3,
        "trackMouse": 0,
        "trackAxes": "xy",
        "mouseMomentum": 0,
        "texture": false,
        "animating": true,
        "isMask": 0,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float;in vec3 vVertexPosition; in vec2 vTextureCoord;uniform sampler2D uTexture; uniform float uTime; uniform vec2 uMousePos; uniform vec2 uResolution; float ease (int easingFunc, float t) { return t; }vec3 hash33(vec3 p3) { p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787)); p3 += dot(p3, p3.yxz + 19.19); return -1.0 + 2.0 * fract(vec3( (p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x )); }float perlin_noise(vec3 p) { vec3 pi = floor(p); vec3 pf = p - pi;vec3 w = pf * pf * (3.0 - 2.0 * pf);float n000 = dot(pf - vec3(0.0, 0.0, 0.0), hash33(pi + vec3(0.0, 0.0, 0.0))); float n100 = dot(pf - vec3(1.0, 0.0, 0.0), hash33(pi + vec3(1.0, 0.0, 0.0))); float n010 = dot(pf - vec3(0.0, 1.0, 0.0), hash33(pi + vec3(0.0, 1.0, 0.0))); float n110 = dot(pf - vec3(1.0, 1.0, 0.0), hash33(pi + vec3(1.0, 1.0, 0.0))); float n001 = dot(pf - vec3(0.0, 0.0, 1.0), hash33(pi + vec3(0.0, 0.0, 1.0))); float n101 = dot(pf - vec3(1.0, 0.0, 1.0), hash33(pi + vec3(1.0, 0.0, 1.0))); float n011 = dot(pf - vec3(0.0, 1.0, 1.0), hash33(pi + vec3(0.0, 1.0, 1.0))); float n111 = dot(pf - vec3(1.0, 1.0, 1.0), hash33(pi + vec3(1.0, 1.0, 1.0)));float nx00 = mix(n000, n100, w.x); float nx01 = mix(n001, n101, w.x); float nx10 = mix(n010, n110, w.x); float nx11 = mix(n011, n111, w.x);float nxy0 = mix(nx00, nx10, w.y); float nxy1 = mix(nx01, nx11, w.y);float nxyz = mix(nxy0, nxy1, w.z);return nxyz; }const float MAX_ITERATIONS = 16.; vec2 flow (in vec2 st) { float aspectRatio = uResolution.x/uResolution.y;vec2 mPos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 0.0000); vec2 pos = mix(vec2(0.5, 0.5), mPos, floor(1.0000)); float dist = ease(0, max(0.,1. - distance(st * vec2(aspectRatio, 1), mPos * vec2(aspectRatio, 1)) * 4. * (1. - 1.0000)));float sprd = (0.2000 + 0.01) / ((aspectRatio + 1.) / 2.); float amt = 0.6000 * 0.01 * dist; if(amt <= 0.) { return st; }vec2 invPos = 1. - pos; float freq = 5. * sprd; float t = 0.0100*5. + uTime/60.; float degrees = 360. * (0.5000 * 6.); float radians = degrees * 3.1415926 / 180.;for (float i = 0.; i < MAX_ITERATIONS; i++) { vec2 scaled = (st - 0.5) * vec2(aspectRatio, 1) + invPos; float perlin = perlin_noise(vec3((scaled - 0.5) * freq, t)) - 0.5; float ang = perlin * radians; st += vec2(cos(ang), sin(ang)) * amt; st = clamp(st, 0., 1.); }return st; }out vec4 fragColor;void main() { vec2 uv = vTextureCoord; vec4 color = texture(uTexture, mix(uv, flow(uv), 1.0000)); fragColor = color;}"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }"
        ],
        "data": {
          "depth": false,
          "uniforms": {},
          "isBackground": false
        },
        "id": "effect2"
      },
      {
        "breakpoints": [],
        "visible": true,
        "aspectRatio": 1,
        "userDownsample": 1,
        "layerType": "effect",
        "type": "grain",
        "usesPingPong": false,
        "speed": 0.5,
        "texture": false,
        "animating": false,
        "mouseMomentum": 0,
        "isMask": 0,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float; precision highp int;in vec3 vVertexPosition; in vec2 vTextureCoord;uniform sampler2D uTexture; uniform float uTime; uniform vec2 uResolution; vec3 blend (int blendMode, vec3 src, vec3 dst) { return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)), (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)), (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z))); } uvec2 pcg2d(uvec2 v) { v = v * 1664525u + 1013904223u; v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u; v ^= v >> 16; v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u; return v; }float randFibo(vec2 p) { uvec2 v = floatBitsToUint(p); v = pcg2d(v); uint r = v.x ^ v.y; return float(r) / float(0xffffffffu); }out vec4 fragColor;void main() { vec2 uv = vTextureCoord; vec4 color = texture(uTexture, uv);if(color.a <= 0.001) { fragColor = vec4(0); return; }vec2 st = uv; vec3 grainRGB = vec3(0);st *= uResolution;float delta = fract((floor(uTime)/20.));if(1 == 1) { grainRGB = vec3( randFibo(st + vec2(1, 2) + delta), randFibo(st + vec2(2, 3) + delta), randFibo(st + vec2(3, 4) + delta) ); } else { grainRGB = vec3(randFibo(st + vec2(delta))); } color.rgb = mix(color.rgb, blend(5, grainRGB, color.rgb), 0.2200); fragColor = color;}"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }"
        ],
        "data": {
          "depth": false,
          "uniforms": {},
          "isBackground": false
        },
        "id": "effect3"
      },
      {
        "breakpoints": [],
        "visible": true,
        "aspectRatio": 1,
        "userDownsample": 1,
        "layerType": "effect",
        "type": "diffuse",
        "usesPingPong": false,
        "speed": 0.25,
        "trackMouse": 1,
        "trackAxes": "xy",
        "mouseMomentum": 1,
        "texture": false,
        "animating": true,
        "isMask": 0,
        "compiledFragmentShaders": [
          "#version 300 es\nprecision highp float; precision highp int;in vec2 vTextureCoord;uniform sampler2D uTexture;uniform float uTime;uniform vec2 uMousePos; uniform vec2 uResolution;float ease (int easingFunc, float t) { return t * t * t * t; }uvec2 pcg2d(uvec2 v) { v = v * 1664525u + 1013904223u; v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u; v ^= v >> 16; v.x += v.y * v.y * 1664525u + 1013904223u; v.y += v.x * v.x * 1664525u + 1013904223u; return v; }float randFibo(vec2 p) { uvec2 v = floatBitsToUint(p); v = pcg2d(v); uint r = v.x ^ v.y; return float(r) / float(0xffffffffu); }const float MAX_ITERATIONS = 24.; const float PI = 3.14159265; const float TWOPI = 6.2831853;out vec4 fragColor;void main() { vec2 uv = vTextureCoord; vec2 pos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 1.0000); float aspectRatio = uResolution.x/uResolution.y; float delta = fract(floor(uTime)/20.); float angle, rotation, amp; float inner = distance(uv * vec2(aspectRatio, 1), pos * vec2(aspectRatio, 1)); float outer = max(0., 1.-distance(uv * vec2(aspectRatio, 1), pos * vec2(aspectRatio, 1))); float amount = 0.5000 * 2.;vec2 mPos = vec2(0.5, 0.5) + mix(vec2(0), (uMousePos-0.5), 1.0000); pos = vec2(0.5, 0.5); float dist = ease(7, max(0.,1.-distance(uv * vec2(aspectRatio, 1), mPos * vec2(aspectRatio, 1)) * 4. * (1. - 0.9800)));amount *= dist;vec4 col; if(amount <= 0.001) { col = texture(uTexture, uv); } else { vec4 result = vec4(0); float threshold = max(1. - 1.0000, 2./MAX_ITERATIONS); const float invMaxIterations = 1.0 / float(MAX_ITERATIONS);vec2 dir = vec2(0.5000 / aspectRatio, 1.-0.5000) * amount * 0.4; float iterations = 0.0; for(float i = 1.; i <= MAX_ITERATIONS; i++) { float th = i * invMaxIterations; if(th > threshold) break;float random1 = randFibo(uv + th + delta); float random2 = randFibo(uv + th * 2. + delta); float random3 = randFibo(uv + th * 3. + delta); vec2 ranPoint = vec2(random1 * 2. - 1., random2 * 2. - 1.) * mix(1., random3, 0.8); result += texture(uTexture, uv + ranPoint * dir); iterations += 1.0; }result /= max(1.0, iterations); col = result; } fragColor = col;}"
        ],
        "compiledVertexShaders": [
          "#version 300 es\nprecision mediump float;in vec3 aVertexPosition; in vec2 aTextureCoord;uniform mat4 uMVMatrix; uniform mat4 uPMatrix; uniform mat4 uTextureMatrix;out vec2 vTextureCoord; out vec3 vVertexPosition;void main() { gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); vTextureCoord = (uTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy; }"
        ],
        "data": {
          "depth": false,
          "uniforms": {},
          "isBackground": false
        },
        "id": "effect4"
      }
    ],
    "options": {
      "name": "UILive Gradient Remix",
      "fps": 60,
      "dpi": 1.5,
      "scale": 1,
      "includeLogo": false,
      "isProduction": false
    },
    "version": "1.4.34",
    "id": "mlZKYVHHLjX7xiqr8oaV"
  };

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        className
      )}
      style={{ opacity }}
    >
      <UnicornScene
        production={true}
        sceneData={sceneData}
        width={width}
        height={height}
      />
    </div>
  );
};

export default PastelGradientBackground;
