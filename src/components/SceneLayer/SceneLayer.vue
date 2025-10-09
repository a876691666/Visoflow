<template>
  <div
    ref="elementRef"
    class="scene-layer"
    :class="{ 'disable-animation': disableAnimation }"
    :style="{ zIndex: order }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { gsap } from 'gsap';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { GSAP_ZOOM_CONFIG } from 'src/config';

interface Props {
  disableAnimation?: boolean;
  order?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disableAnimation: false,
  order: 0
});

const elementRef = ref<HTMLDivElement>();
const isFirstRender = ref(true);

const uiStateStore = useIsoflowUiStateStore<any>();

// Read props.order to avoid unused variable warning and to allow reactive zIndex updates if needed later
watch(
  () => props.order,
  () => {},
  { immediate: true }
);

// 使用 ref 替代 computed - scroll 状态
const scroll = ref(uiStateStore.scroll);
watch(
  () => uiStateStore.scroll,
  (newScroll) => {
    scroll.value = newScroll;
  },
  { deep: true, immediate: true }
);

// 使用 ref 替代 computed - zoom 状态
const zoom = ref(uiStateStore.zoom);
watch(
  () => uiStateStore.zoom,
  (newZoom) => {
    zoom.value = newZoom;
  },
  { immediate: true }
);

// 监听滚动和缩放变化
watch(
  [scroll, zoom],
  () => {
    if (!elementRef.value) return;

    gsap.to(elementRef.value, {
      duration: GSAP_ZOOM_CONFIG.duration,
      ease: GSAP_ZOOM_CONFIG.ease,
      x: scroll.value.position.x,
      y: scroll.value.position.y,
      scale: zoom.value
    });

    if (isFirstRender.value) {
      isFirstRender.value = false;
    }
  },
  { deep: true }
);

onMounted(() => {
  // 确保初始渲染时应用变换
  nextTick(() => {
    if (!elementRef.value) return;

    gsap.set(elementRef.value, {
      x: scroll.value.position.x,
      y: scroll.value.position.y,
      scale: zoom.value
    });
  });
});
</script>

<style scoped>
.scene-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  user-select: none;
  /* pointer-events: none; */
}

.scene-layer.disable-animation {
  transition: none;
}

.scene-layer > * {
  /* pointer-events: auto; */
}
</style>
