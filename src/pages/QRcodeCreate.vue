<script setup>
import { onMounted, ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
const qrSize = 350
const qrValue = ref("")
function downloadQRCode() {
  const canvas = document.querySelector(".qr-canvas")
  const imgData = canvas.toDataURL("image/png");
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = imgData;
  link.click();
}

// create a QRcode chage the value of qrValue
function createQRcode() {
  qrValue.value = "https://www.baidu.com"
}

onMounted(() => {
})
</script>
 
<template>
  <div class="qr-code-create">
    <main class="container">
      <div id="qr-code">
        <qrcode-vue class="qr-canvas" :value="qrValue" :size="qrSize" level="H" render-as="canvas" margin=1></qrcode-vue>
      </div>
      <div class="control">
        <button class="control-button" id="create" @click="createQRcode">生成qr码</button>
        <button class="control-button" id="download" @click="downloadQRCode">下载qr码</button>
      </div>
    </main>
  </div>
</template>
 
<style scoped lang="scss">
.qr-code-create {
  width: 100vw;
  height: 100vh;
  position: relative;

  .container {
    width: 400px;
    height: 470px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);

    #qr-code {
      box-sizing: border-box;
      width: 400px;
      height: 400px;
      border-radius: 50px;
      background: #ffffff;
      box-shadow: 20px 20px 60px #d9d9d9,
        -20px -20px 60px #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .control {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 20px 10px 0 10px
    }

    .control-button {
      flex: 1;
      border: none;
      height: 40px;
      border-radius: 50px;
      background: linear-gradient(145deg, #9bff9a, #83e082);
      box-shadow: 5px 5px 11px #6dbb6c,
        -5px -5px 11px #b5ffb4;
      cursor: pointer;
    }

    .control-button:hover {
      background: linear-gradient(145deg, #ffe19a, #e0c782);
      box-shadow: 5px 5px 11px #bbae6c,
        -5px -5px 11px #fff9b4;
      cursor: pointer;
    }

    .control-button:active {
      transform: scale(90%);
    }


    #download {
      margin-left: 50px;
    }
  }
}
</style>