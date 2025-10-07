<template>
  <button class="icon-button" @click="handleClick" @mousedown="handleMouseDown">
    <div class="icon-content">
      <div class="icon-image-container">
        <img
          :src="icon.url"
          :alt="`Icon ${icon.name}`"
          class="icon-image"
          draggable="false"
        />
      </div>
      <div class="icon-name">
        {{ icon.name }}
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Icon as IconType } from '@/types';

interface Props {
  icon: IconType;
}

defineProps<Props>();

const emit = defineEmits<{
  click: [];
  mousedown: [];
}>();

const handleClick = () => {
  emit('click');
};

const handleMouseDown = () => {
  emit('mousedown');
};
</script>

<style scoped>
.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  user-select: none;
}

.icon-button:hover {
  background-color: #f5f5f5;
}

.icon-button:active {
  background-color: #e0e0e0;
}

.icon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 50px;
}

.icon-image-container {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 4px;
}

.icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>
