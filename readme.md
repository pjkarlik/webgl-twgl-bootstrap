![webGl](https://img.shields.io/badge/webGl-2.0-green.svg?style=flat-square)
![vite](https://img.shields.io/badge/vite-6.0.1-51b1c5.svg?style=flat-square)
![twgljs](https://img.shields.io/badge/TWGL.js-5.5.4-c55197.svg?style=flat-square)

# WebGL Bootstrap featuring TWGL.js and VITE

![screenshot](./screenshot.png)

This is a simple bootstrap template for creating a webGL Canvas and attachng
a Fragment and Vertex Shader with TWGL.js

The Shaders are loaded in as template strings and consumed by TWGL.js and 
atached to the canvas as a WebGL context object.

From there I have a basic Uniforms loop - which sends in variables to the 
shader running on the GPU on frame refresh.

Included:
- Simple CSS file for the body and canvas element to force full width
inside the browser. 
- Basic Mouse class to capture positional data and mouse clicks.
- Simple asynchronous texture loader for static images. 

Todos:

- buffer shaders
- video sampler2D
- audio sampler2D
- asset mangement
