<script setup>
import { reactive, onBeforeUnmount, onMounted } from 'vue';
import { BrowserCodeReader, BrowserQRCodeReader } from '@zxing/browser';
import { POS1 } from 'js-aruco';

var ctx = null
// const videoLen = 'inherit', videoWid = 500;

onMounted(() => {
  const canvas = document.getElementById('canvas')
  console.log(canvas)
  ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FF0000';

})

const state = reactive({
  postion: {}
})
const codeReader = new BrowserQRCodeReader()
var controls = null
console.log(codeReader)

function showPostion(points) {
  ctx.clearRect(0, 0, 649, 640)
  for (let i = 0; i < points.length; i++) {
    ctx.fillRect(points[i].x - 10, points[i].y - 10, 20, 20);
  }
}

function poseEstimate(points, canvasWidth) {
  let modelSize = points[0].estimatedModuleSize * 10
  let posit = new POS1.Posit(modelSize, canvasWidth)
  let pose = posit.pose(points)
  state.postion = pose.bestTranslation
  console.log(state.postion)
}

async function startScan() {
  try {
    const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
    const selectedDeviceId = videoInputDevices[0].deviceId
    console.log(codeReader)
    controls = await codeReader.decodeFromVideoDevice(selectedDeviceId, 'camera', (result) => {
      if (result) {
        showPostion(result.resultPoints)
        poseEstimate(result.resultPoints, 640)
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
  <div>
    <input type="button" name="" id="start" @click="startScan" value="start">
    <input type="button" name="" id="stop" @click="stopScan" value="stop">
    <ul id="position">
      <li id="qr-x">x:{{ state.postion[0] }}</li>
      <li id="qr-y">y:{{ state.postion[1] }}</li>
      <li id="qr-Distance">Distance:{{ state.postion[2] }}</li>
    </ul>
    <div class="video-container">
      <canvas class="video-area" id="canvas" width="640" height="640"></canvas>
      <video class="video-area" id="camera"></video>
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
  width: auto;
  // height: 500px;

  .video-area {}

  #canvas {
    position: absolute;
    z-index: 1;
  }

  #camera {
    // width: 1000px;
  }
}
</style>
