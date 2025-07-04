<template>
  <div class="value-container" :style="containerStyles">
    <span class="value-text" :style="textStyles">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';

interface Props {
  value: string;
}

const props = defineProps<Props>();

const containerStyles = ref<CSSProperties>({
  display: 'inline-block',
  backgroundColor: '#e0e0e0',
  wordWrap: 'break-word',
  padding: '2px 4px',
  border: '1px solid #999',
  borderRadius: '8px',
  maxWidth: '200px'
});

const textStyles = ref<CSSProperties>({
  fontSize: '0.8em',
  color: '#333'
});
</script>

<style scoped>
.value-container {
  /* 值容器样式 */
}

.value-text {
  /* 值文本样式 */
}
</style>
