import './style.css';
import fragmentShader from './shaders/fragment.js';
import vertexShader from './shaders/vertex.js';
import Mouse from './mouse.js';
import * as twgl from 'twgl.js';

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

const mouse = new Mouse(glcanvas);
let umouse = [gl.canvas.width / 2, gl.canvas.height / 2, 0, 0];
let tmouse = umouse;
let uniforms;

// RENDER LOOP
const render = (time) => {
  twgl.resizeCanvasToDisplaySize(gl.canvas, 1.0);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  tmouse[0] = tmouse[0] - (tmouse[0] - mouse.x) * 0.15;
  tmouse[1] = tmouse[1] - (tmouse[1] - mouse.y) * 0.15;
  tmouse[2] = mouse.drag ? 1 : -1;

  uniforms = {
    u_time: time * 0.001,
    u_mouse: tmouse,
    u_resolution: [gl.canvas.width, gl.canvas.height]
  };

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
};

// DOM READY
window.addEventListener("DOMContentLoaded", (event) => {
  requestAnimationFrame(render);
});
