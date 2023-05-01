<script setup>
import DrawPosition from './components/DrawPosition.vue';
import DrawPosture from './components/DrawPosture.vue';
import carRequest from '../apis/carControl';
import { reactive, onBeforeUnmount, onMounted } from 'vue';
import { BrowserQRCodeReader } from '@zxing/browser';
import { POS1 } from 'js-aruco';

const
  VIDEO_WIDTH = 1080,
  VIDEO_HEIGHT = 1920,
  CANVAS_WIDTH = 480,
  CANVAS_HEIGHT = 360,
  CANVAS_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT,
  QR_SIZE = 60


var componentGlobal = {
  ctxMark: null,
  ctxAndVideoWidthRate: null,
  ctxAndVideoHeightRate: null,
  videoHeight: null,
  videoWidth: null,
  video: null,
  scanControl: null,
}

const state = reactive({
  postion: {},
  rotation: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
  canvas: {
    width: null,
    height: null,
  }
})

//创建二维码识别器 
const codeReader = new BrowserQRCodeReader()
{
  codeReader.options.delayBetweenScanAttempts = 10
  codeReader.options.delayBetweenScanSuccess = 10
}

function showPostion(points) {
  const { ctxMark, ctxAndVideoWidthRate, ctxAndVideoHeightRate } = componentGlobal
  ctxMark.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  let cornerX = null, cornerY = null
  for (let i = 0; i < points.length; i++) {
    cornerX = points[i].x * ctxAndVideoWidthRate - 10
    cornerY = points[i].y * ctxAndVideoHeightRate - 10
    ctxMark.fillStyle = "green"
    ctxMark.fillRect(cornerX, cornerY, 20, 20);
  }
}

function poseEstimate(points) {
  const { videoWidth, videoHeight } = componentGlobal
  // let modelSize = points[0].estimatedModuleSize * 10
  // const len1 = 415
  // const len2 = 830
  // const len3 = 1245
  for (let i = 0; i < points.length; ++i) {
    points[i].x = points[i].x - (videoWidth / 2);
    points[i].y = (videoHeight / 2) - points[i].y;
  }

  let posit = new POS1.Posit(QR_SIZE, videoWidth)

  let pose = posit.pose(points)

  state.postion = pose.bestTranslation
  state.rotation = pose.bestRotation
  console.log(pose)
}

async function startScan() {
  componentGlobal.scanControl = await codeReader.decodeFromVideoElement(componentGlobal.video, (res) => {
    if (res) {
      showPostion(res.resultPoints)
      poseEstimate(res.resultPoints)
    }
  });
}

function videoToCanvasCorrectSize(stream) {
  let track = stream.getVideoTracks();
  let videoHeight = track[0].getSettings().height
  let videoWidth = track[0].getSettings().width
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    [videoHeight, videoWidth] = [videoWidth, videoHeight]
  }
  let ctxHeight = null
  let ctxWidth = null
  let videoRatio = videoWidth / videoHeight
  if (videoRatio > CANVAS_RATIO) {
    ctxWidth = CANVAS_WIDTH
    ctxHeight = videoHeight * (CANVAS_WIDTH / videoWidth)
  } else {
    ctxHeight = CANVAS_HEIGHT
    ctxWidth = videoWidth * (CANVAS_HEIGHT / videoHeight)
  }
  state.canvas.width = ctxWidth
  state.canvas.height = ctxHeight
  componentGlobal.videoHeight = videoHeight
  componentGlobal.videoWidth = videoWidth
  componentGlobal.ctxAndVideoWidthRate = ctxWidth / videoWidth
  componentGlobal.ctxAndVideoHeightRate = ctxHeight / videoHeight

  alert("videoHeight: " + videoHeight + " videoWidth: " + videoWidth + " realCanvasHeight: " + ctxHeight + " realCanvasWidth: " + ctxWidth)

}

