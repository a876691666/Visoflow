<template>
  <Svg :viewbox-size="pxSize" :style="css">
    <rect
      :width="pxSize.width"
      :height="pxSize.height"
      :fill="fill"
      :rx="cornerRadius"
      :stroke="strokeColor"
      :stroke-width="strokeWidth"
    />
  </Svg>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Coords } from '@/types';
import Svg from '@/components/Svg/Svg.vue';
import { useIsoProjection } from 'src/hooks/useIsoProjection';

interface Props {
  from: Coords;
  to: Coords;
  origin?: Coords;
  fill?: string;
  cornerRadius?: number;
  stroke?: {
    width: number;
    color: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  fill: 'none',
  cornerRadius: 0,
  stroke: undefined
});

const strokeColor = ref('none');
const strokeWidth = ref(0);

// 使用IsoProjection
const { css, pxSize, update } = useIsoProjection();

// 更新stroke参数
const updateStroke = () => {
  if (props.stroke) {
    strokeColor.value = props.stroke.color;
    strokeWidth.value = props.stroke.width;
  } else {
    strokeColor.value = 'none';
    strokeWidth.value = 0;
  }
};

// 监听stroke变化
watch(() => props.stroke, updateStroke, { immediate: true, deep: true });
watch(
  [() => props.from, () => props.to, () => props.origin],
  () => {
    update({
      from: props.from,
      to: props.to,
      originOverride: props.origin
    });
  },
  { immediate: true }
);
</script>

<style scoped>
/* IsoTileArea组件样式 */
</style>
