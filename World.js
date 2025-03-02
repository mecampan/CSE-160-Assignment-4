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
  uniform vec3 u_cameraPos;

  // Point Light
  uniform vec3 u_lightColor;
  uniform bool u_lightOn;
  uniform vec3 u_lightPos;
  uniform float u_specularPow;
  uniform float u_diffusePow;
  uniform float u_ambientPow;

  // Spotlight
  uniform bool u_spotlightOn;
  uniform vec3 u_spotlightPos;
  uniform vec3 u_spotlightDirection;
  uniform float u_lightInnerCutoff;
  uniform float u_lightOuterCutoff;

  // Textures
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
    float specular = pow(max(dot(E, R), 0.0), 64.0) * u_specularPow;
    //float specular = pow(max(dot(E, R), 0.0), 64.0) * 0.8;
    
    vec3 diffuse = u_lightColor * vec3(gl_FragColor) * nDotL * u_diffusePow;
    //vec3 diffuse = vec3(1.0, 1.0, 0.9) * vec3(gl_FragColor) * nDotL * 0.7;

    vec3 ambient = vec3(gl_FragColor) * u_ambientPow;
    //vec3 ambient = vec3(gl_FragColor) * 0.2;

    if(u_lightOn) 
    {
      if(u_whichTexture == 0)
      {
        gl_FragColor = vec4(diffuse + ambient, 1.0);
      }
      else
      {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
      }
    }
    else
    {
      gl_FragColor = vec4(ambient, 1.0);
    }

    vec3 offset = u_spotlightPos - vec3(v_VertPos);
    vec3 surfaceToLight = normalize(offset);
    vec3 lightToSurface = -surfaceToLight;
    
    float spotDiffuse = max(0.0, dot(surfaceToLight, N));
    float angleToSurface = dot(u_spotlightDirection, lightToSurface);
    float spot = smoothstep(u_lightOuterCutoff, u_lightInnerCutoff, angleToSurface);

    float brightness = spotDiffuse * spot;

    if(u_spotlightOn)
    {
      gl_FragColor.rgb += vec3(1.0, 1.0, 1.0) * brightness;
      gl_FragColor.a = 1.0;
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
let u_cameraPos;

let u_lightColor;
let u_lightPos;
let u_lightOn;
let u_specularPow;
let u_diffusePow;
let u_ambientPow;

let u_spotlightPos;
let u_spotlightDirection;
let u_spotlightOn;
let u_lightInnerCutoff
let u_lightOuterCutoff

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

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }  

  // Point Light
  // Get the storage location of u_lightColor
  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
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

  // Get the storage location of u_specularPow
  u_specularPow = gl.getUniformLocation(gl.program, 'u_specularPow');
  if (!u_specularPow) {
    console.log('Failed to get the storage location of u_specularPow');
    return;
  }  

  // Get the storage location of u_diffusePow
  u_diffusePow = gl.getUniformLocation(gl.program, 'u_diffusePow');
  if (!u_diffusePow) {
    console.log('Failed to get the storage location of u_diffusePow');
    return;
  }  

  // Get the storage location of u_ambientPow
  u_ambientPow = gl.getUniformLocation(gl.program, 'u_ambientPow');
  if (!u_ambientPow) {
    console.log('Failed to get the storage location of u_ambientPow');
    return;
  }  

  // Spotlights
  // Get the storage location of u_spotlightPos
  u_spotlightPos = gl.getUniformLocation(gl.program, 'u_spotlightPos');
  if (!u_spotlightPos) {
    console.log('Failed to get the storage location of u_spotlightPos');
    return;
  }  

  // Get the storage location of u_spotlightDirection
  u_spotlightDirection = gl.getUniformLocation(gl.program, 'u_spotlightDirection');
  if (!u_spotlightDirection) {
    console.log('Failed to get the storage location of u_spotlightDirection');
    return;
  } 

  // Get the storage location of u_spotlightOn
  u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
  if (!u_spotlightOn) {
    console.log('Failed to get the storage location of u_spotlightOn');
    return;
  }  

  // Get the storage location of u_lightInnerCutoff
  u_lightInnerCutoff = gl.getUniformLocation(gl.program, 'u_lightInnerCutoff');
  if (!u_lightInnerCutoff) {
    console.log('Failed to get the storage location of u_lightInnerCutoff');
    //return;
  }  

  // Get the storage location of u_lightOuterCutoff
  u_lightOuterCutoff = gl.getUniformLocation(gl.program, 'u_lightOuterCutoff');
  if (!u_lightOuterCutoff) {
    console.log('Failed to get the storage location of u_lightOuterCutoff');
    //return;
  }   
 
  // Matrices
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
let normals = false;
let g_textureNum = -2;

