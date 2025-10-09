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
import { ref, onMounted, onUnmounted, computed, type CSSProperties } from 'vue';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { PROJECTED_TILE_SIZE } from '@/config';

interface Props {
  url: string;
  // 传入的最终缩放倍率
  iconScale?: number;
  // 图标底部偏移（像素），向下为正
  iconBottom?: number;
  onImageLoaded?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  iconScale: 1,
  iconSizeFactor: 0.8,
  onImageLoaded: undefined
});

const iconRef = ref<HTMLImageElement>();

const { size, observe, disconnect } = useResizeObserver();

const iconScale = computed(() => props.iconScale ?? 1);

const iconStyles = computed<CSSProperties>(() => ({
  position: 'absolute',
  width: `${PROJECTED_TILE_SIZE.width * 0.8 * iconScale.value}px`,
  top: `${-size.value.height + (props.iconBottom ?? 0)}px`,
  left: `${-size.value.width / 2}px`
}));

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
</script>

<style scoped>
.isometric-icon {
  display: block;
  object-fit: contain;
}
</style>
