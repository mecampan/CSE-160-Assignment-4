// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler;
  uniform sampler2D u_WoodTexture;
  uniform sampler2D u_WaterTexture;
  uniform sampler2D u_RockTexture;
  uniform sampler2D u_TreeTexture;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
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
  }`

// Global Variables
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
let u_FragColor;
let u_Size;
let u_ModelMatrix;
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

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }  

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }  

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
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
let g_globalAngle = 0;
let g_globaltiltAngle = 0;
let g_globalZoom = 0.5;

let g_faceAnimation = false;
let g_bodyAnimationOn = false;

let g_headAnimation = 0;
let g_bodyAnimation = 0;
let g_armSwipeAnimation = 0;
var g_eyeBlink = 1;

let g_upperArmAngle = 0;
let g_lowerArmAngle = 0;

let g_upperArmAnimation;
let g_lowerArmAnimation;

let g_rainAnimation = false;

let upperArmSlider, lowerArmSlider;

let musicPlaying = false;
let musicPlayer = new Audio('hes_a_pirate.ogg');
if(musicPlayer === null) {
  console.log('Failed to get the music file.');
}
musicPlayer.volume = 0.4

function addActionsforHtmlUI() {

  upperArmSlider = document.getElementById('upperArmSlider');
  upperArmSlider.addEventListener('mousemove',  function() { g_upperArmAngle = this.value; renderAllShapes(); });
  upperArmSlider.addEventListener('mouseup',  function() { g_upperArmAngle = this.value; renderAllShapes(); });

  lowerArmSlider = document.getElementById('lowerArmSlider');
  lowerArmSlider.addEventListener('mousemove',  function() { g_lowerArmAngle = this.value; renderAllShapes(); });
  lowerArmSlider.addEventListener('mouseup',  function() { g_lowerArmAngle = this.value; renderAllShapes(); });

  document.getElementById('faceAnimationButtonOn').onclick = function() { g_faceAnimation = true; };
  document.getElementById('faceAnimationButtonOff').onclick = function() { g_faceAnimation = false; };

  document.getElementById('bodyAnimationButtonOn').onclick = function() { g_bodyAnimationOn = true; };
  document.getElementById('bodyAnimationButtonOff').onclick = function() { g_bodyAnimationOn = false; };

  document.getElementById('rainButtonOn').onclick = function() { g_rainAnimation = true;   createRain(); };
  document.getElementById('rainButtonOff').onclick = function() { g_rainAnimation = false; };

  document.getElementById('pirateMusicButton').onclick = function() {
    if (musicPlaying) {
      musicPlayer.pause();
    } 
    else {
      musicPlayer.play();
    }
    musicPlaying = !musicPlaying;
  };
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

function initTextures(img, connected, num) {
  var image = new Image();
  if (!image) {
    console.log(`Failed to create the image object`);
    return false;
  }

  image.onload = function () {
    sendTextureToTEXTURE0(image, connected, num);
  };
  image.src = img;

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

  // Draw the island mountains
  var mountain = new Pyramid();
  mountain.color = [0.25, 0.25, 0.25, 1.0];
  mountain.matrix.translate(-150, -10, 100);
  mountain.matrix.scale(50, 100, 50);
  drawMountains(mountainRange, new Matrix4(mountain.matrix))

  var startTree = new Cube();
  startTree.matrix.translate(-55, 0, -80);
  startTree.renderfaster();
  drawTrees(new Matrix4(startTree.matrix));

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

//-------------------------------------
function updateAnimationAngles() {

  if(g_bodyAnimationOn){
    g_bodyAnimation = 15*Math.sin(g_seconds);    
    g_armSwipeAnimation = 45*Math.sin(g_seconds);    
    g_headAnimation = 5*Math.sin(g_seconds);

    g_upperArmAnimation = 15*Math.sin(g_seconds);
    g_lowerArmAnimation = 30*Math.sin(g_seconds);

    // Update sliders to match animation
    upperArmSlider.value = (g_upperArmAnimation + 15) / 30 * 100;
    lowerArmSlider.value = (g_lowerArmAnimation + 30) / 60 * 100;
  }
  else
  {
    // Set up the maximum angles to match the slider value of 0 to 100
    g_upperArmAnimation = -15 + upperArmSlider.value / 100 * 30;
    g_lowerArmAnimation = -30 + lowerArmSlider.value / 100 * 60;
  }
}


function renderAllShapes(ev) {
  var startTime = performance.now();
  camera.updateView();

  // Pass the matrix to u_ModelMatrix attributes
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0).scale(g_globalZoom, g_globalZoom, g_globalZoom).translate(0.0, 0.0, 0.5);
  globalRotMat.rotate(g_globaltiltAngle, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  updateRain();

  // Draw the sky box
  var skyBox = new Cube();
  skyBox.color = [ 0.0, 0.2, 0.2, 1.0 ];
  skyBox.textureNum = SKYTEXTURECOLOR;
  skyBox.matrix.scale(1000, 1000, 1000);
  skyBox.matrix.translate(-0.5, -0.5, 0.5);
  skyBox.renderfaster();

  // Draw the ocean
  var ocean = new Cube();
  ocean.color = [ 0.0, 0.3, 0.5, 1.0 ];
  ocean.matrix.scale(1000, 1, 1000);
  ocean.matrix.translate(-0.5, Math.sin(g_seconds) / 6 - 1.7, 0.5);
  ocean.matrix.rotate(15*Math.sin(g_seconds), 1, 1, 0);
  ocean.renderfaster();

  // Draw the island base
  var island = new Cube();
  island.color = [0.0, 0.25, 0.0, 1.0];
  island.matrix.translate(-150, -10, 50);
  island.matrix.scale(150, 10, 200);
  island.renderfaster();

  // Draw the island mountains
  var mountain = new Pyramid();
  mountain.color = [0.25, 0.25, 0.25, 1.0];
  mountain.matrix.translate(-150, -10, 50);
  mountain.matrix.scale(50, 100, 50);
  mountain.renderfaster();
  renderMountains();

  var startTree = new Cube();
  startTree.matrix.translate(-20, 0, -25);
  startTree.color = [1.0, 1.0, 1.0, 0.0];
  startTree.matrix.scale(0.0, 0.0, 0.0);
  startTree.renderfaster();
  renderTrees();

  var landHo = new Cube();
  landHo.matrix.translate(2, 0, -18);
  drawMap(docks, new Matrix4(landHo.matrix));

  var boat1 = new Cube();
  boat1.matrix.translate(5, Math.sin(g_seconds) / 10, -25);
  boat1.matrix.rotate(90, 0, 1, 0);
  boat1.matrix.rotate(Math.sin(g_seconds), 0, 0, 1);
  drawMap(boat_map, new Matrix4(boat1.matrix));

  renderDavyJones();

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

// Map Data
// --------------------
var mountainRange = [
  [ 0, [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1]
  ]
  ]
];

let mountainArray = [];
function renderMountains() {
  for(let i = 0; i < mountainArray.length; i++) 
  {
    mountainArray[i].renderfaster();
  }
}

function drawMountains(map, positionMatrix) {
  for (let x = 0; x < map.length; x++) {
    let boxArray = map[x][1];

    for (let y = 0; y < boxArray.length; y++) {
      for (let z = 0; z < boxArray[y].length; z++) {
        if (boxArray[y][z] != 0) { 
          var body = new Pyramid();
          body.color = [0.25, 0.25, 0.25, 1.0];
          body.textureNum = ROCKTEXTURE;

          body.matrix = new Matrix4(positionMatrix);
          body.matrix.translate(
            z * 0.4,
            0,
            -y * 0.5
          );
          body.matrix.rotate(randomIntFromInterval(0, 89), 0, 1, 0);
          mountainArray.push(body);
        }
      }
    }
  }
}

let tree_map = [
  [ 0, [
    [0, 3, 0],
    [0, 1, 0],
    [0, 0, 0],
    ]
  ],
  [ 1, [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    ]
  ],
  [ 2, [
    [0, 2, 0],
    [2, 1, 2],
    [0, 2, 0],
    ]
  ],
  [ 3, [
    [2, 2, 2],
    [2, 2, 2],
    [2, 2, 2],
    ]
  ],
  [ 4, [
    [0, 2, 0],
    [2, 0, 2],
    [0, 2, 0],
    ]
  ],
  [ 5, [
    [0, 0, 0],
    [0, 2, 0],
    [0, 0, 0],
    ]
  ]
];

let trees = [];
function renderTrees() {
  for(let i = 0; i < trees.length; i++) 
  {
    trees[i].renderfaster();
  }
}

var numTreasurePlaced = 0;

function drawTrees(positionMatrix) {
  for (let x = 0; x < 11; x++) {
    for (let y = 0; y < 22; y++) {
      if (randomIntFromInterval(0, 1) !== 0) continue; // 33% chance to place a tree

      let worldX = x * 5;
      let worldZ = y * 5;
      let treeRotation = randomIntFromInterval(0, 359);

      for (let layer of tree_map) { 
        let height = layer[0];  
        let boxArray = layer[1]; 

        for (let row = 0; row < boxArray.length; row++) {
          for (let col = 0; col < boxArray[row].length; col++) {
            let blockType = boxArray[row][col];
            if (blockType === 0) continue; // Skip empty spaces

            if (blockType === 3 && treeRotation > 10) continue; 
            var body = new Cube();
            body.matrix = new Matrix4(positionMatrix);
            body.matrix.translate(
              worldX + col - Math.floor(boxArray[row].length / 2), 
              height,  
              worldZ + row - Math.floor(boxArray.length / 2)
            );
            body.matrix.rotate(treeRotation, 0, 1, 0);

            if (blockType === 3) {
              numTreasurePlaced++;
              body.color = [1.0, 0.9, 0.0, 1.0]; // Gold color
              body.color = [0.1, 0.0, 0.1, 1.0];
              body.matrix.scale(0.2, 0.2, 0.2);
            } else {
              // Normal tree blocks
              body.textureNum = blockType === 2 ? TREETEXTURECOLOR : WOODTEXTURECOLOR;
              body.color = blockType === 2 ? [0.0, 0.35, 0.0, 1.0] : [0.0, 0.0, 0.0, 1.0];
              body.matrix.scale(1.0, 1.0, 1.0);
            }

            trees.push(body);
          }
        }
      }
    }
  }
  sendToTextHTML(`Number of Black Pearls on the Island: ${numTreasurePlaced}`, "numGold");

}

var docks = [
  [ 0, [
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [0],
    [0],
    [2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2]
    ]
  ], 
  [ 1, [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ]
  ]  
]

//---------------------------------
var boat_map = [
  [ 0, [
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0]
    ]
  ],
  [ 1, [
    [0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0]
    ]
  ],
  [ 2, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1, 1, 3, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
    ]
  ],
  [ 3, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 3, 1, 1, 1, 3, 1, 0, 0],
    [0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
  ]
  ],
  [ 4, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 3, 1, 1, 1, 3, 1, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 5, [
    [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 6, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 7, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 3, 3, 2, 3, 3, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 3, 3, 2, 3, 3, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 8, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 9, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 10, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 3, 3, 3, 2, 3, 3, 3, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 11, [
    [0],
    [0],
    [0],
    [0],
    [0, 3, 3, 3, 3, 2, 3, 3, 3, 3, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 3, 3, 3, 3, 2, 3, 3, 3, 3, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 12, [
    [0],
    [0],
    [0],
    [0],
    [0, 3, 3, 3, 3, 2, 3, 3, 3, 3, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 3, 3, 3, 3, 2, 3, 3, 3, 3, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ],
  [ 13, [
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    [0],
    [0],
    [0],
    [0]
    ]
  ]
]
function drawMap(map, positionMatrix) {
  for (let x = 0; x < map.length; x++) {
    let height = map[x][0];
    let boxArray = map[x][1];

    for (let y = 0; y < boxArray.length; y++) {
      for (let z = 0; z < boxArray[y].length; z++) {
        if (boxArray[y][z] != 0) { 
          var body = new Cube();
          body.textureNum = WOODTEXTURECOLOR;
          body.color = [0.1, 0.1, 0.1, 1.0];


          if (boxArray[y][z] == 2) {
            body.textureNum = WOODTEXTURECOLOR;
            body.color = [0.0, 0.0, 0.0, 1.0];
          }

          if (boxArray[y][z] == 3) {
            body.textureNum = COLOR;
            body.color = [0.0, 0.0, 0.0, 1.0];
          }

          body.matrix = new Matrix4(positionMatrix);
          
          body.matrix.scale(0.8, 0.8, 0.8);
          body.matrix.translate(
            z - 4, // Adjust horizontal positioning
            height - 1.7, // Adjust height
            y - 4  // Adjust depth positioning
          );

          body.renderfaster();
        }
      }
    }
  }
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let raindrops = [];
function createRain() {
  raindrops = [];
  rainCount = document.getElementById('rainDrops').value;

  for (let i = 0; i < rainCount; i++) {
    let xPos = randomIntFromInterval(-2000, 2000);
    let zPos = randomIntFromInterval(-2000, 2000);
    let yPos = randomIntFromInterval(0, 300);

    var rainDrop = new Cube();
    rainDrop.color = [0.5, 0.5, 1.0, 1.0];
    rainDrop.matrix.scale(0.05, 0.5, 0.05);
    rainDrop.matrix.translate(0 + xPos, 300 - yPos, -50 + zPos);
    raindrops.push(rainDrop);

    rainDrop.height = 300;
    rainDrop.currHeight = 300 - yPos;
    rainDrop.low = -10;
    rainDrop.lastDropTime = 0;
    rainDrop.xPos = xPos;
    rainDrop.zPos = zPos;
  }
}

function updateRain() {
  if(g_rainAnimation) 
  {
    for (let drop of raindrops) {
      // If it reaches the bottom, reset to the top
      if (drop.currHeight <= drop.low) {
        drop.currHeight = drop.height; // Reset height
        drop.matrix.setIdentity(); // Reset transformations
        drop.matrix.scale(0.05, 0.5, 0.05);
        drop.matrix.translate(0 + drop.xPos, drop.height, -50 + drop.zPos);
      }
      // Move down based on dropSpeed
      else {
        drop.matrix.translate(0, -3, 0); // Move down
        drop.currHeight--; // Decrease height
        drop.lastDropTime = g_seconds; // Update last drop time
      }
      drop.renderfaster();
    }
  }
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
  upperBody.matrix.translate(8, 1.3, -20.5);
  upperBody.matrix.rotate(-90, 0, 1, 0);
  upperBody.matrix.scale(0.3, 0.3, 0.3);
  var bodyCoordinatesMat = new Matrix4(upperBody.matrix);
  upperBody.matrix.translate(1.15, -0.5, -0.3);
  upperBody.matrix.rotate(180, 0, 0, 1);
  upperBody.matrix.scale(1.8, 2.6, 0.5);
  upperBody.renderfaster();

  neck = new Pyramid();
  neck.color = clothesColor;
  neck.matrix.matrix = new Matrix4(bodyCoordinatesMat)
  neck.matrix.translate(-0.5, -0.7, -0.33);
  neck.matrix.scale(1.5, 1.0, 0.5);
  neck.renderfaster();  
  
  var upperBodyAbdomen = new Cube();
  upperBodyAbdomen.color = clothesColor;
  upperBodyAbdomen.matrix = new Matrix4(bodyCoordinatesMat)
  upperBodyAbdomen.matrix.translate(-0.25, -1.8, -0.3);
  upperBodyAbdomen.matrix.scale(1.0, 1.3, 0.5);
  upperBodyAbdomen.renderfaster();

  // -------------------------
  var leftUpperArm = new Cube();
  leftUpperArm.color = clothesColor;
  leftUpperArm.matrix = new Matrix4(bodyCoordinatesMat)
  leftUpperArm.matrix.translate(-0.9, -1.5, -0.35);
  leftUpperArm.matrix.rotate(-20, 0, 0, 1);
  leftUpperArm.matrix.rotate(g_upperArmAnimation, 1, 1, 0);
  leftArmMatrixCoor = new Matrix4(leftUpperArm.matrix)
  leftUpperArm.matrix.scale(0.4, 1.0, 0.4);
  leftUpperArm.renderfaster();

  var leftForearm = new Cube();
  leftForearm.color = clothesColor;
  leftForearm.matrix = new Matrix4(leftArmMatrixCoor)
  leftForearm.matrix.rotate(g_lowerArmAnimation, 1, 0, 0);
  leftForearm.matrix.translate(0.0, 0.3, -0.2);
  leftForearm.matrix.rotate(-120, 1, 0, 0);
  leftForearmMatrixCoor = new Matrix4(leftForearm.matrix);
  leftForearm.matrix.scale(0.4, 1.0, 0.4);
  leftForearm.renderfaster();

  var sword = new Tetrahedron();
  sword.color = [0.71, 0.71, 0.71, 1.0];
  sword.matrix = new Matrix4(leftForearmMatrixCoor)
  sword.matrix.translate(0.1, 1.0, 0.0);
  sword.matrix.rotate(90, 1, 0, 0);
  sword.matrix.scale(0.1, 3.0, 0.1);
  //sword.renderfaster();
  
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
  rightUpperArm.renderfaster();

  var rightForearm = new Cube();
  rightForearm.color = clothesColor;
  rightForearm.matrix.rotate(g_lowerArmAnimation, 0, 1, 0);
  rightForearm.matrix = new Matrix4(rightArmMatrixCoor)
  rightForearm.matrix.translate(0.0, 0.3, -0.2);
  rightForearm.matrix.rotate(-120, 1, 0, 0);
  rightForearm.matrix.scale(0.4, 1.0, 0.4);
  rightForearm.renderfaster();

  // ------------------------
  var lowerBody = new Pyramid();
  lowerBody.color = clothesColor;
  var lowerBodyCoordinatesMat = new Matrix4(lowerBody.matrix);
  lowerBody.matrix.translate(-0.5, -2.2, -0.1);
  lowerBody.matrix.scale(1.5, 2.6, 0.7);
  lowerBody.renderfaster();
  
  var rightUpperLeg = new Cube();
  rightUpperLeg.color = clothesColor;
  rightUpperLeg.matrix = new Matrix4(bodyCoordinatesMat)
  rightUpperLeg.matrix.scale(-1.0, 1.0, 1.0);
  rightUpperLeg.matrix.translate(-0.8, -2.9, -0.35);
  rightUpperLeg.matrix.rotate(0, 0, 0, 1);
  rightLegMatrixCoor = new Matrix4(rightUpperLeg.matrix)
  rightUpperLeg.matrix.scale(0.5, 1.0, 0.4);
  rightUpperLeg.renderfaster();

  var rightLowerLeg = new Cube();
  rightLowerLeg.color = clothesColor;
  rightLowerLeg.matrix = new Matrix4(rightLegMatrixCoor)
  rightLowerLeg.matrix.translate(0.0, 0.3, -0.4);
  rightLowerLeg.matrix.rotate(-180, 1, 0, 0);
  rightLowerLeg.matrix.scale(0.5, 1.0, 0.4);
  rightLowerLeg.renderfaster();

  var leftUpperLeg = new Cube();
  leftUpperLeg.color = clothesColor;
  leftUpperLeg.matrix = new Matrix4(bodyCoordinatesMat)
  leftUpperLeg.matrix.translate(-0.3, -2.9, -0.35);
  leftUpperLeg.matrix.rotate(0, 0, 0, 1);
  leftLegMatrixCoor = new Matrix4(leftUpperLeg.matrix)
  leftUpperLeg.matrix.scale(0.5, 1.0, 0.4);
  leftUpperLeg.renderfaster();

  var leftLowerLeg = new Cube();
  leftLowerLeg.color = clothesColor;
  leftLowerLeg.matrix = new Matrix4(leftLegMatrixCoor)
  leftLowerLeg.matrix.translate(0.0, 0.3, -0.4);
  leftLowerLeg.matrix.rotate(-180, 1, 0, 0);
  leftLowerLeg.matrix.scale(0.5, 1.0, 0.4);
  leftLowerLeg.renderfaster();  

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
  head.renderfaster();

  // Middle Face Tentacles
  var noseBridgeLeft= new Cube();
  noseBridgeLeft.color = [0.1, 0.7, 0.6, 1.0];
  noseBridgeLeft.matrix = new Matrix4(headCoordinatesMat);
  noseBridgeLeft.matrix.translate(0.12, -0.25, -1.27);
  noseBridgeLeft.matrix.rotate(-65, 0, 0, 1);
  noseBridgeLeft.matrix.scale(0.05, 0.25, 0.11);
  noseBridgeLeft.matrix.scale(1.5, 0.8, 0.7);
  noseBridgeLeft.matrix.rotate(-10, 0, 0, 1);
  noseBridgeLeft.renderfaster();

  var noseBridgeRight = new Cube();
  noseBridgeRight.color = [0.1, 0.7, 0.6, 1.0];
  noseBridgeRight.matrix = new Matrix4(headCoordinatesMat);
  noseBridgeRight.matrix.scale(-1.0, 1.0, 1.0);
  noseBridgeRight.matrix.translate(-0.48, -0.25, -1.27);
  noseBridgeRight.matrix.rotate(-65, 0, 0, 1);
  noseBridgeRight.matrix.scale(0.05, 0.25, 0.11);
  noseBridgeRight.matrix.scale(1.5, 0.8, 0.7);
  noseBridgeRight.matrix.rotate(-10, 0, 0, 1);
  noseBridgeRight.renderfaster();

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
  leftEye.renderfaster();

  var leftEyebrow = new Cube();
  leftEyebrow.color = [0.12, 0.48, 0.4, 1.0];
  leftEyebrow.matrix = new Matrix4(headCoordinatesMat);
  leftEyebrow.matrix.translate(0.2, -0.12, -1.21);
  leftEyebrow.matrix.rotate(65, 0, 0, 1);
  leftEyebrow.matrix.scale(0.05, 0.25, 0.11);
  leftEyebrow.renderfaster();

  var rightEye = new Cube();
  rightEye.color = [0.0, 0.0, 0.0, 1.0];
  rightEye.matrix = new Matrix4(headCoordinatesMat);
  rightEye.matrix.translate(0.45, -0.2, -1.21);
  rightEye.matrix.scale(0.1, 0.15, 0.1);
  rightEye.matrix.scale(1.0, g_eyeBlink, 1.0);
  rightEye.renderfaster();  

  var rightEyebrow = new Cube();
  rightEyebrow.color = [0.12, 0.48, 0.4, 1.0];
  rightEyebrow.matrix = new Matrix4(headCoordinatesMat);
  rightEyebrow.matrix.scale(-1.0, 1.0, 1.0);  
  rightEyebrow.matrix.translate(-0.4, -0.12, -1.21);
  rightEyebrow.matrix.rotate(65, 0, 0, 1);
  rightEyebrow.matrix.scale(0.05, 0.25, 0.11);
  rightEyebrow.renderfaster();

  // Mouth
  var mouthLeft = new Cube();
  mouthLeft.color = [0.0, 0.0, 0.0, 1.0];
  mouthLeft.matrix = new Matrix4(headCoordinatesMat);
  mouthLeft.matrix.translate(0.21, -0.32, -1.27);
  mouthLeft.matrix.rotate(-65, 0, 0, 1);
  mouthLeft.matrix.scale(0.05, 0.25, 0.11);
  mouthLeft.matrix.scale(0.4, 0.4, 0.4);
  mouthLeft.renderfaster();

  var mouthRight = new Cube();
  mouthRight.color = [0.0, 0.0, 0.0, 1.0];
  mouthRight.matrix = new Matrix4(headCoordinatesMat);
  mouthRight.matrix.scale(-1.0, 1.0, 1.0);  
  mouthRight.matrix.translate(-0.4, -0.32, -1.27);
  mouthRight.matrix.rotate(-65, 0, 0, 1);
  mouthRight.matrix.scale(0.05, 0.25, 0.11);
  mouthRight.matrix.scale(0.4, 0.4, 0.4);
  mouthRight.renderfaster();  

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
  hatBase.renderfaster();

  var hatTop = new Cube();
  hatTop.color = hatColor;
  hatTop.matrix = new Matrix4(hatBaseCoorMatrix);
  hatTop.matrix.translate(-0.01, 0.35, -0.9);
  hatTop.matrix.rotate(138, 1, 0, 0);
  hatTop.matrix.scale(1.03, 1.1, 0.5)
  hatTop.renderfaster();

  var hatBottom = new Cube();
  hatBottom.color = hatColor;
  hatBottom.matrix = new Matrix4(hatBaseCoorMatrix);
  hatBottom.matrix.translate(0.00, 0.35, -0.9);
  hatBottom.matrix.rotate(138, 1, 0, 0);
  hatBottom.matrix.scale(1.03, 1.15, 0.4)
  hatBottom.matrix.rotate(17, 1, 0, 0);
  hatBottom.renderfaster();

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
  //hatFront.renderfaster();

  var hatFrontR = new Tetrahedron();
  hatFrontR.color = hatColor;
  hatFrontR.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontR.matrix.translate(1.39, 0.9, -1.05);
  hatFrontR.matrix.rotate(223, 1, 0, 0);
  hatFrontR.matrix.rotate(95, 0, 1, 0);
  hatFrontR.matrix.rotate(0, 0, 0, 1);
  hatFrontR.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontR.renderfaster();

  // ----------------------------
  var hatBack = new Tetrahedron();
  hatBack.color = hatColor;
  hatBack.matrix = new Matrix4(hatBaseCoorMatrix);
  hatBack.matrix.translate(1.0, 0.25, -0.7);
  hatBack.matrix.rotate(292, 1, 0, 0);
  hatBack.matrix.rotate(341, 0, 1, 0);
  hatBack.matrix.rotate(244, 0, 0, 1);
  hatBack.matrix.scale(1.3, 1.2, 0.6)
  //hatBack.renderfaster();

  var hatBack2 = new Tetrahedron();
  hatBack2.color = hatColor;
  hatBack2.matrix = new Matrix4(hatBaseCoorMatrix);
  hatBack2.matrix.scale(-1.0, 1.0, 1.0)
  hatBack2.matrix.translate(0.0, 0.25, -0.7);
  hatBack2.matrix.rotate(292, 1, 0, 0);
  hatBack2.matrix.rotate(341, 0, 1, 0);
  hatBack2.matrix.rotate(244, 0, 0, 1);
  hatBack2.matrix.scale(1.3, 1.2, 0.6)
  //hatBack2.renderfaster();

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
  //hatFrontL.renderfaster();

  hatFrontL = new Tetrahedron();
  hatFrontL.color = hatColor;
  hatFrontL.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontL.matrix.scale(-1.0, 1.0, 1.0)
  hatFrontL.matrix.translate(.42, 0.9, -1.09);
  hatFrontL.matrix.rotate(223, 1, 0, 0);
  hatFrontL.matrix.rotate(95, 0, 1, 0);
  hatFrontL.matrix.rotate(0, 0, 0, 1);
  hatFrontL.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontL.renderfaster();

  //----------------------------
  hatFrontR = new Tetrahedron();
  hatFrontR.color = trimColor;
  hatFrontR.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontR.matrix.translate(1.41, 0.92, -1.08);
  hatFrontR.matrix.rotate(223, 1, 0, 0);
  hatFrontR.matrix.rotate(95, 0, 1, 0);
  hatFrontR.matrix.rotate(0, 0, 0, 1);
  hatFrontR.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontR.renderfaster();

  hatFrontR = new Tetrahedron();
  hatFrontR.color = hatColor;
  hatFrontR.matrix = new Matrix4(hatBaseCoorMatrix);
  hatFrontR.matrix.translate(1.42, 0.9, -1.09);
  hatFrontR.matrix.rotate(223, 1, 0, 0);
  hatFrontR.matrix.rotate(95, 0, 1, 0);
  hatFrontR.matrix.rotate(0, 0, 0, 1);
  hatFrontR.matrix.scale(1.5, 0.8, 1.8)
  //hatFrontR.renderfaster();
}