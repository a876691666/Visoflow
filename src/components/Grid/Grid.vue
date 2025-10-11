<template>
  <div
    class="grid-component"
    :style="{
      width: '500000px',
      height: '500000px',
      position: 'absolute',
      left: '-250072px',
      top: '-250000px'
    }"
  >
    <div
      ref="gridElement"
      class="grid-background"
      :style="{
        transform: transform,
        transformOrigin: 'center',
        background: `repeat url('${gridTileSvg}')`,
        backgroundSize: backgroundSize
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { gsap } from 'gsap';
import { ProjectionOrientationEnum } from 'src/types';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { GSAP_ZOOM_CONFIG } from 'src/config';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { getIsoMatrix } from 'src/utils';

const generateBackground = (style: any) => {
  // 如果传入了背景图片，使用背景图片
  if (style.backgroundImage) {
    return style.backgroundImage;
  }

  // 否则生成SVG网格
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
      backgroundImage?: string;
      backgroundScale?: number; // 作为 style 子集配置
    };
  }>(),
  {}
);

const floorScaleLevel = ref<number>(1);
watch(
  () => props.style,
  (newStyle) => {
    const backgroundStyle = {
      fill: newStyle?.fill || 'none',
      stroke: newStyle?.stroke || '#000000',
      strokeOpacity: newStyle?.strokeOpacity ?? 0.15,
      strokeWidth: newStyle?.strokeWidth ?? 5,
      backgroundImage: newStyle?.backgroundImage
    };

    gridTileSvg.value = generateBackground(backgroundStyle);

    // 同步缩放档位自 style.backgroundScale
    if (typeof newStyle?.backgroundScale === 'number') {
      const lvl = Math.floor(newStyle.backgroundScale);
      floorScaleLevel.value = Math.max(1, Math.min(4, lvl));
    } else {
      floorScaleLevel.value = 1; // 默认
    }
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

// 地板缩放（1/2/3/4），用于控制背景网格尺寸 = level * 100px（从 GroundConfig 传入）

const backgroundSize = computed(
  () => `${floorScaleLevel.value * 100}px ${floorScaleLevel.value * 100}px`
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
