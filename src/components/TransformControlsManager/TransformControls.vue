<template>
  <div class="transform-controls">
    <Svg :style="svgStyles">
      <g :transform="`translate(${strokeWidth}, ${strokeWidth})`">
        <rect
          :width="rectWidth"
          :height="rectHeight"
          fill="none"
          :stroke="TRANSFORM_CONTROLS_COLOR"
          :stroke-dasharray="`${strokeWidth * 2} ${strokeWidth * 2}`"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
        />
      </g>
    </Svg>

    <TransformAnchor
      v-for="(anchor, index) in anchors"
      :key="index"
      :position="anchor.position"
      @mouse-down="anchor.onMouseDown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import type { Coords, AnchorPosition } from '@/types';
import Svg from '@/components/Svg/Svg.vue';
import TransformAnchor from './TransformAnchor.vue';

interface Props {
  from: Coords;
  to: Coords;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onAnchorMouseDown: undefined
});

const strokeWidth = 2;
const TRANSFORM_CONTROLS_COLOR = '#2196f3';

// 响应式数据
const svgStyles = ref<CSSProperties>({});
const rectWidth = ref(0);
const rectHeight = ref(0);
const anchors = ref<Array<{ position: any; onMouseDown: () => void }>>([]);

// 使用投影Hook
const { css, pxSize } = useIsoProjection({
  from: props.from,
  to: props.to
});

const updateSvgStyles = () => {
  svgStyles.value = {
    ...css.value,
    pointerEvents: 'none'
  };
};

const updateRectSize = () => {
  rectWidth.value = pxSize.value.width - strokeWidth * 2;
  rectHeight.value = pxSize.value.height - strokeWidth * 2;
};

const updateAnchors = () => {
  if (!props.onAnchorMouseDown) {
    anchors.value = [];
    return;
  }

  // 简化的锚点计算
  const corners = getBoundingBox([props.from, props.to]);
  const namedCorners = convertBoundsToNamedAnchors(corners);

  const cornerPositions = Object.entries(namedCorners).map(
    ([key, value], i) => {
      const position = getTilePosition({
        tile: value,
        origin: outermostCornerPositions[i]
      });

      return {
        position,
        onMouseDown: () => {
          props.onAnchorMouseDown?.(key as AnchorPosition);
        }
      };
    }
  );

  anchors.value = cornerPositions;
};

// 简化的工具函数
const getBoundingBox = (coords: Coords[]) => {
  return {
    minX: Math.min(...coords.map((c) => c.x)),
    maxX: Math.max(...coords.map((c) => c.x)),
    minY: Math.min(...coords.map((c) => c.y)),
    maxY: Math.max(...coords.map((c) => c.y))
  };
};

const convertBoundsToNamedAnchors = (bounds: any) => {
  return {
    'top-left': { x: bounds.minX, y: bounds.minY },
    'top-right': { x: bounds.maxX, y: bounds.minY },
    'bottom-left': { x: bounds.minX, y: bounds.maxY },
    'bottom-right': { x: bounds.maxX, y: bounds.maxY }
  };
};

const getTilePosition = ({ tile, origin }: any) => {
  return {
    x: tile.x * 50 + (origin?.x || 0),
    y: tile.y * 50 + (origin?.y || 0)
  };
};

const outermostCornerPositions = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 }
];

// 监听变化
watch(() => css.value, updateSvgStyles, { immediate: true, deep: true });
watch(() => pxSize.value, updateRectSize, { immediate: true, deep: true });
watch(() => [props.from, props.to, props.onAnchorMouseDown], updateAnchors, {
  immediate: true,
  deep: true
});
</script>

<style scoped>
.transform-controls {
  position: relative;
}
</style>
