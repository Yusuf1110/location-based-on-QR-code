<script setup>
import * as THREE from "three";
import { onMounted, defineProps } from 'vue';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const props = defineProps({
  qr_x: {
    type: Number,
    default: 0
  },
  qr_y: {
    type: Number,
    default: 0
  },
  qr_z: {
    type: Number,
    default: 0
  }
})
//创建场景
const scene = new THREE.Scene();

//创建相机
const fov = 75
const aspect = 640 / 480
const near = 0.1
const far = 1000
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(0, 0, 20)
scene.add(camera);

// 创建cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial_red = new THREE.MeshBasicMaterial({ color: "#ff0000" });
const cubeMaterial_green = new THREE.MeshBasicMaterial({ color: "#00ff00" });
const cube_camera = new THREE.Mesh(cubeGeometry, cubeMaterial_red);
const cube_qr = new THREE.Mesh(cubeGeometry, cubeMaterial_green);
cube_qr.position.z = 3
scene.add(cube_camera);
scene.add(cube_qr);

// 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function threeInit() {
  const canvas = document.getElementById("positionSpace")
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.render(scene, camera);

  //添加控制
  new OrbitControls(camera, renderer.domElement);

  //渲染函数
  function render() {
    cube_qr.position.x = props.qr_x / 10
    cube_qr.position.y = props.qr_y / 10
    cube_qr.position.z = props.qr_z / 100

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}
onMounted(() => {
  threeInit()
})

</script>
 
<template>
  <div class="container">
    <canvas id="positionSpace" width="640" height="480"></canvas>
  </div>
</template>
 
<style scoped lang="scss">
.container {
  width: 640px;
  height: 480px;
}
</style>