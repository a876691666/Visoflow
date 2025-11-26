<template>
  <div class="connectors-three-layer">
    <canvas ref="canvas" class="gl-canvas" />
    <slot v-if="inited" />
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  shallowRef,
  onMounted,
  onBeforeUnmount,
  watch,
  markRaw,
  provide
} from 'vue';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  Color,
  Vector3,
  Group
} from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { gsap } from 'gsap';
import { GSAP_ZOOM_CONFIG } from 'src/config';

const canvas = ref<HTMLCanvasElement | null>(null);
let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: OrthographicCamera | null = null;
let mesh: Mesh | null = null;
let rafId = 0;
let controls: MapControls | null = null;

const group = shallowRef<Group | null>(markRaw(new Group()));
group.value!.rotation.y = Math.PI / 2;
group.value!.rotation.x = Math.PI;
const inited = ref(false);

const loopMap = new Map<string, () => void>();
const registerLoop = (id: string, fn: () => void) => {
  loopMap.set(id, fn);
};
const unregisterLoop = (id: string) => {
  loopMap.delete(id);
};

// 将 group 通过 provide 注入给子组件
provide('threeGroup', { group, registerLoop, unregisterLoop });

const uiState = useIsoflowUiStateStore<any>();

const current = {
  zoom: uiState.zoom,
  scrollX: uiState.scroll?.position?.x || 0,
  scrollY: uiState.scroll?.position?.y || 0
};

watch(
  [() => uiState.zoom, () => uiState.scroll?.position],
  () => {
    if (camera) {
      gsap.to(current, {
        duration: GSAP_ZOOM_CONFIG.duration,
        ease: GSAP_ZOOM_CONFIG.ease,
        zoom: uiState.zoom,
        scrollX: uiState.scroll?.position?.x || 0,
        scrollY: uiState.scroll?.position?.y || 0,
        onUpdate: () => {
          updateCameraPosition(current.zoom, current.scrollX, current.scrollY);
        }
      });
    }
  },
  { immediate: true, deep: true }
);

const updateCameraPosition = (zoom: number, x: number, y: number) => {
  if (!camera || !controls) return;
  const _zoom = zoom / 1;

  const pivot = new Vector3(0, 0, 0);

  const direction = new Vector3();
  camera.getWorldDirection(direction);

  const right = direction.clone().cross(camera.up).normalize();

  const translation = right.multiplyScalar(-x / _zoom);

  const baseOffset = new Vector3(10000, 10000, 10000);

  const yOffset = -y / _zoom;
  const offsetValue = yOffset / 0.817;
  const verticalOffset = new Vector3(offsetValue, 0, offsetValue);

  const targetPosition = baseOffset
    .clone()
    .add(verticalOffset)
    .add(translation);
  const targetLookAt = pivot.clone().add(verticalOffset).add(translation);

  camera.position.copy(targetPosition);
  controls.target.copy(targetLookAt);
  camera.zoom = _zoom;

  controls.update();
  camera?.updateProjectionMatrix();
};

function resize() {
  if (!canvas.value || !renderer || !camera) return;
  const rect = canvas.value.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  camera.left = -width / 2;
  camera.right = width / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();
}

function initThree() {
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();

  renderer = new WebGLRenderer({
    canvas: canvas.value,
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new Color(0x000000), 0); // 透明
  renderer.setSize(rect.width, rect.height, false);

  scene = new Scene();

  scene.add(group.value!);

  const halfHeight = rect.height / 2;
  const halfWidth = rect.width / 2;
  camera = new OrthographicCamera(
    -halfWidth,
    halfWidth,
    halfHeight,
    -halfHeight,
    0.001,
    50000
  );

  camera.position.set(10000, 10000, 10000);
  camera.lookAt(0, 0, 0);
  camera.zoom = 1;

  if (renderer && camera) {
    controls = new MapControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.enableZoom = true;

    controls.target.set(0, 0, 0);
  }

  resize();
  startLoop();
}

function draw() {
  if (!renderer || !scene || !camera) return;
  renderer.render(scene, camera);
}

function loop() {
  loopMap.forEach((fn) => fn());
  draw();
  rafId = requestAnimationFrame(loop);
}

function startLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
}

onMounted(() => {
  initThree();
  window.addEventListener('resize', resize);
  inited.value = true;
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener('resize', resize);

  if (mesh) {
    // Dispose geometry & material
    // @ts-ignore
    if (mesh.geometry && mesh.geometry.dispose) mesh.geometry.dispose();
    // @ts-ignore
    if (mesh.material) {
      // material may be an array in some cases
      // @ts-ignore
      if (Array.isArray(mesh.material)) {
        // @ts-ignore
        mesh.material.forEach((m) => m.dispose && m.dispose());
      } else {
        // @ts-ignore
        mesh.material.dispose && mesh.material.dispose();
      }
    }
    scene && scene.remove(mesh);
    mesh = null;
  }

  if (renderer) {
    renderer.forceContextLoss && renderer.forceContextLoss();
    renderer.dispose();
    // remove canvas buffer sizes
    if (canvas.value) {
      canvas.value.width = 0;
      canvas.value.height = 0;
    }
    renderer = null;
  }

  // 清理 controls
  if (controls) {
    controls.dispose();
    controls = null;
  }

  scene = null;
  camera = null;
});
</script>
<style scoped>
.connectors-three-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.gl-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>