async function createVideoStream() {

  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
  }
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }

      return new Promise(function (resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  try {
    const container = {
      video: {
        height: VIDEO_HEIGHT,
        width: VIDEO_WIDTH,
        facingMode: 'environment',
      },
    }
    let stream = await navigator.mediaDevices.getUserMedia(container)

    if ("srcObject" in componentGlobal.video) {
      componentGlobal.video.srcObject = stream;
      videoToCanvasCorrectSize(stream)
    } else {
      componentGlobal.video.src = window.URL.createObjectURL(stream);
    }
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}

function stopScan() {
  const { ctxMark, scanControl } = componentGlobal
  ctxMark.clearRect(0, 0, 1000, 1000)
  scanControl && scanControl.stop()
}

function init() {
  componentGlobal.video = document.getElementById('camera')

  const canvasOfMark = document.getElementById('qr-mark')
  componentGlobal.ctxMark = canvasOfMark.getContext('2d');
  createVideoStream()
}

const carControls = {
  forward: {
    id: "forward",
    value: "前进",
  },
  backward: {
    id: "backward",
    value: "后退",
  },
  left: {
    id: "left",
    value: "左转",
  },
  right: {
    id: "right",
    value: "右转",
  },
  stop: {
    id: "stop",
    value: "停止",
  },
  leftAround: {
    id: "left-around",
    value: "左旋转",
  },
  rightAround: {
    id: "right-around",
    value: "右旋转"
  },
}

function carRun(target) {
  let { tagName, id } = target.target
  if (tagName === 'BUTTON') {
    carRequest.run(id)
  }
}

function carStop(target) {
  let { tagName, id } = target.target
  if (tagName === 'BUTTON') {
    carRequest.stop(id)
  }
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => componentGlobal.scanControl.stop())
</script>
 
<template>
  <main class="car-location-view-container">
    <div class="content" id="control">
      <div class="control-scan">
        <input type="button" class="control-btn" id="scan-start" @click="startScan" value="start">
        <input type="button" class="control-btn" id="scan-stop" @click="stopScan" value="stop">
      </div>
      <div class="control-car" @mousedown.stop="(target) => carRun(target)" @mouseup.stop="(target) => carStop(target)"
        @touchstart="(target) => carRun(target)" @touchend="(target) => carStop(target)">
        <button v-for="item in carControls" :id="item.id" class="control-btn" :key="item.id">{{
          item.value }}</button>
      </div>
      <ul id="position">
        <li id="qr-x">x:{{ state.postion[0] }}</li>
        <li id="qr-y">y:{{ state.postion[1] }}</li>
        <li id="qr-Distance">Distance:{{ state.postion[2] }}</li>
      </ul>
    </div>
    <div class="content" id="scan">
      <canvas class="video-area" id="qr-mark" :width="state.canvas.width" :height="state.canvas.height"></canvas>
      <video class="video-area" autoplay=true id="camera" :width="CANVAS_WIDTH" :height="CANVAS_HEIGHT"></video>
    </div>
    <div class="content" id="draw-route">
      <DrawPosture :rotation=state.rotation></DrawPosture>
    </div>
    <div class="content" id="draw-position">
      <DrawPosition :qr_x=state.postion[0] :qr_y=state.postion[1] :qr_z=state.postion[2]>
      </DrawPosition>
    </div>
  </main>
</template>
 
<style lang="scss" scoped >
.car-location-view-container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-gap: 50px 50px;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  justify-content: center;

  .content {
    height: 360px;
    width: 480px;
    background-color: rgb(255, 255, 255);
  }

  #control {

    .control-btn {
      width: 100px;
      height: 40px;
      background-color: rgb(143, 250, 141);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .control-car {
      #forward {
        grid-area: forward;
      }

      #backward {
        grid-area: backward;
      }

      #left {
        grid-area: left;
      }

      #right {
        grid-area: right;
      }

      #stop {
        grid-area: stop;
      }

      #left-around {
        grid-area: left-around;
      }

      #right-around {
        grid-area: right-around;
      }

      display: grid;
      grid-gap: 10px 10px;
      grid-template-areas: ' . forward .'
      'left stop right'
      'left-around backward right-around';
      justify-content: center;
      align-items: center;
      -webkit-touch-callout:none;
      /*系统默认菜单被禁用*/
      -webkit-user-select:none;
      /*webkit浏览器*/
      -khtml-user-select:none;
      /*早期浏览器*/
      -moz-user-select:none;
      /*火狐*/
      -ms-user-select:none;
      /*IE10*/
      user-select:none;
    }

  }

  #scan {
    position: relative;

    .video-area {
      position: absolute;
      top: 0;
      left: 0;

    }

    #camera {}

    #qr-mark {
      z-index: 1;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  #draw-route {}

  #draw-position {}
}

@media screen and (max-width: 960px) {
  .car-location-view-container {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto auto;
    grid-gap: 0px 0px;

    .content {
      transform: scale(0.8);
    }
  }
}
</style>