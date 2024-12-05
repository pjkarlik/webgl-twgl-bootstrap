const vertexShader = `#version 300 es
precision highp float;
  in vec4 position;

  void main() {
    gl_Position = vec4( position );
  }`;

  export default vertexShader;
  