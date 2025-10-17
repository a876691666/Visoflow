<template>
  <Svg :viewbox-size="pxSize" :style="css" :class="$attrs.class">
    <rect
      :width="pxSize.width"
      :height="pxSize.height"
      :="$attrs"
      :fill="($attrs.fill as string) || theme.palette.primary.main"
    />
  </Svg>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import type { Coords } from '@/types';
import Svg from '@/components/Svg/Svg.vue';
import { useIsoProjection } from 'src/hooks/useIsoProjection';
import { theme } from 'src/styles/theme';

interface Props {
  from: Coords;
  to: Coords;
  origin?: Coords;
}

const props = withDefaults(defineProps<Props>(), {});

// 使用IsoProjection
const { css, pxSize, update } = useIsoProjection();

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

defineOptions({
  inheritAttrs: false
});
</script>

<style scoped>
/* IsoTileArea组件样式 */
</style>