let lightColor = [1.0, 1.0, 1.0];
let g_lightOn = true;
let g_lightPos = [0, 1, 2];
let g_lightAnimation = false;

let g_spotlightOn = false;
let g_spotlightPos = [0, 1, 2];
let g_spotlightDirection = [0, 1, 0];
let g_spotlightAnimation = false;

let g_bodyAnimationOn = true;
let g_faceAnimation = 0;
let g_upperArmAnimation = 0;
let g_lowerArmAnimation = 0;
let g_headAnimation = 0;
let g_eyeBlink = 0;

let skyBoxTexture = SKYTEXTURE;

function addActionsforHtmlUI() {
  document.getElementById('normalsOn').onclick = function() { normals = true; };
  document.getElementById('normalsOff').onclick = function() { normals = false; };
  document.getElementById('textureInput').onclick = function () { g_textureNum = this.value; renderAllShapes(); };
  document.getElementById('skyboxTexture').onclick = function () { skyBoxTexture = g_textureNum; renderAllShapes(); };

  // Point Light
  document.getElementById('lightOn').onclick = function() { g_lightOn = true; };
  document.getElementById('lightOff').onclick = function() { g_lightOn = false; };

  document.getElementById('lightAnimOn').onclick = function() { g_lightAnimation = true; };
  document.getElementById('lightAnimOff').onclick = function() { g_lightAnimation = false; };

  document.getElementById('colorRed').onmousemove = function () { lightColor[0] = this.value/100; renderAllShapes(); };
  document.getElementById('colorGreen').onmousemove = function () { lightColor[1] = this.value/100; renderAllShapes(); };
  document.getElementById('colorBlue').onmousemove = function () { lightColor[2] = this.value/100; renderAllShapes(); };

  document.getElementById('lightSliderX').onmousemove = function () { g_lightPos[0] = this.value/100; renderAllShapes(); };
  document.getElementById('lightSliderY').onmousemove = function () { g_lightPos[1] = this.value/100; renderAllShapes(); };
  document.getElementById('lightSliderZ').onmousemove = function () { g_lightPos[2] = this.value/100; renderAllShapes(); };

  document.getElementById('specularVal').onmousemove = function () { 
    gl.uniform1f(u_specularPow, parseFloat(this.value) / 100); 
    renderAllShapes(); 
  };

  document.getElementById('diffuseVal').onmousemove = function () { 
    gl.uniform1f(u_diffusePow, parseFloat(this.value) / 100); 
    renderAllShapes(); 
  };

  document.getElementById('ambientVal').onmousemove = function () { 
    gl.uniform1f(u_ambientPow, parseFloat(this.value) / 100); 
    renderAllShapes(); 
  };

  gl.uniform1f(u_specularPow, document.getElementById('specularVal').value / 100); // Set default specular power
  gl.uniform1f(u_diffusePow, document.getElementById('diffuseVal').value / 100); // Set default specular power
  gl.uniform1f(u_ambientPow, document.getElementById('ambientVal').value / 100); // Set default specular power

  // Spot Light
  document.getElementById('spotlightOn').onclick = function() { g_spotlightOn = true; };
  document.getElementById('spotlightOff').onclick = function() { g_spotlightOn = false; };

  document.getElementById('spotlightAnimOn').onclick = function() { g_spotlightAnimation = true; };
  document.getElementById('spotlightAnimOff').onclick = function() { g_spotlightAnimation = false; };

  document.getElementById('spotlightSliderX').onmousemove = function () { g_spotlightPos[0] = this.value/100; renderAllShapes(); };
  document.getElementById('spotlightSliderY').onmousemove = function () { g_spotlightPos[1] = this.value/100; renderAllShapes(); };
  document.getElementById('spotlightSliderZ').onmousemove = function () { g_spotlightPos[2] = this.value/100; renderAllShapes(); };

  document.getElementById('lightInnerCutoff').onmousemove = function () { 
    gl.uniform1f(u_lightInnerCutoff, this.value); 
    renderAllShapes(); 
  };

  document.getElementById('lightOuterCutoff').onmousemove = function () { 
    gl.uniform1f(u_lightOuterCutoff, this.value); 
    renderAllShapes(); 
  };

  gl.uniform1f(u_lightInnerCutoff, document.getElementById('lightInnerCutoff').value); // Set default specular power
  gl.uniform1f(u_lightOuterCutoff, document.getElementById('lightOuterCutoff').value); // Set default specular power
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

  if(ev.code == 'ArrowUp'){
    camera.moveUp();
  }
  else if(ev.code == 'ArrowDown'){
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

  else if(ev.code == 'ArrowLeft'){
    camera.panLeft();
  }
  else if(ev.code == 'ArrowRight'){
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

  updateAnimationAngles();
  renderAllShapes();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_lightAnimation) {
    let newValue = Math.cos(g_seconds); // Scale cosine range to match slider range

    g_lightPos[0] = newValue;
    document.getElementById('lightSliderX').value = newValue * 250; // Update slider position
  }
  if (g_spotlightAnimation) {
    let newValue = Math.cos(g_seconds); // Scale cosine range to match slider range

    g_spotlightPos[0] = newValue;
    document.getElementById('spotlightSliderX').value = newValue * 250; // Update slider position
  }

  if(g_bodyAnimationOn){
    g_bodyAnimation = 15*Math.sin(g_seconds);    
    g_armSwipeAnimation = 45*Math.sin(g_seconds);    
    g_headAnimation = 5*Math.sin(g_seconds);

    g_upperArmAnimation = 15*Math.sin(g_seconds);
    g_lowerArmAnimation = 30*Math.sin(g_seconds);

    // Update sliders to match animation
    //upperArmSlider.value = (g_upperArmAnimation + 15) / 30 * 100;
    //lowerArmSlider.value = (g_lowerArmAnimation + 30) / 60 * 100;
  }
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

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);

  // Pass the color of the light to GLSL
  gl.uniform3f(u_lightColor, lightColor[0], lightColor[1], lightColor[2]);  

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  // Pass the spotlight position to GLSL
  gl.uniform3f(u_spotlightPos, g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  // Pass the spotlight direction to GLSL
  gl.uniform3f(u_spotlightDirection, g_spotlightDirection[0], g_spotlightDirection[1], g_spotlightDirection[2]);
  // Pass the spotlight status
  gl.uniform1i(u_spotlightOn, g_spotlightOn);
  
  var light = new Cube();
  light.color = [1.0, 1.0, 0.0, 1.0];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.render();

  var spotlight = new Cube();
  spotlight.color = [1.0, 1.0, 1.0, 1.0];
  spotlight.matrix.translate(g_spotlightPos[0], g_spotlightPos[1], g_spotlightPos[2]);
  spotlight.matrix.scale(-0.5, -0.5, -0.5);
  spotlight.render();

  var skyBox = new Cube();
  skyBox.color = [ 0.0, 0.2, 0.2, 1.0 ];
  skyBox.textureNum = skyBoxTexture;
  skyBox.matrix.scale(20, 20, 20);
  skyBox.matrix.translate(-0.5, -0.5, 0.5);
  skyBox.render();

  var cube = new Cube();
  cube.textureNum = normals? NORMALCOLOR : g_textureNum;
  cube.matrix.translate(0.0, -2.0, -0.6);
  cube.matrix.scale(0.8, 0.8, 0.8);
  cube.render();

  var floor = new Cube();
  floor.textureNum = COLOR;
  floor.matrix.translate(-3.0, -3.0, 2.0);
  floor.matrix.scale(5.0, 0.2, 5.0);
  floor.render();

  var sphere = new Sphere();
  sphere.textureNum = normals? NORMALCOLOR : g_textureNum;
  sphere.matrix.translate(0.0, -1.0, 2);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  //sphere.normalMatrix.setInverseOf(sphere.matrix).transpose();
  sphere.render();

  renderDavyJones();

  var duration = performance.now() - startTime;
  sendToTextHTML(`ms: ${Math.floor(duration)} fps: ${Math.floor(10000/duration)}`, "numdot");
  let textureName;
  switch (parseInt(g_textureNum, 10)) {
    case -3:
      textureName = "Normals Coloring";
      break;

    case -2:
      textureName = "Color";
      break;

    case 0:
      textureName = "Sky Texture";
      break;

    case 1:
      textureName = "Sky Texture with Color";
      break;

    case 2:
      textureName = "Wood Texture";
      break;

    case 3:
      textureName = "Wood Texture with Color";
      break;  
      
    case 4:
      textureName = "Water Texture";
      break;

    case 5:
      textureName = "Water Texture with Color";
      break;  

    case 6:
      textureName = "Rock Texture";
      break;

    case 7:
      textureName = "Rock Texture with Color";
      break;  

    case 8:
      textureName = "Tree Texture";
      break;

    case 9:
      textureName = "Tree Texture with Color";
      break;  

    default:
      textureName = "Debug";
      break;
  }
  sendToTextHTML(`${textureName}`, "textureType");
}

function sendToTextHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log(`Failed to get ${htmlID} from html.`);
    return;
  }

  htmlElm.innerHTML = text;
}



