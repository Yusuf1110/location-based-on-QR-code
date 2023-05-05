<script setup>
import DrawPosition from './components/DrawPosition.vue';
import DrawPosture from './components/DrawPosture.vue';
import carRequest from '../apis/carControl';
import createWebcamQRScanner from '../utils/webCam.js'
import { reactive, onBeforeUnmount, onMounted } from 'vue';
import { POS1 } from 'js-aruco';

const QR_SIZE = 120


var componentGlobal = {
  canvas: null,
  canvasElement: null,
  scanControl: null,
}

const state = reactive({
  postion: {},
  rotation: [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ],
})

function drawLine(begin, end, color) {
  let canvas = componentGlobal.canvas
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

function drawPoint(point, color) {
  let canvas = componentGlobal.canvas
  canvas.beginPath();
  canvas.arc(point.x, point.y, 5, 0, 2 * Math.PI);
  canvas.fillStyle = color;
  canvas.fill();
}

function showPostion(location) {
  drawLine(location.topLeftCorner, location.topRightCorner, "#FF3B58");
  drawLine(location.topRightCorner, location.bottomRightCorner, "#FF3B58");
  drawLine(location.bottomRightCorner, location.bottomLeftCorner, "#FF3B58");
  drawLine(location.bottomLeftCorner, location.topLeftCorner, "#FF3B58")
  drawPoint(location.bottomLeftFinderPattern, "#2fffff");
  drawPoint(location.bottomRightAlignmentPattern, "#2fffff");
  drawPoint(location.topLeftFinderPattern, "#2fffff");
  drawPoint(location.topRightFinderPattern, "#2fffff");
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

  state.postion = pose.bestTranslation
  state.rotation = pose.bestRotation
}

function getQRInfoToDo(qrInfo) {
  let corners = [qrInfo.location.topLeftCorner, qrInfo.location.topRightCorner, qrInfo.location.bottomRightCorner, qrInfo.location.bottomLeftCorner]
  showPostion(qrInfo.location)
  poseEstimate(corners)
}

function init() {
  const canvasElement = document.getElementById('qr-mark')
  const canvas = canvasElement.getContext('2d');
  componentGlobal.canvasElement = canvasElement
  componentGlobal.canvas = canvas
  const webCamParams = {
    canvasElement,
    canvas,
    VIDEO_WIDTH: 1080,
    VIDEO_HEIGHT: 720,
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 360,
    getQRInfoToDo: getQRInfoToDo
  }
  createWebcamQRScanner(webCamParams)
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
      <canvas class="video-area" id="qr-mark"></canvas>
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

    #qr-mark {
      z-index: 10;
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