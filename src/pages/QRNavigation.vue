<script setup>
import createWebcamQRScanner from '../utils/webCam.js'
import * as THREE from "three";
import { onMounted } from 'vue';
import { POS1 } from 'js-aruco';

const QR_SIZE = 90

const componentGlobal = {
  canvas: null,
  canvasElement: null,
}

// 创建three变量
var threeObj = {
  scene: null,
  camera: null,
  renderer: null,
  video: null,
  model: null
}

function ARinit() {
  let threeContainer = document.getElementById("three-container")
  let canvasElement = document.getElementById("scanner-cam")
  console.log(canvasElement)
  //创建场景
  {
    threeObj.scene = new THREE.Scene()
  }
  //创建相机
  {
    threeObj.camera = new THREE.PerspectiveCamera(40, canvasElement.width / canvasElement.height, 0.1, 1000)
  }
  //创建渲染器
  {
    threeObj.renderer = new THREE.WebGLRenderer();
    threeObj.renderer.setClearColor(0xffffff, 0);
    threeObj.renderer.setSize(canvasElement.width, canvasElement.height);
    threeContainer.appendChild(threeObj.renderer.domElement);
    threeObj.scene.add(threeObj.camera)
  }
  //创建模型
  {
    threeObj.model = createObject()
    threeObj.scene.add(threeObj.model)
  }
}

// 创建模型
function createObject() {
  const object = new THREE.Object3D(),
    geometry = new THREE.SphereGeometry(0.5, 90, 90, Math.PI),
    material = new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    mesh = new THREE.Mesh(geometry, material);
  object.add(mesh);
  return object
}

function updateObject(object, rotation, translation) {
  console.log(object)
  object.scale.x = QR_SIZE;
  object.scale.y = QR_SIZE;
  object.scale.z = QR_SIZE;

  object.rotation.x = -Math.asin(-rotation[1][2]);
  object.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
  object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

  object.position.x = translation[0];
  object.position.y = translation[1];
  object.position.z = -translation[2];
}

function poseEstimate(points) {
  const { canvasElement } = componentGlobal
  const width = canvasElement.width
  const height = canvasElement.height

  for (let i = 0; i < points.length; ++i) {
    points[i].x = points[i].x - (width / 2);
    points[i].y = (height / 2) - points[i].y;
  }

  let posit = new POS1.Posit(QR_SIZE, width)

  let pose = posit.pose(points)

  return pose
}

function updateThree(points) {
  const pose = poseEstimate(points)
  const translation = pose.bestTranslation
  const rotation = pose.bestRotation
  
  let { scene, camera, renderer, model } = threeObj

  updateObject(model, rotation, translation)

  renderer.autoClear = false;
  renderer.clear()
  renderer.render(scene, camera)
}

function getQRInfoToDo(qrInfo) {
  let corners = [qrInfo.location.topLeftCorner, qrInfo.location.topRightCorner, qrInfo.location.bottomRightCorner, qrInfo.location.bottomLeftCorner]
  updateThree(corners)
}

function scannerInit() {
  const { canvasElement, canvas } = componentGlobal
  const webCamParams = {
    canvasElement,
    canvas,
    VIDEO_WIDTH: 1080,
    VIDEO_HEIGHT: 720,
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 360,
    getQRInfoToDo: getQRInfoToDo
  }
  createWebcamQRScanner(webCamParams).then(() => {
    ARinit()
  })

}

onMounted(() => {
  const canvasElement = document.getElementById('scanner-cam')
  const canvas = canvasElement.getContext('2d')
  componentGlobal.canvasElement = canvasElement
  componentGlobal.canvas = canvas
  scannerInit()
})
</script>
 
<template>
  <div class="qr-navigation-container">
    <main class="scanner-container">
      <canvas id="scanner-cam"></canvas>
      <div id="three-container"></div>
    </main>
    <div class="destination-options-container"></div>
    <div class="map-container"></div>
  </div>
</template>
 
<style scoped lang="scss">
.qr-navigation-container {
  .scanner-container {
    position: relative;

    #scanner-cam {
      position: absolute;
      top: 0;
      left: 0;
    }

    #three-container {
      z-index: 10;
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
</style>