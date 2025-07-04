<template>
  <div v-if="isVisible" class="context-menu" :style="menuStyle">
    <div class="context-menu-item" @click="handleAction('copy')">Copy</div>
    <div class="context-menu-item" @click="handleAction('paste')">Paste</div>
    <div class="context-menu-separator"></div>
    <div class="context-menu-item" @click="handleAction('delete')">Delete</div>
    <div class="context-menu-separator"></div>
    <div class="context-menu-item" @click="handleAction('properties')">
      Properties
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  anchorEl?: HTMLElement;
  visible?: boolean;
  position?: { x: number; y: number };
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
});

const emit = defineEmits<{
  action: [action: string];
  close: [];
}>();

const isVisible = ref(false);
const menuStyle = ref({
  position: 'absolute' as const,
  left: '0px',
  top: '0px',
  zIndex: 3000
});

watch(
  () => props.visible,
  (newVisible) => {
    isVisible.value = newVisible;
  }
);

watch(
  () => props.position,
  (newPosition) => {
    if (newPosition) {
      menuStyle.value.left = `${newPosition.x}px`;
      menuStyle.value.top = `${newPosition.y}px`;
    }
  }
);

const handleAction = (action: string) => {
  console.log('Context menu action:', action);
  emit('action', action);
  emit('close');
  isVisible.value = false;
};
</script>

<style scoped>
.context-menu {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  padding: 4px 0;
  z-index: 3000;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.context-menu-separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}
</style>
