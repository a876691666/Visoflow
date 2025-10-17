<template>
  <IsoTileArea :from="from" :to="to" v-bind="{ ...(style || {}), ...$attrs }" />
</template>

<script setup lang="ts">
import IsoTileArea from '@/components/IsoTileArea/IsoTileArea.vue';
import type { Coords } from '@/types';

interface Props {
  from: Coords;
  to: Coords;
  style?: Record<string, any>;
  // 新增：与 key 平级的 class，用于顶级DOM
  class?: string;
}

defineProps<Props>();

// 透传 class 到 IsoTileArea 的根 svg
defineOptions({
  inheritAttrs: false
});
</script>

<style scoped>
/* Rectangle组件样式 */
</style>
