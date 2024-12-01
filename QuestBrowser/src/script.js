import * as THREE from "three";
import {TubePainter} from "three/examples/jsm/misc/TubePainter.js";
import {XRButton} from "three/examples/jsm/webxr/XRButton.js";
import {XRControllerModelFactory} from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";


let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let stylus;
let painter1;
let gamepad1;
let isDrawing = false;
let prevIsDrawing = false;

const material = new THREE.MeshNormalMaterial({
  flatShading: true,
  side: THREE.DoubleSide,
});

const cursor = new THREE.Vector3();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
let socket;
init();


function init() {
  const canvas = document.querySelector("canvas.webgl");
  socket = new WebSocket("wss://dog-comic-easily.ngrok-free.app");
  socket.onopen = () => {
    console.log("Socket connected");
  };

  socket.onerror = (error) => {
    console.error("Error in WebSocket:", error);
  };

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
  camera.position.set(0, 1.6, 3);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  const grid = new THREE.GridHelper(4, 1, 0x111111, 0x111111);
  scene.add(grid);

  scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));

  const light = new THREE.DirectionalLight(0xffffff, 1.5);
  light.position.set(0, 4, 0);
  scene.add(light);

  painter1 = new TubePainter();
  painter1.mesh.material = material;
  painter1.setSize(0.1);

  scene.add(painter1.mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio, 2);
  renderer.setSize(sizes.width, sizes.height);
  renderer.setAnimationLoop(animate);
  renderer.xr.enabled = true;
  document.body.appendChild(XRButton.createButton(renderer, { optionalFeatures: ["unbounded"] }));

  const controllerModelFactory = new XRControllerModelFactory();

  controller1 = renderer.xr.getController(0);
  controller1.addEventListener("connected", onControllerConnected);
  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
  scene.add(controllerGrip1);
  scene.add(controller1);

  controller2 = renderer.xr.getController(1);
  controller2.addEventListener("connected", onControllerConnected);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
  scene.add(controllerGrip2);
  scene.add(controller2);

}

socket.onmessage = (event) => {
  socket.send("Message received from server");
  try {
    const data = JSON.parse(event.data);
    socket.send("Received data");
    updateMesh(data);
  } catch (error) {
    socket.send("Error parsing data");
  }
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

function animate() {
  if (gamepad1) {
    prevIsDrawing = isDrawing;
    isDrawing = gamepad1.buttons[5].value > 0;
    // debugGamepad(gamepad1);

    if (isDrawing && !prevIsDrawing) {
      const painter = stylus.userData.painter;
      painter.moveTo(stylus.position);
    }
  }

  handleDrawing(stylus);

  renderer.render(scene, camera);
}

let lastMeshState = null;
const tolerance = 0.001;

function calculateMinMax(vertices) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < vertices.length; i += 3) {
    min[0] = Math.min(min[0], vertices[i]);
    min[1] = Math.min(min[1], vertices[i + 1]);
    min[2] = Math.min(min[2], vertices[i + 2]);

    max[0] = Math.max(max[0], vertices[i]);
    max[1] = Math.max(max[1], vertices[i + 1]);
    max[2] = Math.max(max[2], vertices[i + 2]);
  }

  return { min, max };
}

function centerVertices(vertices, min, max) {
  const centerX = (min[0] + max[0]) / 2;
  const centerY = (min[1] + max[1]) / 2;
  const centerZ = (min[2] + max[2]) / 2;

  return vertices.map((v, index) => {
    if (index % 3 === 0) return v - centerX;     // X
    if (index % 3 === 1) return v - centerY;     // Y
    if (index % 3 === 2) return v - centerZ;     // Z
    return v;
  });
}

function handleDrawing(controller) {
  if (!controller) return;

  const userData = controller.userData;
  const painter = userData.painter;

  if (gamepad1) {
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);

    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();

      const geometry = painter.mesh.geometry;
      const positions = geometry.attributes.position.array;

      const filteredVertices = Array.from(positions).filter(value => Math.abs(value) > tolerance);

      if (!lastMeshState || hasSignificantChange(filteredVertices, lastMeshState)) {
        const { min, max } = calculateMinMax(filteredVertices);

        const centeredVertices = centerVertices(filteredVertices, min, max);

        const gltfData = {
          asset: {
            version: "2.0",
            generator: "CustomPainterExporter"
          },
          scenes: [
            {
              nodes: [0]
            }
          ],
          nodes: [
            {
              mesh: 0
            }
          ],
          meshes: [
            {
              primitives: [
                {
                  attributes: {
                    POSITION: 0
                  }
                }
              ]
            }
          ],
          accessors: [
            {
              bufferView: 0,
              componentType: 5126, // FLOAT
              count: centeredVertices.length / 3,
              type: "VEC3",
              min: min,
              max: max
            }
          ],
          bufferViews: [
            {
              buffer: 0,
              byteOffset: 0,
              byteLength: centeredVertices.length * 4
            }
          ],
          buffers: [
            {
              byteLength: centeredVertices.length * 4,
              uri: `data:application/octet-stream;base64,${btoa(
                  new Uint8Array(new Float32Array(centeredVertices).buffer).reduce(
                      (data, byte) => data + String.fromCharCode(byte),
                      ""
                  )
              )}`
            }
          ]
        };

        const gltfString = JSON.stringify(gltfData);

        socket.send(gltfString);

        lastMeshState = centeredVertices;
      }
    }
  }
}

function updateMesh(data) {
  const loader = new GLTFLoader();

  if (typeof data === 'string') {
    loader.parse(data, '', (gltf) => {
      const newMesh = gltf.scene.children[0];

      if (painter1.mesh) {
        scene.remove(painter1.mesh);
      }
      painter1.mesh = newMesh;
      socket.send("Mesh updated");
      scene.add(painter1.mesh);
      painter1.update();
    });
  }
  else {
    console.error('Received data is not valid GLTF data');
  }
}
function hasSignificantChange(currentVertices, lastVertices) {
  if (currentVertices.length !== lastVertices.length) {
    return true;
  }

  for (let i = 0; i < currentVertices.length; i++) {
    if (Math.abs(currentVertices[i] - lastVertices[i]) > tolerance) {
      return true;
    }
  }

  return false;
}

function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = painter1;
    gamepad1 = e.data.gamepad;
  }
}

function onSelectStart(e) {
  if (e.target !== stylus) return;
  const painter = stylus.userData.painter;
  painter.moveTo(stylus.position);
  this.userData.isSelecting = true;
}

function onSelectEnd() {
  this.userData.isSelecting = false;
}

function debugGamepad(gamepad) {
  gamepad.buttons.forEach((btn, index) => {
    if (btn.pressed) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }

    if (btn.touched) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }
  });
}
