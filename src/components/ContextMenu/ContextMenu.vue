<template>
  <div v-if="show" class="context-menu" :style="menuStyles" @click.stop>
    <div class="menu-container" :style="containerStyles">
      <button
        v-for="(item, index) in menuItems"
        :key="index"
        class="menu-item"
        :style="itemStyles"
        @click="handleItemClick(item)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, type CSSProperties } from 'vue';
import type { Coords } from '@/types';

interface MenuItem {
  label: string;
  onClick: () => void;
}

interface Props {
  onClose: () => void;
  position: Coords;
  anchorEl?: HTMLElement;
  menuItems: MenuItem[];
}

const props = defineProps<Props>();

const show = ref(true);
const menuStyles = ref<CSSProperties>({});
const containerStyles = ref<CSSProperties>({});
const itemStyles = ref<CSSProperties>({});

const updateStyles = () => {
  menuStyles.value = {
    position: 'fixed',
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
    zIndex: '1300'
  };

  containerStyles.value = {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e0e0e0',
    minWidth: '120px',
    overflow: 'hidden'
  };

  itemStyles.value = {
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333'
  };
};

const handleItemClick = (item: MenuItem) => {
  item.onClick();
  props.onClose();
};

const handleClickOutside = (event: MouseEvent) => {
  props.onClose();
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('contextmenu', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('contextmenu', handleClickOutside);
});

// 监听position变化
watch(() => props.position, updateStyles, { immediate: true, deep: true });

// 初始化样式
updateStyles();
</script>

<style scoped>
.context-menu {
  /* 上下文菜单样式 */
}

.menu-container {
  /* 菜单容器样式 */
}

.menu-item {
  /* 菜单项样式 */
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item:active {
  background-color: #e0e0e0;
}
</style>
