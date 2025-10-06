<template>
  <div
    class="grid-component"
    :style="{
      width: '50000px',
      height: '50000px',
      position: 'absolute',
      left: '-25072px',
      top: '-25000px'
    }"
  >
    <div
      ref="gridElement"
      class="grid-background"
      :style="{
        transform: transform,
        transformOrigin: 'center',
        background: `repeat url('${gridTileSvg}')`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { gsap } from 'gsap';
import { ProjectionOrientationEnum } from 'src/types';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { GSAP_ZOOM_CONFIG } from 'src/config';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { getIsoMatrix } from 'src/utils';

const generateBackground = (style: any) => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" >
  <g stroke="${style.stroke}" stroke-opacity="${style.strokeOpacity}" stroke-width="${style.strokeWidth}" stroke-alignment="center">
    <polyline points="0,0 100,0 100,100 0,100 0,0" fill="${style.fill}" />
    <line x2="100" />
    <line y2="100" />
    <line x1="100" y1="0" x2="100" y2="100" />
    <line x1="0" y1="100" x2="100" y2="100" />
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${btoa(svgString)}`; // 使用Base64编码
};

const gridTileSvg = ref();

const props = withDefaults(
  defineProps<{
    style?: {
      fill?: string;
      stroke?: string;
      strokeOpacity?: number;
      strokeWidth?: number;
    };
  }>(),
  {}
);

watch(
  () => props.style,
  (newStyle) => {
    gridTileSvg.value = generateBackground({
      fill: newStyle?.fill || 'none',
      stroke: newStyle?.stroke || '#000000',
      strokeOpacity: newStyle?.strokeOpacity ?? 0.15,
      strokeWidth: newStyle?.strokeWidth ?? 5
    });
  },
  { immediate: true }
);

const gridElement = ref<HTMLDivElement | null>(null);
const isFirstRender = ref(true);
const uiStateStore = useIsoflowUiStateStore<any>();

const transform = getIsoMatrix(ProjectionOrientationEnum.X);

const { size } = useResizeObserver(gridElement);

const scroll = ref(uiStateStore.scroll);
watch(
  () => uiStateStore.scroll,
  (newScroll) => {
    scroll.value = newScroll;
  },
  { deep: true, immediate: true }
);

const zoom = ref(uiStateStore.zoom);
watch(
  () => uiStateStore.zoom,
  (newZoom) => {
    zoom.value = newZoom;
  },
  { immediate: true }
);

watch(
  [scroll, zoom, size],
  () => {
    if (!gridElement.value) return;

    gsap.to(gridElement.value, {
      duration: GSAP_ZOOM_CONFIG.duration,
      ease: GSAP_ZOOM_CONFIG.ease
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
