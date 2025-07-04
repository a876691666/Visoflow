<template>
  <div class="icon-grid" :style="gridStyles">
    <div
      v-for="icon in icons"
      :key="icon.id"
      class="icon-item"
      :style="itemStyles"
    >
      <Icon
        :icon="icon"
        @click="() => handleIconClick(icon)"
        @mouse-down="() => handleIconMouseDown(icon)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';
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

const gridStyles = ref<CSSProperties>({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '8px',
  padding: '8px 0'
});

const itemStyles = ref<CSSProperties>({
  width: '100%',
  aspectRatio: '1'
});

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
  /* 图标网格样式 */
}

.icon-item {
  /* 图标项样式 */
}
</style>
