<template>
  <button class="menu-item" :style="itemStyles" @click="handleClick">
    <div v-if="icon" class="icon-container" :style="iconContainerStyles">
      <component :is="icon" />
    </div>
    <span class="menu-text">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, type Component, type CSSProperties } from 'vue';

interface Props {
  onClick?: () => void;
  icon?: Component | string;
}

const props = withDefaults(defineProps<Props>(), {
  onClick: undefined,
  icon: undefined
});

const itemStyles = ref<CSSProperties>({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '8px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#333',
  minHeight: '48px'
});

const iconContainerStyles = ref<CSSProperties>({
  marginRight: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px'
});

const handleClick = () => {
  if (props.onClick) {
    props.onClick();
  }
};
</script>

<style scoped>
.menu-item {
  /* 菜单项样式 */
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item:active {
  background-color: #e0e0e0;
}

.icon-container {
  /* 图标容器样式 */
}

.menu-text {
  /* 菜单文本样式 */
}
</style>
