<template>
  <IsoTileArea :from="from" :to="to" :="style" />
</template>

<script setup lang="ts">
import IsoTileArea from '@/components/IsoTileArea/IsoTileArea.vue';
import type { Coords } from '@/types';

interface Props {
  from: Coords;
  to: Coords;
  style?: Record<string, any>;
}

defineProps<Props>();
</script>

<style scoped>
/* Rectangle组件样式 */
</style>
