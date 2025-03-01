// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    //v_Normal = a_Normal;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform vec4 u_FragColor;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightOn;

  uniform sampler2D u_Sampler;
  uniform sampler2D u_WoodTexture;
  uniform sampler2D u_WaterTexture;
  uniform sampler2D u_RockTexture;
  uniform sampler2D u_TreeTexture;
  uniform int u_whichTexture;
  
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4(normalize(v_Normal) * 0.5 + 0.5, 1.0); // Convert normals to color
    }
    else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                 // Use color
    }
    else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);        // Use UV debug color  
    }
    else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler, v_UV);  // Use texture0
    }
    else if (u_whichTexture == 1) {
      vec4 textureColor = texture2D(u_Sampler, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.7); // Blend texture and color 50%    
    }
    else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_WoodTexture, v_UV);  // Use wood / ship texture
    }
    else if (u_whichTexture == 3) {
      vec4 textureColor = texture2D(u_WoodTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_WaterTexture, v_UV);  // Use water texture
    }
    else if (u_whichTexture == 5) {
      vec4 textureColor = texture2D(u_WaterTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else if (u_whichTexture == 6) {
      gl_FragColor = texture2D(u_RockTexture, v_UV);  // Use rock texture
    }
    else if (u_whichTexture == 7) {
      vec4 textureColor = texture2D(u_RockTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else if (u_whichTexture == 8) {
      gl_FragColor = texture2D(u_TreeTexture, v_UV);  // Use rock texture
    }
    else if (u_whichTexture == 9) {
      vec4 textureColor = texture2D(u_TreeTexture, v_UV);
      gl_FragColor = mix(textureColor, u_FragColor, 0.5); // Blend texture and color 50%
    }
    else {
      gl_FragColor = vec4(1.0, 0.2, 0.1, 1.0);    // Error, put Redish tint
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection 
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    //Specular
    float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;
    
    vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if(u_lightOn) 
    {
      if(u_whichTexture == 0)
      {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      }
      else
      {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
    }
  }`

// Global Variables
const NORMALCOLOR = -3;
const COLOR = -2;
const DEBUG = -1;
const SKYTEXTURE = 0;
const SKYTEXTURECOLOR = 1;
const WOODTEXTURE = 2;
const WOODTEXTURECOLOR = 3;
const WATERTEXTURE = 4;
const WATERTEXTURECOLOR = 5;
const ROCKTEXTURE = 6;
const ROCKTEXTURECOLOR = 7;
const TREETEXTURE = 8;
const TREETEXTURECOLOR = 9;

//-----------------------
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_lightPos;
let u_lightOn;
let u_cameraPos;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler;
let u_WoodTexture;
let u_WaterTexture;
let u_RockTexture;
let u_TreeTexture;
let u_whichTexture;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Enable rendering objects in front of others
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  } 
  
  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  } 

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  } 

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }  

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }  

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }  

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_NormalMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    //return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of the u_Sampler
  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if(!u_Sampler) {
    console.log(`Failed to get the storage location of u_sampler`);
    return;
  }

  // Get the storage location of the u_WoodTexture
  u_WoodTexture = gl.getUniformLocation(gl.program, 'u_WoodTexture');
  if(!u_WoodTexture) {
    console.log(`Failed to get the storage location of u_WoodTexture`);
    return;
  }
  
  // Get the storage location of the u_WaterTexture
  u_WaterTexture = gl.getUniformLocation(gl.program, 'u_WaterTexture');
  if(!u_WaterTexture) {
    console.log(`Failed to get the storage location of u_WaterTexture`);
    return;
  }

  // Get the storage location of the u_RockTexture
  u_RockTexture = gl.getUniformLocation(gl.program, 'u_RockTexture');
  if(!u_RockTexture) {
    console.log(`Failed to get the storage location of u_RockTexture`);
    return;
  }

  // Get the storage location of the u_TreeTexture
  u_TreeTexture = gl.getUniformLocation(gl.program, 'u_TreeTexture');
  if(!u_TreeTexture) {
    console.log(`Failed to get the storage location of u_TreeTexture`);
    return;
  }

  // Get the storage location of the u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if(!u_whichTexture) {
    console.log(`Failed to get the storage location of u_whichTexture`);
    return;
  }  

  // Set an intial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related to HTML UI elements
let normals = true;
let g_lightOn = true;
let texture = COLOR;
let g_textureNum = -3;
let g_lightPos = [0, 1, 2];

function addActionsforHtmlUI() {
  document.getElementById('normalsOn').onclick = function() { normals = true; };
  document.getElementById('normalsOff').onclick = function() { normals = false; };

  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

  document.getElementById('lightSliderX').onmousemove = function () { g_lightPos[0] = this.value/100; renderAllShapes(); };
  document.getElementById('lightSliderY').onmousemove = function () { g_lightPos[1] = this.value/100; renderAllShapes(); };
  document.getElementById('lightSliderZ').onmousemove = function () { g_lightPos[2] = this.value/100; renderAllShapes(); };

  document.getElementById('textureInput').onclick = function () { g_textureNum = this.value; renderAllShapes(); };
}


let startingMouseX = 0;
let dragging = false;
let lastMoveTime = 0; // Track last move time

function setupMouseCamera() {
  canvas.onmousedown = function (ev) {
    startingMouseX = ev.clientX;
    dragging = true;
  };

  canvas.onmousemove = function (ev) {
    if (dragging) {
      let now = performance.now();
      let timeDiff = now - lastMoveTime;

      let deltaX = ev.clientX - startingMouseX;
      let sensitivity = 0; // Set to 0 for instant response
      let angle = 5; // Adjust panning speed

      if (timeDiff > 100) { // Only move every 100ms (0.1s)
        if (deltaX > sensitivity) {
          camera.panRight(angle);
        } else if (deltaX < -sensitivity) {
          camera.panLeft(angle);
        }

        startingMouseX = ev.clientX; // Update position
        renderAllShapes();
        lastMoveTime = now; // Store last move time
      }
    }
  };

  window.onmouseup = function () {
    dragging = false;
  };
}

function keydown(ev) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(ev.code)) {
    ev.preventDefault();
  }

  if(ev.code == 'KeyQ' || ev.code == 'ArrowUp'){
    camera.moveUp();
  }
  else if(ev.code == 'KeyE' || ev.code == 'ArrowDown'){
    camera.moveDown();
  }

  else if(ev.code == 'KeyW'){
    camera.moveForward();
  }
  else if(ev.code == 'KeyA'){
    camera.moveLeft();
  }
  else if(ev.code == 'KeyS'){
    camera.moveBackward();
  }
  else if(ev.code == 'KeyD'){
    camera.moveRight();
  }

  else if(ev.code == 'KeyZ' || ev.code == 'ArrowLeft'){
    camera.panLeft();
  }
  else if(ev.code == 'KeyX' || ev.code == 'ArrowRight'){
    camera.panRight();
  }
}

function initTextures(img, connected, num) {
  var image = new Image(); // Create an image object
  if(!image) {
    console.log(`Failed to create the image object`);
    return false;
  }

  // Register the event handler to be called on loading an image
  image.onload = function(){ sendTextureToTEXTURE0(image, connected, num); };
  // Tell the browser to load an image
  image.src = img;

  // Add more textures later
  return true;
}

function sendTextureToTEXTURE0(image, connected, num) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log(`Failed to create the texture object`);
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip Y-axis
  gl.activeTexture(gl.TEXTURE0 + num); // Activate the correct texture unit
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Load the image into the texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Link the texture unit to the corresponding uniform sampler
  gl.uniform1i(connected, num);

  console.log(`Finished loading texture into unit ${num}`);
}


// MAIN
// -----------------------------------------------------------------
// -----------------------------------------------------------------
let camera;
function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsforHtmlUI();
  setupMouseCamera();

  initTextures('sky.jpg', u_Sampler, SKYTEXTURE);
  initTextures('woodBlock.jpg', u_WoodTexture, WOODTEXTURE);
  initTextures('Water.jpg', u_WaterTexture, WATERTEXTURE);
  initTextures('Rock.jpg', u_RockTexture, ROCKTEXTURE);
  initTextures('leaves.png', u_TreeTexture, TREETEXTURE);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //gl.clear(gl.COLOR_BUFFER_BIT);

  camera = new Camera();
  document.onkeydown = keydown;

  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Print some debug information so we know we are running
  g_seconds = performance.now()/1000.0 - g_startTime;
  //console.log(g_seconds);

  //updateAnimationAngles();
  renderAllShapes();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles()
{
  g_lightPos[0] = Math.cos(g_seconds);
}

function renderAllShapes(ev) {
  var startTime = performance.now();
  camera.updateView();

  // Pass the matrix to u_ModelMatrix attributes
  var globalRotMat = new Matrix4().translate(0.0, 0.0, 0.5);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);

  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);
  
  var light = new Cube();
  light.color = [1.0, 1.0, 0.0, 1.0];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.render();

  if(normals)
  {
    texture = NORMALCOLOR;
  }

  var skyBox = new Cube();
  skyBox.color = [ 0.0, 0.2, 0.2, 1.0 ];
  skyBox.textureNum = SKYTEXTURE;
  skyBox.matrix.scale(20, 20, 20);
  skyBox.matrix.translate(-0.5, -0.5, 0.5);
  skyBox.render();

  var cube = new Cube();
  cube.textureNum = g_textureNum;
  cube.matrix.translate(0.0, 0.0, 1.0);
  cube.render();

  var sphere = new Sphere();
  sphere.textureNum = g_textureNum;
  sphere.matrix.translate(0, 0, -1);
  //sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
  sphere.render();

  var duration = performance.now() - startTime;
  sendToTextHTML(`ms: ${Math.floor(duration)} fps: ${Math.floor(10000/duration)}`, "numdot");
}

function sendToTextHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log(`Failed to get ${htmlID} from html.`);
    return;
  }

  htmlElm.innerHTML = text;
}