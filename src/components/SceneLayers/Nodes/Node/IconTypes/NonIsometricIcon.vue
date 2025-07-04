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
import { ref, watch, type CSSProperties } from 'vue';
import type { Icon } from '@/types';

interface Props {
  icon: Icon;
}

const props = defineProps<Props>();

const containerStyles = ref<CSSProperties>({});
const wrapperStyles = ref<CSSProperties>({});
const imageStyles = ref<CSSProperties>({});

const PROJECTED_TILE_SIZE = {
  width: 100,
  height: 100
};

const updateStyles = () => {
  containerStyles.value = {
    pointerEvents: 'none'
  };

  wrapperStyles.value = {
    position: 'absolute',
    left: `${-PROJECTED_TILE_SIZE.width / 2}px`,
    top: `${-PROJECTED_TILE_SIZE.height / 2}px`,
    transformOrigin: 'top left',
    transform: getIsoProjectionCss()
  };

  imageStyles.value = {
    width: `${PROJECTED_TILE_SIZE.width * 0.7}px`
  };
};

// 简化的等距投影CSS生成函数
const getIsoProjectionCss = () => {
  // 简化的等距变换
  return 'matrix(0.866, 0.5, -0.866, 0.5, 0, 0)';
};

// 监听icon变化
watch(() => props.icon, updateStyles, { immediate: true, deep: true });
</script>

<style scoped>
.non-isometric-container {
  /* 非等距容器样式 */
}

.icon-wrapper {
  /* 图标包装器样式 */
}

.icon-image {
  /* 图标图片样式 */
}
</style>
