const socket = io();
const sliderValues = new Array(8);
socket.on('sliders', (msg) => {
  for (let i in msg.sliders) {
    sliderValues[i] = msg.sliders[i];
    document.getElementById('slide' + i).value = msg.sliders[i];
  }
});
for (let i = 0; i < 8; i++) {
  document.getElementById('slide' + i).oninput = function () {
    socket.emit('slide', { id: i, val: this.value });
    sliderValues[i] = this.value;
  }
}

var scene;
var camera;

var renderer;
var bufferScene;
var textureA;
var textureB;
var bufferMaterial;
var plane;
var bufferObject;
var finalMaterial;
var quad;
var video;
var videoTexture;

// document.addEventListener('click', function (event) {
//   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     var constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
//     navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
//       // apply the stream to the video element used in the texture
//       video.srcObject = stream;
//       video.play();
//     }).catch(function (error) {
//       console.error('Unable to access the camera/webcam.', error);
//     });
//   } else {
//     console.error('MediaDevices interface not available.');
//   }
// });

var width, height;
function sceneSetup() {
  scene = new THREE.Scene();
  width = Math.min(window.innerWidth, window.innerHeight);
  height = Math.min(window.innerWidth, window.innerHeight);
  camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
  camera.position.z = 2;

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);
}

function videoTextureSetup() {
  video = document.getElementById('video');
  videoTexture = new THREE.VideoTexture(video);

  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.format = THREE.RGBFormat;
}

function bufferTextureSetup() {
  //Create buffer scene
  bufferScene = new THREE.Scene();
  //Create 2 buffer textures
  textureA = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
  textureB = new THREE.WebGLRenderTarget(width, height, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter });
  textureA.texture.minFilter = THREE.LinearFilter;
  textureA.texture.magFilter = THREE.LinearFilter;
  textureB.texture.minFilter = THREE.LinearFilter;
  textureB.texture.magFilter = THREE.LinearFilter;
  //Pass textureA to shader
  bufferMaterial = new THREE.ShaderMaterial({
    uniforms: {
      bufferTexture: { type: "t", value: textureA.texture },
      res: { type: 'v2', value: new THREE.Vector2(width, height) },
      //Keeps the resolution
      videoTexture: { type: "t", value: videoTexture },
      time: { type: "f", value: Math.random() * Math.PI * 2 + Math.PI },
      slider0: { type: "f", value: 0.0 },
      slider1: { type: "f", value: 0.0 },
      slider2: { type: "f", value: 0.0 },
      slider3: { type: "f", value: 0.0 },
      slider4: { type: "f", value: 0.0 },
      slider5: { type: "f", value: 0.0 },
      slider6: { type: "f", value: 0.0 },
      slider7: { type: "f", value: 0.0 },
    },
    fragmentShader: document.getElementById('fragShader0').innerHTML
  });
  plane = new THREE.PlaneBufferGeometry(width, height);
  bufferObject = new THREE.Mesh(plane, bufferMaterial);
  bufferScene.add(bufferObject);

  //Draw textureB to screen 
  finalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      bufferTexture: { type: "t", value: textureA.texture },
      res: { type: 'v2', value: new THREE.Vector2(width, height) },
      //Keeps the resolution
      videoTexture: { type: "t", value: textureB },
      time: { type: "f", value: Math.random() * Math.PI * 2 + Math.PI },
      slider0: { type: "f", value: 0.0 },
      slider1: { type: "f", value: 0.0 },
      slider2: { type: "f", value: 0.0 },
      slider3: { type: "f", value: 0.0 },
      slider4: { type: "f", value: 0.0 },
      slider5: { type: "f", value: 0.0 },
      slider6: { type: "f", value: 0.0 },
      slider7: { type: "f", value: 0.0 },
    },
    fragmentShader: document.getElementById('fragShader1').innerHTML
  });
  quad = new THREE.Mesh(plane, finalMaterial);
  scene.add(quad);
}

//Initialize the Threejs scene
sceneSetup();

//Setup the frame buffer/texture we're going to be rendering to instead of the screen
videoTextureSetup();

bufferTextureSetup();


function render() {

  requestAnimationFrame(render);

  //Draw to textureB
  renderer.render(bufferScene, camera, textureB, true);

  //Swap textureA and B
  var t = textureA;
  textureA = textureB;
  textureB = t;
  quad.material.map = textureB.texture;
  bufferMaterial.uniforms.bufferTexture.value = textureA.texture;
  finalMaterial.uniforms.videoTexture.value = textureB.texture;

  //Update time
  bufferMaterial.uniforms.time.value += 0.01;
  for (let i in sliderValues) {
    bufferMaterial.uniforms['slider' + i].value = sliderValues[i] * 0.001;
    finalMaterial.uniforms['slider' + i].value = sliderValues[i] * 0.001;
  }

  //Finally, draw to the screen
  renderer.render(scene, camera);
}
render();

// create a keyboard
var keyboard = new AudioKeys();

keyboard.down(function (note) {
  // do things with the note object
  console.log(note)
  const f = note.frequency/4;
  document.getElementById('slide' + 0).value = f;
  socket.emit('slide', { id: 0, val: f });
  sliderValues[0] = f;
});

keyboard.up(function (note) {
  // do things with the note object
});