// Davy Jones
function drawTentacle(attachedMat, pos, rotation, segments, delay) {
  var prevSegment = attachedMat;
  var delayFactor = delay;
  var backDistance = pos[2] / 4;

  for (let i = 0; i < segments; i++) {
    var tentacle = new Cube();
    tentacle.color = [0.2 - (i * 0.05) + backDistance, 0.9 - (i * 0.05) + backDistance, 0.8 - (i * 0.05) + backDistance, 1.0];
    tentacle.matrix = prevSegment;
    if(i === 0) {
      tentacle.matrix.translate(pos[0], pos[1], pos[2]);
      tentacle.matrix.scale(0.15, 0.25, 0.15);
    }
    else {
      tentacle.matrix.translate(0.02, -0.8, 0.001);
      tentacle.matrix.scale(0.9, 0.9, 1.0);
    }

    if(g_faceAnimation) {
      var waveMotion = Math.sin(g_seconds - i * delayFactor) * 0.1;
      tentacle.matrix.rotate(rotation * Math.sin(g_seconds - i * delayFactor) * 0.1, 0, 0, 1);
      tentacle.matrix.translate(waveMotion / 2, 0, 0); 
    }

    tentacle.render();
    prevSegment = new Matrix4(tentacle.matrix);
  }
}

