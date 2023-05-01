<script setup>
import * as THREE from "three";
import { onMounted } from 'vue';

var scene = null,
  camera = null,
  renderer = null,
  container = null,
  cube = null,
  light = null

const props = defineProps({
  rotation: {
    type: Array,
    default: () =>
      [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]
  }
})

function initThree() {
  // 拿到dom容器
  {
    container = document.getElementById("posture-space");
  }

  // 创建场景
  {
    scene = new THREE.Scene();

  }

  // 创建相机
  {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
  }

  // 创建渲染器
  {
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.render(scene, camera);
  }

  // 创建正方形的几何体
  {
    const geometry = new THREE.PlaneGeometry(3, 3);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
  }

  //创建灯光
  {
    light = new THREE.AmbientLight(0xffffff, 0.5); // 使用环境光作为示例
    scene.add(light)
  }
  // 将正方形添加到场景中
  {
    scene.add(cube);
  }
}

// 动画函数
function animate() {
  requestAnimationFrame(animate);
  let rotation = props.rotation
  // 通过改变传入的参数来修改正方形的3D姿态
  cube.rotation.x = -Math.asin(-rotation[1][2]);
  cube.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
  cube.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);
  renderer.render(scene, camera);
}

onMounted(() => {
  initThree()
  animate()
})

</script>
 
<template>
  <div class="draw-posture-container">
    <canvas id="posture-space" width="480" height="360"></canvas>
  </div>
</template>
 
<style scoped></style>