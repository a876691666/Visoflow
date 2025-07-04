<template>
  <img
    ref="iconRef"
    class="isometric-icon"
    :src="url"
    :style="iconStyles"
    @load="handleImageLoad"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, type CSSProperties } from 'vue';
import { useResizeObserver } from 'src/hooks/useResizeObserver';

interface Props {
  url: string;
  onImageLoaded?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  onImageLoaded: undefined
});

const iconRef = ref<HTMLImageElement>();
const iconStyles = ref<CSSProperties>({});

const PROJECTED_TILE_SIZE = {
  width: 100,
  height: 100
};

const { size, observe, disconnect } = useResizeObserver();

const updateStyles = () => {
  iconStyles.value = {
    position: 'absolute',
    width: `${PROJECTED_TILE_SIZE.width * 0.8}px`,
    top: `${-size.value.height}px`,
    left: `${-size.value.width / 2}px`,
    pointerEvents: 'none'
  };
};

const handleImageLoad = () => {
  if (props.onImageLoaded) {
    props.onImageLoaded();
  }
};

onMounted(() => {
  if (iconRef.value) {
    observe(iconRef.value);
  }
});

onUnmounted(() => {
  disconnect();
});

// 监听尺寸变化
watch(() => size.value, updateStyles, { immediate: true, deep: true });
</script>

<style scoped>
.isometric-icon {
  /* 等距图标样式 */
}
</style>
