<template>
  <IsoTileArea :from="tile" :to="tile" :fill="fill" :rx="cornerRadius" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import chroma from 'chroma-js';
import IsoTileArea from '@/components/IsoTileArea/IsoTileArea.vue';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { theme } from '@/styles/theme';
import { watch } from 'vue';

const ui = useUiStateStore();
const mouse = computed(() => ui.mouse);
const zoom = computed(() => ui.zoom);

// 当前鼠标所在的瓦片坐标
const tile = ref({ x: 0, y: 0 });
watch(
  () => mouse.value.position.tile,
  (mouse) => {
    tile.value = mouse;
  },
  { immediate: true }
);

// 主题主色半透明填充
const fill = computed(() =>
  chroma(theme.palette.primary.main).alpha(0.5).css()
);

// 根据缩放调整圆角
const cornerRadius = computed(() => 10 * zoom.value);
</script>

<style scoped>
/* 无额外样式需求，视觉由 IsoTileArea 控制 */
</style>
