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
      :onMouseDown="anchor.onMouseDown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import type { Coords, AnchorPosition } from 'src/types';
import Svg from '@/components/Svg/Svg.vue';
import TransformAnchor from './TransformAnchor.vue';
import { TRANSFORM_CONTROLS_COLOR } from 'src/config';
import {
  getBoundingBox,
  outermostCornerPositions,
  getTilePosition,
  convertBoundsToNamedAnchors
} from 'src/utils';

interface Props {
  from: Coords;
  to: Coords;
  onAnchorMouseDown?: (anchorPosition: AnchorPosition) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onAnchorMouseDown: undefined
});

const strokeWidth = 2;

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

  // 使用真实 utils 计算四个角并映射到命名锚点
  const corners = getBoundingBox([props.from, props.to]);
  const namedCorners = convertBoundsToNamedAnchors(corners);

  const cornerPositions = (
    Object.entries(namedCorners) as Array<[AnchorPosition, Coords]>
  ).map(([key, value], i) => {
    const position = getTilePosition({
      tile: value,
      origin: outermostCornerPositions[i]
    });

    return {
      position,
      onMouseDown: () => props.onAnchorMouseDown?.(key)
    };
  });

  anchors.value = cornerPositions;
};

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
