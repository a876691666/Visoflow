<template>
  <div class="lasso-container" :style="containerStyles">
    <svg
      class="lasso-svg"
      :style="svgStyles"
      :viewBox="`0 0 ${viewboxSize.width} ${viewboxSize.height}`"
    >
      <rect
        :x="rectPosition.x"
        :y="rectPosition.y"
        :width="rectSize.width"
        :height="rectSize.height"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
        :rx="borderRadius"
        :opacity="opacity"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, type CSSProperties } from 'vue';
import type { Coords } from '@/types';

interface Props {
  startTile?: Coords;
  endTile?: Coords;
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  startTile: () => ({ x: 0, y: 0 }),
  endTile: () => ({ x: 100, y: 100 }),
  visible: false
});

const containerStyles = ref<CSSProperties>({});
const svgStyles = ref<CSSProperties>({});
const viewboxSize = ref({ width: 200, height: 200 });
const rectPosition = ref({ x: 10, y: 10 });
const rectSize = ref({ width: 180, height: 180 });

// 样式配置
const fillColor = ref('lightblue');
const strokeColor = ref('blue');
const strokeWidth = ref(3);
const dashArray = ref('5,10');
const dashOffset = ref(0);
const borderRadius = ref(8);
const opacity = ref(0.5);

const UNPROJECTED_TILE_SIZE = 100;
const PIXEL_UNIT = 1;

let animationId: number | null = null;

const updateLassoSelection = () => {
  if (!props.visible) return;

  // 计算选择区域
  const boundingBox = getBoundingBox([props.startTile, props.endTile]);
  if (!boundingBox) return;

  const size = {
    width: Math.abs(boundingBox.highX - boundingBox.lowX) + 1,
    height: Math.abs(boundingBox.highY - boundingBox.lowY) + 1
  };

  // 更新viewbox和矩形尺寸
  viewboxSize.value = {
    width: size.width * UNPROJECTED_TILE_SIZE,
    height: size.height * UNPROJECTED_TILE_SIZE
  };

  rectSize.value = {
    width: size.width * (UNPROJECTED_TILE_SIZE - PIXEL_UNIT * 3),
    height: size.height * (UNPROJECTED_TILE_SIZE - PIXEL_UNIT * 3)
  };

  // 更新容器样式
  containerStyles.value = {
    position: 'absolute',
    left: `${boundingBox.lowX * UNPROJECTED_TILE_SIZE}px`,
    top: `${boundingBox.lowY * UNPROJECTED_TILE_SIZE}px`,
    pointerEvents: 'none',
    zIndex: '100'
  };

  svgStyles.value = {
    width: `${viewboxSize.value.width}px`,
    height: `${viewboxSize.value.height}px`
  };
};

// 简化的边界框计算
const getBoundingBox = (tiles: Coords[]) => {
  if (tiles.length === 0) return null;

  const xs = tiles.map((t) => t.x);
  const ys = tiles.map((t) => t.y);

  return {
    lowX: Math.min(...xs),
    highX: Math.max(...xs),
    lowY: Math.min(...ys),
    highY: Math.max(...ys)
  };
};

// 动画虚线效果
const startDashAnimation = () => {
  const animate = () => {
    dashOffset.value =
      (dashOffset.value + PIXEL_UNIT * 0.5) % (PIXEL_UNIT * 15);
    animationId = requestAnimationFrame(animate);
  };
  animate();
};

const stopDashAnimation = () => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
};

// 监听props变化
watch(
  [() => props.startTile, () => props.endTile, () => props.visible],
  () => {
    updateLassoSelection();

    if (props.visible) {
      startDashAnimation();
    } else {
      stopDashAnimation();
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  updateLassoSelection();
  if (props.visible) {
    startDashAnimation();
  }
});

onUnmounted(() => {
  stopDashAnimation();
});
</script>

<style scoped>
.lasso-container {
  /* Lasso容器样式 */
}

.lasso-svg {
  /* Lasso SVG样式 */
}
</style>
