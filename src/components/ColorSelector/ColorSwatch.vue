<template>
  <button
    class="color-swatch-button"
    :style="buttonStyles"
    @click="handleClick"
  >
    <div class="swatch-container">
      <div class="color-circle" :style="circleStyles"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';

interface Props {
  hex: string;
  isActive?: boolean;
  onClick?: (event: MouseEvent) => void;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  onClick: undefined
});

const buttonStyles = ref<CSSProperties>({});
const circleStyles = ref<CSSProperties>({});

const updateStyles = () => {
  buttonStyles.value = {
    width: '40px',
    height: '40px',
    minWidth: 'auto',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px'
  };

  circleStyles.value = {
    border: '1px solid #666',
    backgroundColor: props.hex,
    width: '28px',
    height: '28px',
    transformOrigin: 'center',
    transform: `scale(${props.isActive ? 1.25 : 1})`,
    borderRadius: '50%',
    transition: 'transform 0.2s ease-in-out'
  };
};

const handleClick = (event: MouseEvent) => {
  if (props.onClick) {
    props.onClick(event);
  }
};

// 监听props变化
watch([() => props.hex, () => props.isActive], updateStyles, {
  immediate: true
});
</script>

<style scoped>
.color-swatch-button {
  /* 颜色色块按钮样式 */
}

.color-swatch-button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.swatch-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.color-circle {
  /* 颜色圆圈样式 */
}
</style>
