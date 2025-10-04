<template>
  <div class="grid-component">
    <div ref="gridElement" class="grid-background" :style="gridStyle" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { gsap } from 'gsap';
import type { Size } from 'src/types';
import gridTileSvg from 'src/assets/grid-tile-bg.svg';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { PROJECTED_TILE_SIZE, GSAP_ZOOM_CONFIG } from 'src/config';
import { SizeUtils } from 'src/utils/SizeUtils';
import { useResizeObserver } from 'src/hooks/useResizeObserver';

const gridElement = ref<HTMLDivElement | null>(null);
const isFirstRender = ref(true);
const uiStateStore = useIsoflowUiStateStore<any>();

// 使用resize observer监听元素大小变化
const { size } = useResizeObserver(gridElement);

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

// 使用 ref 替代 computed - 网格样式
const gridStyle = ref({
  background: `repeat url("${gridTileSvg}")`
});

// 监听scroll、zoom和size变化，更新网格位置和大小
watch(
  [scroll, zoom, size],
  () => {
    if (!gridElement.value) return;

    const tileSize = SizeUtils.multiply(PROJECTED_TILE_SIZE, zoom.value);
    const elRect = gridElement.value.getBoundingClientRect();

    const backgroundPosition: Size = {
      width: elRect.width / 2 + scroll.value.position.x + tileSize.width / 2,
      height: elRect.height / 2 + scroll.value.position.y
    };

    gsap.to(gridElement.value, {
      duration: GSAP_ZOOM_CONFIG.duration,
      ease: GSAP_ZOOM_CONFIG.ease,
      backgroundSize: `${tileSize.width}px ${tileSize.height * 2}px`,
      backgroundPosition: `${backgroundPosition.width}px ${backgroundPosition.height}px`
    });

    if (isFirstRender.value) {
      isFirstRender.value = false;
    }
  },
  { deep: true }
);

onMounted(() => {
  console.log('Grid component mounted');
});
</script>

<style scoped>
.grid-component {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.grid-background {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
