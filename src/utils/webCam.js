import jsQR from "jsqr";

//组公用变量
var
  video = null,
  canvas = null,
  canvasElement = null,
  getQRInfoToDo = null,
  VIDEO_HEIGHT = null,
  VIDEO_WIDTH = null,
  CANVAS_HEIGHT = null,
  CANVAS_WIDTH = null

//组件变量赋值，初始化
async function createWebcamQRScanner(state = {
  canvasElement: null,
  canvas: null,
  VIDEO_WIDTH: null,
  VIDEO_HEIGHT: null,
  CANVAS_WIDTH: null,
  CANVAS_HEIGHT: null,
  getQRInfoToDo: null
}) {
  video = document.createElement("video")
  canvas = state.canvas
  canvasElement = state.canvasElement
  getQRInfoToDo = state.getQRInfoToDo
  VIDEO_HEIGHT = state.VIDEO_HEIGHT
  VIDEO_WIDTH = state.VIDEO_WIDTH
  CANVAS_HEIGHT = state.CANVAS_HEIGHT
  CANVAS_WIDTH = state.CANVAS_WIDTH

  return await createVideoStream()
}

//根据视频流的宽高，计算canvas的宽高
function videoToCanvasCorrectSize({
  stream,
  canvasElement,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
}) {
  const CANVAS_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT
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
  canvasElement.width = ctxWidth
  canvasElement.height = ctxHeight
}

//创建视频流
async function createVideoStream() {
  try {
    const container = {
      video: {
        height: VIDEO_HEIGHT,
        width: VIDEO_WIDTH,
        facingMode: 'environment',
      },
    }
    let stream = await navigator.mediaDevices.getUserMedia(container)
    video.srcObject = stream
    video.play()
    videoToCanvasCorrectSize({ stream, canvasElement, CANVAS_WIDTH, CANVAS_HEIGHT })
    requestAnimationFrame(tick)
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}

function tick() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvas.getImageData(0, 0, video.videoWidth, video.videoHeight);
    const qrInfo = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (qrInfo) {
      getQRInfoToDo(qrInfo)
    }
  }
  requestAnimationFrame(tick);
}

export default createWebcamQRScanner