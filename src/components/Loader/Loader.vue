<template>
  <div class="loader-container" :style="containerStyles">
    <div class="spinner" :style="spinnerStyles"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  size?: number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  isInline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 1,
  color: 'primary',
  isInline: false
});

const containerStyles = ref<CSSProperties>({});
const spinnerStyles = ref<CSSProperties>({});

const colorMap = {
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
  info: '#0288d1'
};

const updateStyles = () => {
  containerStyles.value = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: props.isInline ? 'auto' : '100%',
    height: props.isInline ? 'auto' : '100%'
  };

  const size = props.size * 20;
  const color = colorMap[props.color] || colorMap.primary;

  spinnerStyles.value = {
    width: `${size}px`,
    height: `${size}px`,
    border: `${Math.max(2, size / 10)}px solid ${color}20`,
    borderTop: `${Math.max(2, size / 10)}px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };
};

// 监听props变化
watch(
  [() => props.size, () => props.color, () => props.isInline],
  updateStyles,
  { immediate: true }
);
</script>

<style scoped>
.loader-container {
  /* Loader容器样式 */
}

.spinner {
  /* 旋转动画 */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
