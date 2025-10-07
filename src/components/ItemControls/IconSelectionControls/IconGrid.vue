<template>
  <div class="icon-grid">
    <div v-for="icon in icons" :key="icon.id" class="icon-item">
      <Icon
        :icon="icon"
        @click="() => handleIconClick(icon)"
        @mouse-down="() => handleIconMouseDown(icon)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Icon as IconI } from '@/types';
import Icon from './Icon.vue';

interface Props {
  icons: IconI[];
  onMouseDown?: (icon: IconI) => void;
  onClick?: (icon: IconI) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onMouseDown: undefined,
  onClick: undefined
});

const emit = defineEmits<{
  click: [icon: IconI];
  'mouse-down': [icon: IconI];
}>();

// 样式已移至 <style scoped>

const handleIconClick = (icon: IconI) => {
  if (props.onClick) {
    props.onClick(icon);
  }
  emit('click', icon);
};

const handleIconMouseDown = (icon: IconI) => {
  if (props.onMouseDown) {
    props.onMouseDown(icon);
  }
  emit('mouse-down', icon);
};
</script>

<style scoped>
.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  align-items: flex-start;
}

.icon-item {
  flex: 0 0 auto;
}
</style>
