<template>
  <div class="gradient" :style="combinedStyles" />
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  styles?: CSSProperties;
}

const props = withDefaults(defineProps<Props>(), {
  styles: () => ({})
});

const combinedStyles = ref<CSSProperties>({
  background:
    'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 5%, rgba(255,255,255,0) 100%)'
});

// 监听styles变化并更新样式
watch(
  () => props.styles,
  (newStyles) => {
    combinedStyles.value = {
      background:
        'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 5%, rgba(255,255,255,0) 100%)',
      ...newStyles
    };
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.gradient {
  /* Base gradient styles */
}
</style>
