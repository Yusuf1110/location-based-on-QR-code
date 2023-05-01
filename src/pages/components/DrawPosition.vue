<script setup>
import * as THREE from "three";
import { onMounted } from 'vue';
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

var scene = null,
  camera = null,
  renderer = null,
  container = null,
  light = null,
  cube_camera = null,
  cube_qr = null,
  axesHelper = null

// 初始化函数
function initThree() {
  // 拿到dom容器
  {
    container = document.getElementById("position-space")
  }

  // 创建场景
  {
    scene = new THREE.Scene();
  }

  // 创建相机
  {
    const fov = 75
    const aspect = 640 / 480
    const near = 0.1
    const far = 1000
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.set(0, 0, 20)
    scene.add(camera);
  }

  // 渲染器
  {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.render(scene, camera);
  }

  // 创建cube
  {
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial_red = new THREE.MeshBasicMaterial({ color: "#ff0000" });
    const cubeMaterial_green = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube_camera = new THREE.Mesh(cubeGeometry, cubeMaterial_red);
    cube_qr = new THREE.Mesh(cubeGeometry, cubeMaterial_green);
    scene.add(cube_camera);
    scene.add(cube_qr);
  }

  // 创建灯光
  {
    light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 2, 2);
    scene.add(light)
  }

  // 添加坐标轴辅助器
  {
    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
  }

  // 添加控制
  new OrbitControls(camera, renderer.domElement);
}

// 渲染函数
function animate() {
  cube_qr.position.x = props.qr_x / 10
  cube_qr.position.y = props.qr_y / 10
  cube_qr.position.z = props.qr_z / 100
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

onMounted(() => {
  initThree()
  animate()
})

</script>
 
<template>
  <div class="draw-position-container">
    <canvas id="position-space" width="480" height="360"></canvas>
  </div>
</template>
 
<style scoped lang="scss"></style>
