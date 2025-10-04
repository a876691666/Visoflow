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
  onImageLoaded?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  onImageLoaded: undefined
});

const iconRef = ref<HTMLImageElement>();

const { size, observe, disconnect } = useResizeObserver();

const iconStyles = computed<CSSProperties>(() => ({
  position: 'absolute',
  width: `${PROJECTED_TILE_SIZE.width * 0.8}px`,
  top: `${-size.value.height}px`,
  left: `${-size.value.width / 2}px`,
  pointerEvents: 'none'
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