function renderDavyJones() 
{
  var darkerColor = 0.05;
  var clothesColor = [0.16 - darkerColor, 0.11 - darkerColor, 0.05 - darkerColor, 1.0];  

  // Body if there is time
  upperBody = new Pyramid();
  upperBody.color = clothesColor;
  upperBody.matrix.translate(-1, -1, 1);
  upperBody.matrix.rotate(180, 0, 1, 0);
  upperBody.matrix.scale(0.3, 0.3, 0.3);
  var bodyCoordinatesMat = new Matrix4(upperBody.matrix);
  upperBody.matrix.translate(1.15, -0.5, -0.3);
  upperBody.matrix.rotate(180, 0, 0, 1);
  upperBody.matrix.scale(1.8, 2.6, 0.5);
  upperBody.render();

  neck = new Pyramid();
  neck.color = clothesColor;
  neck.matrix.matrix = new Matrix4(bodyCoordinatesMat)
  neck.matrix.translate(-0.5, -0.7, -0.33);
  neck.matrix.scale(1.5, 1.0, 0.5);
  //neck.render();  
  
  var upperBodyAbdomen = new Cube();
  upperBodyAbdomen.color = clothesColor;
  upperBodyAbdomen.matrix = new Matrix4(bodyCoordinatesMat)
  upperBodyAbdomen.matrix.translate(-0.25, -1.8, -0.3);
  upperBodyAbdomen.matrix.scale(1.0, 1.3, 0.5);
  //upperBodyAbdomen.matrix.scale(10.0, 10.0, 10.0);
  upperBodyAbdomen.render();

  // -------------------------
  var leftUpperArm = new Cube();
  leftUpperArm.color = clothesColor;
  leftUpperArm.matrix = new Matrix4(bodyCoordinatesMat)
  leftUpperArm.matrix.translate(-0.9, -1.5, -0.35);
  leftUpperArm.matrix.rotate(-20, 0, 0, 1);
  leftUpperArm.matrix.rotate(g_upperArmAnimation, 1, 1, 0);
  leftArmMatrixCoor = new Matrix4(leftUpperArm.matrix)
  leftUpperArm.matrix.scale(0.4, 1.0, 0.4);
  leftUpperArm.render();

  var leftForearm = new Cube();
  leftForearm.color = clothesColor;
  leftForearm.matrix = new Matrix4(leftArmMatrixCoor)
  leftForearm.matrix.rotate(g_lowerArmAnimation, 1, 0, 0);
  leftForearm.matrix.translate(0.0, 0.3, -0.2);
  leftForearm.matrix.rotate(-120, 1, 0, 0);
  leftForearmMatrixCoor = new Matrix4(leftForearm.matrix);
  leftForearm.matrix.scale(0.4, 1.0, 0.4);
  leftForearm.render();

  var sword = new Tetrahedron();
  sword.color = [0.71, 0.71, 0.71, 1.0];
  sword.matrix = new Matrix4(leftForearmMatrixCoor)
  sword.matrix.translate(0.1, 1.0, 0.0);
  sword.matrix.rotate(90, 1, 0, 0);
  sword.matrix.scale(0.1, 3.0, 0.1);
  //sword.render();
  
  // -------------------------
  var rightUpperArm = new Cube();
  rightUpperArm.color = clothesColor;
  rightUpperArm.matrix = new Matrix4(bodyCoordinatesMat)
  rightUpperArm.matrix.scale(-1.0, 1.0, 1.0);
  rightUpperArm.matrix.translate(-1.4, -1.5, -0.35);
  rightUpperArm.matrix.rotate(-20, 0, 0, 1);
  rightUpperArm.matrix.rotate(g_upperArmAnimation, 1, 1, 0);
  rightArmMatrixCoor = new Matrix4(rightUpperArm.matrix)
  rightUpperArm.matrix.scale(0.4, 1.0, 0.4);
  rightUpperArm.render();

  var rightForearm = new Cube();
  rightForearm.color = clothesColor;
  rightForearm.matrix.rotate(g_lowerArmAnimation, 0, 1, 0);
  rightForearm.matrix = new Matrix4(rightArmMatrixCoor)
  rightForearm.matrix.translate(0.0, 0.3, -0.2);
  rightForearm.matrix.rotate(-120, 1, 0, 0);
  rightForearm.matrix.scale(0.4, 1.0, 0.4);
  rightForearm.render();

  // ------------------------
  var lowerBody = new Pyramid();
  lowerBody.color = clothesColor;
  var lowerBodyCoordinatesMat = new Matrix4(lowerBody.matrix);
  lowerBody.matrix.translate(-0.5, -2.2, -0.1);
  lowerBody.matrix.scale(1.5, 2.6, 0.7);
  //lowerBody.render();
  
  var rightUpperLeg = new Cube();
  rightUpperLeg.color = clothesColor;
  rightUpperLeg.matrix = new Matrix4(bodyCoordinatesMat)
  rightUpperLeg.matrix.scale(-1.0, 1.0, 1.0);
  rightUpperLeg.matrix.translate(-0.8, -2.9, -0.35);
  rightUpperLeg.matrix.rotate(0, 0, 0, 1);
  rightLegMatrixCoor = new Matrix4(rightUpperLeg.matrix)
  rightUpperLeg.matrix.scale(0.5, 1.0, 0.4);
  rightUpperLeg.render();

  var rightLowerLeg = new Cube();
  rightLowerLeg.color = clothesColor;
  rightLowerLeg.matrix = new Matrix4(rightLegMatrixCoor)
  rightLowerLeg.matrix.translate(0.0, 0.3, -0.4);
  rightLowerLeg.matrix.rotate(-180, 1, 0, 0);
  rightLowerLeg.matrix.scale(0.5, 1.0, 0.4);
  rightLowerLeg.render();

  var leftUpperLeg = new Cube();
  leftUpperLeg.color = clothesColor;
  leftUpperLeg.matrix = new Matrix4(bodyCoordinatesMat)
  leftUpperLeg.matrix.translate(-0.3, -2.9, -0.35);
  leftUpperLeg.matrix.rotate(0, 0, 0, 1);
  leftLegMatrixCoor = new Matrix4(leftUpperLeg.matrix)
  leftUpperLeg.matrix.scale(0.5, 1.0, 0.4);
  leftUpperLeg.render();

  var leftLowerLeg = new Cube();
  leftLowerLeg.color = clothesColor;
  leftLowerLeg.matrix = new Matrix4(leftLegMatrixCoor)
  leftLowerLeg.matrix.translate(0.0, 0.3, -0.4);
  leftLowerLeg.matrix.rotate(-180, 1, 0, 0);
  leftLowerLeg.matrix.scale(0.5, 1.0, 0.4);
  leftLowerLeg.render();  

  // Head
  var head = new Cube();
  head.color = [0.22, 0.58, 0.5, 1.0];
  head.matrix = new Matrix4(bodyCoordinatesMat);
  head.matrix.scale(0.7, 0.7, 0.7);
  head.matrix.rotate(-g_headAnimation, 0, 1, 1);
  var headCoordinatesMat = new Matrix4(head.matrix);
  head.matrix.translate(-0.2, -0.51, -0.3);
  var headCoordinatesMatrix = new Matrix4(head.matrix);
  head.matrix.scale(1.0, 0.6, 1.0);
  head.render();

  // Middle Face Tentacles
  var noseBridgeLeft= new Cube();
  noseBridgeLeft.color = [0.1, 0.7, 0.6, 1.0];
  noseBridgeLeft.matrix = new Matrix4(headCoordinatesMat);
  noseBridgeLeft.matrix.translate(0.12, -0.25, -1.27);
  noseBridgeLeft.matrix.rotate(-65, 0, 0, 1);
  noseBridgeLeft.matrix.scale(0.05, 0.25, 0.11);
  noseBridgeLeft.matrix.scale(1.5, 0.8, 0.7);
  noseBridgeLeft.matrix.rotate(-10, 0, 0, 1);
  noseBridgeLeft.render();

  var noseBridgeRight = new Cube();
  noseBridgeRight.color = [0.1, 0.7, 0.6, 1.0];
  noseBridgeRight.matrix = new Matrix4(headCoordinatesMat);
  noseBridgeRight.matrix.scale(-1.0, 1.0, 1.0);
  noseBridgeRight.matrix.translate(-0.48, -0.25, -1.27);
  noseBridgeRight.matrix.rotate(-65, 0, 0, 1);
  noseBridgeRight.matrix.scale(0.05, 0.25, 0.11);
  noseBridgeRight.matrix.scale(1.5, 0.8, 0.7);
  noseBridgeRight.matrix.rotate(-10, 0, 0, 1);
  noseBridgeRight.render();

  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.25, 0.0, -0.9], 15, 7, 0.2 + Math.sin(g_seconds) / 10);
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.6, 0.0, -0.9], 15, 7, 0.2 + Math.sin(g_seconds) / 10);

  // Beard Tentacles
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.37, -0.2, -0.88], 15, 8, 0.5 + Math.sin(g_seconds) / 10);
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.53, -0.2, -0.88], 15, 8, 0.5 + Math.sin(g_seconds) / 10);

  // Left beard Tentacles hieght decreasing
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.25, -0.25, -0.86], 15, 3, 0.4 + Math.sin(g_seconds) / 10);
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.15, -0.15, -0.86], 15, 3, 0.3 + Math.sin(g_seconds) / 10);
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.0, -0.1, -0.86], 15, 2, 0.2 + Math.sin(g_seconds) / 10);

  // Right beard Tentacles hieght decreasing
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.6, -0.25, -0.86], 15, 3, 0.4 + Math.sin(g_seconds) / 10);
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.75, -0.15, -0.86], 15, 3, 0.3 + Math.sin(g_seconds) / 10);
  drawTentacle(new Matrix4(headCoordinatesMatrix), [0.86, -0.1, -0.86], 15, 2, 0.2 + Math.sin(g_seconds) / 10);

  //Eyes
  var leftEye = new Cube();
  leftEye.color = [0.0, 0.0, 0.0, 1.0];
  leftEye.matrix = new Matrix4(headCoordinatesMat);
  leftEye.matrix.translate(0.05, -0.2, -1.21);
  leftEye.matrix.scale(0.1, 0.15, 0.1);
  leftEye.matrix.scale(1.0, g_eyeBlink, 1.0);
  leftEye.render();

  var leftEyebrow = new Cube();
  leftEyebrow.color = [0.12, 0.48, 0.4, 1.0];
  leftEyebrow.matrix = new Matrix4(headCoordinatesMat);
  leftEyebrow.matrix.translate(0.2, -0.12, -1.21);
  leftEyebrow.matrix.rotate(65, 0, 0, 1);
  leftEyebrow.matrix.scale(0.05, 0.25, 0.11);
  leftEyebrow.render();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix = new Matrix4(headCoordinatesMat);
  rightEye.matrix.translate(0.45, -0.2, -1.21);
  rightEye.matrix.scale(0.1, 0.15, 0.1);
  rightEye.matrix.scale(1.0, g_eyeBlink, 1.0);
  rightEye.render();  

  var rightEyebrow = new Cube();
  rightEyebrow.color = [0.12, 0.48, 0.4, 1.0];
  rightEyebrow.matrix = new Matrix4(headCoordinatesMat);
  rightEyebrow.matrix.scale(-1.0, 1.0, 1.0);  
  rightEyebrow.matrix.translate(-0.4, -0.12, -1.21);
  rightEyebrow.matrix.rotate(65, 0, 0, 1);
  rightEyebrow.matrix.scale(0.05, 0.25, 0.11);
  rightEyebrow.render();

  // Mouth
  var mouthLeft = new Cube();
  mouthLeft.color = [0.0, 0.0, 0.0, 1.0];
  mouthLeft.matrix = new Matrix4(headCoordinatesMat);
  mouthLeft.matrix.translate(0.21, -0.32, -1.27);
  mouthLeft.matrix.rotate(-65, 0, 0, 1);
  mouthLeft.matrix.scale(0.05, 0.25, 0.11);
  mouthLeft.matrix.scale(0.4, 0.4, 0.4);
  mouthLeft.render();

  var mouthRight = new Cube();
  mouthRight.color = [0.0, 0.0, 0.0, 1.0];
  mouthRight.matrix = new Matrix4(headCoordinatesMat);
  mouthRight.matrix.scale(-1.0, 1.0, 1.0);  
  mouthRight.matrix.translate(-0.4, -0.32, -1.27);
  mouthRight.matrix.rotate(-65, 0, 0, 1);
  mouthRight.matrix.scale(0.05, 0.25, 0.11);
  mouthRight.matrix.scale(0.4, 0.4, 0.4);
  mouthRight.render();  

  // ----------------------------
  // Davy Jones Hat
  var hatColor = [0.08, 0.09, 0.15, 1.0];
  var hatBase = new Cube();
  hatBase.color = [0.67, 0.61, 0.44, 1.0];
  hatBase.matrix = new Matrix4(headCoordinatesMat);
  hatBase.matrix.translate(-0.201, 0.0, -0.27);
  hatBaseCoorMatrix = new Matrix4(hatBase.matrix);
  hatBase.matrix.scale(1.002, 0.311, 0.8);
  hatBase.matrix.translate(0.0, 0.1, -0.32);
  hatBase.render();

  var hatTop = new Cube();
  hatTop.color = hatColor;
  hatTop.matrix = new Matrix4(hatBaseCoorMatrix);
  hatTop.matrix.translate(-0.01, 0.35, -0.9);
  hatTop.matrix.rotate(138, 1, 0, 0);
  hatTop.matrix.scale(1.03, 1.1, 0.5)
  hatTop.render();

  var hatBottom = new Cube();
  hatBottom.color = hatColor;
  hatBottom.matrix = new Matrix4(hatBaseCoorMatrix);
  hatBottom.matrix.translate(0.00, 0.35, -0.9);
  hatBottom.matrix.rotate(138, 1, 0, 0);
  hatBottom.matrix.scale(1.03, 1.15, 0.4)
  hatBottom.matrix.rotate(17, 1, 0, 0);
  hatBottom.render();

  // ----------------------------
  var hatFront = new Tetrahedron();
  hatFront.color = hatColor;
  hatFront.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFront.matrix.scale(-1.0, 1.0, 1.0)
  hatFront.matrix.translate(.39, 0.9, -1.05);
  hatFront.matrix.rotate(223, 1, 0, 0);
  hatFront.matrix.rotate(95, 0, 1, 0);
  hatFront.matrix.rotate(0, 0, 0, 1);
  hatFront.matrix.scale(1.5, 0.8, 1.8)
  //hatFront.render();

  var hatFrontR = new Tetrahedron();
  hatFrontR.color = hatColor;
  hatFrontR.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontR.matrix.translate(1.39, 0.9, -1.05);
  hatFrontR.matrix.rotate(223, 1, 0, 0);
  hatFrontR.matrix.rotate(95, 0, 1, 0);
  hatFrontR.matrix.rotate(0, 0, 0, 1);
  hatFrontR.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontR.render();

  // ----------------------------
  var hatBack = new Tetrahedron();
  hatBack.color = hatColor;
  hatBack.matrix = new Matrix4(hatBaseCoorMatrix);
  hatBack.matrix.translate(1.0, 0.25, -0.7);
  hatBack.matrix.rotate(292, 1, 0, 0);
  hatBack.matrix.rotate(341, 0, 1, 0);
  hatBack.matrix.rotate(244, 0, 0, 1);
  hatBack.matrix.scale(1.3, 1.2, 0.6)
  //hatBack.render();

  var hatBack2 = new Tetrahedron();
  hatBack2.color = hatColor;
  hatBack2.matrix = new Matrix4(hatBaseCoorMatrix);
  hatBack2.matrix.scale(-1.0, 1.0, 1.0)
  hatBack2.matrix.translate(0.0, 0.25, -0.7);
  hatBack2.matrix.rotate(292, 1, 0, 0);
  hatBack2.matrix.rotate(341, 0, 1, 0);
  hatBack2.matrix.rotate(244, 0, 0, 1);
  hatBack2.matrix.scale(1.3, 1.2, 0.6)
  //hatBack2.render();

  // Gold Trim
  // Ugly way to do it, but tired and can't think of a better way
  var trimColor = [0.85, 0.75, 0.46, 1.0];
  hatFrontL = new Tetrahedron();
  hatFrontL.color = trimColor;
  hatFrontL.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontL.matrix.scale(-1.0, 1.0, 1.0)
  hatFrontL.matrix.translate(.41, 0.92, -1.08);
  hatFrontL.matrix.rotate(223, 1, 0, 0);
  hatFrontL.matrix.rotate(95, 0, 1, 0);
  hatFrontL.matrix.rotate(0, 0, 0, 1);
  hatFrontL.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontL.render();

  hatFrontL = new Tetrahedron();
  hatFrontL.color = hatColor;
  hatFrontL.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontL.matrix.scale(-1.0, 1.0, 1.0)
  hatFrontL.matrix.translate(.42, 0.9, -1.09);
  hatFrontL.matrix.rotate(223, 1, 0, 0);
  hatFrontL.matrix.rotate(95, 0, 1, 0);
  hatFrontL.matrix.rotate(0, 0, 0, 1);
  hatFrontL.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontL.render();

  //----------------------------
  hatFrontR = new Tetrahedron();
  hatFrontR.color = trimColor;
  hatFrontR.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontR.matrix.translate(1.41, 0.92, -1.08);
  hatFrontR.matrix.rotate(223, 1, 0, 0);
  hatFrontR.matrix.rotate(95, 0, 1, 0);
  hatFrontR.matrix.rotate(0, 0, 0, 1);
  hatFrontR.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontR.render();

  hatFrontR = new Tetrahedron();
  hatFrontR.color = hatColor;
  hatFrontR.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontR.matrix.translate(1.42, 0.9, -1.09);
  hatFrontR.matrix.rotate(223, 1, 0, 0);
  hatFrontR.matrix.rotate(95, 0, 1, 0);
  hatFrontR.matrix.rotate(0, 0, 0, 1);
  hatFrontR.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontR.render();
}