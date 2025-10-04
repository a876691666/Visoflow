<template>
  <div class="non-isometric-container" :style="containerStyles">
    <div class="icon-wrapper" :style="wrapperStyles">
      <img
        class="icon-image"
        :src="icon.url"
        :alt="`icon-${icon.id}`"
        :style="imageStyles"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
import type { Icon } from '@/types';
import { PROJECTED_TILE_SIZE } from '@/config';

interface Props {
  icon: Icon;
}

defineProps<Props>();

const containerStyles = computed<CSSProperties>(() => ({
  pointerEvents: 'none'
}));

const wrapperStyles = computed<CSSProperties>(() => ({
  position: 'absolute',
  left: `${-PROJECTED_TILE_SIZE.width / 2}px`,
  top: `${-PROJECTED_TILE_SIZE.height / 2}px`,
  transformOrigin: 'top left',
  transform: getIsoProjectionCss()
}));

const imageStyles = computed<CSSProperties>(() => ({
  width: `${PROJECTED_TILE_SIZE.width * 0.7}px`
}));

// 简化的等距投影CSS生成函数
const getIsoProjectionCss = () => {
  // 简化的等距变换 - 这应该从配置或工具函数中获取
  return 'matrix(0.866, 0.5, -0.866, 0.5, 0, 0)';
};
</script>

<style scoped>
.non-isometric-container {
  position: relative;
}

.icon-wrapper {
  position: absolute;
}

.icon-image {
  display: block;
  object-fit: contain;
}
</style>
