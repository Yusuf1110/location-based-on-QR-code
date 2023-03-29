<script setup>
import DrawPosition from './components/DrawPosition.vue';
import { reactive, onBeforeUnmount, onMounted } from 'vue';
import { BrowserCodeReader, BrowserQRCodeReader } from '@zxing/browser';
import { POS1 } from 'js-aruco';
import * as THREE from "three";

//绘制扫描到的二维码
var ctx = null

onMounted(() => {
  const canvas = document.getElementById('qr_mark')
  ctx = canvas.getContext('2d');
})

const state = reactive({
  postion: {},
  canvas: {
    height: null,
    width: null
  }
})

// 创建three变量
var scene = null, camera = null, renderer = null

//create three object
function initThreeObject() {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(75, state.canvas.width / state.canvas.height, 0.1, 1000)
  camera.position.set(0, 0, 20)
  renderer = new THREE.WebGLRenderer();
  scene.add(camera)

  const object = new THREE.Object3D(),
    geometry = new THREE.SphereGeometry(0.5, 15, 15, Math.PI),
    material = new THREE.MeshBasicMaterial({ color: 0xff0000}),
    mesh = new THREE.Mesh(geometry, material);
  object.add(mesh);

  scene.add(object)
}

function render() {
  renderer.clear()
  renderer.render(scene, camera)
}

//创建二维码识别器 
const codeReader = new BrowserQRCodeReader()
{
  codeReader.options.delayBetweenScanAttempts = 10
  codeReader.options.delayBetweenScanSuccess = 10
}

var controls = null

function showPostion(points) {
  ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
  for (let i = 0; i < points.length; i++) {
    ctx.fillStyle = "green"
    ctx.fillRect(points[i].x - 10, points[i].y - 10, 20, 20);
  }
}

function poseEstimate(points) {
  //通过zxing估计的大小并不准确
  // let modelSize = points[0].estimatedModuleSize * 10
  let posit = new POS1.Posit(30, state.canvas.width)
  for (let i = 0; i < points.length; ++i) {
    points[i].x = points[i].x - (state.canvas.width / 2);
    points[i].y = (state.canvas.height / 2) - points[i].y;
  }
  let pose = posit.pose(points)
  state.postion = pose.bestTranslation
}

async function startScan() {
  try {
    const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
    const deviceId = videoInputDevices[0].deviceId
    controls = await codeReader.decodeFromVideoDevice(deviceId, 'camera', (result) => {
      if (!state.canvas.width || !state.canvas.height) {
        state.canvas.height = document.getElementById("camera").offsetHeight
        state.canvas.width = document.getElementById("camera").offsetWidth
      }
      if (result) {
        showPostion(result.resultPoints)
        poseEstimate(result.resultPoints)
      }
    }
    );
  } catch (err) {
    console.error(err)
  }

}

function stopScan() {
  ctx.clearRect(0, 0, 1000, 1000)
  controls && controls.stop()
}

onBeforeUnmount(() => controls.stop())
</script>
 
<template>
  <div class="container">
    <input type="button" name="" id="start" @click="startScan" value="start">
    <input type="button" name="" id="stop" @click="stopScan" value="stop">
    <ul id="position">
      <li id="qr-x">x:{{ state.postion[0] }}</li>
      <li id="qr-y">y:{{ state.postion[1] }}</li>
      <li id="qr-Distance">Distance:{{ state.postion[2] }}</li>
    </ul>
    <div class="video-container">
      <canvas class="video-area" id="qr_mark" :width="state.canvas.width" :height="state.canvas.height"></canvas>
      <video class="video-area" id="camera"></video>
      <div id="core-mark"></div>
      <DrawPosition id="draw-position" :qr_x=state.postion[0] :qr_y=state.postion[1] :qr_z=state.postion[2]>
      </DrawPosition>
    </div>
  </div>
</template>
 
<style lang="scss" scoped>
#start,
#stop {
  width: 100px;
  height: 40px;
  background-color: rgb(143, 250, 141);
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-container {
  position: relative;
  width: 100%;
  min-width: 1300px;
  height: 100%;

  .video-area {}

  #qr_mark {
    position: absolute;
    z-index: 1;
  }

  #camera {
    // width: 1000px;
  }

  #core-mark {
    position: absolute;
    top: 230px;
    left: 310px;
    width: 20px;
    height: 20px;
    border-radius: 100px;
    background-color: red;
  }

  #draw-position {
    position: absolute;
    top: 0;
    right: 10px;
    margin: 0;
  }

}
</style>
