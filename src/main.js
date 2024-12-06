import './style.css';

import fragmentShader from './shaders/PolarSphere.js';
import vertexShader from './shaders/vertex.js';

import Mouse from './utils/mouse.js';
import getImage from './utils/getImage.js';

import * as twgl from 'twgl.js';

// Load Textures and put into an array
import textureFileOne from "./textures/texture3.jpg";
import textureFileTwo from "./textures/texture13.jpg";
const textureList = [textureFileOne, textureFileTwo];

// WEBGL BOOTSTRAP TWGL.js
const glcanvas = document.getElementById("canvas");
const gl = glcanvas.getContext("webgl2");
const programInfo = twgl.createProgramInfo(gl, [
  vertexShader,
  fragmentShader
]);

const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
};

const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

// Setup Mouse and initial input
const mouse = new Mouse(glcanvas);
let umouse = [gl.canvas.width / 2, gl.canvas.height / 2, 0, 0], tmouse = umouse, uniforms;

// Load Textures and set as Static Uniforms
let texts;
const loadTexture = (imageList) => {
  console.log("loading images");
  let promises = imageList.map((item) => getImage(item));

  Promise.all(promises).then((images) => {
    const txtImages = images.map((item) => {
      return { src: item, mag: gl.NEAREST };
    });
    texts = twgl.createTextures(gl, {
      iChannel0: txtImages[0],
      iChannel1: txtImages[1]
    });
    let uniforms = {
      iChannel0: texts.iChannel0,
      iChannel1: texts.iChannel1
    };
    // Create Uniforms and Pass into Shader
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
  });
};

// RENDER LOOP
const render = (time) => {
  // Check for Canvas Resize
  twgl.resizeCanvasToDisplaySize(gl.canvas, 1.0);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Interpolate Mouse for smooth movement
  tmouse[0] = tmouse[0] - (tmouse[0] - mouse.x) * 0.125;
  tmouse[1] = tmouse[1] - (tmouse[1] - mouse.y) * 0.125;
  tmouse[2] = mouse.drag ? 1 : -1;

  // Set Uniforms to be passed in
  uniforms = {
    u_time: time * 0.001,
    u_mouse: tmouse,
    u_resolution: [gl.canvas.width, gl.canvas.height]
  };
  // Pass Uniforms into Shader
  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
};

// On DOM READY - Load Textures and Kick off Render Loop
window.addEventListener("DOMContentLoaded", (event) => {
  loadTexture(textureList);
  requestAnimationFrame(render);
});
