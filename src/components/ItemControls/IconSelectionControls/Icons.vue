<template>
  <div class="icons-container" :style="containerStyles">
    <div
      v-for="cat in iconCategories"
      :key="`icon-collection-${cat.id ?? 'uncategorised'}`"
      class="icon-collection-item"
      :style="itemStyles"
    >
      <IconCollection
        v-bind="cat"
        @click="handleIconClick"
        @mouse-down="handleIconMouseDown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type CSSProperties } from 'vue';
import type { IconCollectionStateWithIcons, Icon } from '@/types';
import IconCollection from './IconCollection.vue';

interface Props {
  iconCategories: IconCollectionStateWithIcons[];
  onClick?: (icon: Icon) => void;
  onMouseDown?: (icon: Icon) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onClick: undefined,
  onMouseDown: undefined
});

const emit = defineEmits<{
  click: [icon: Icon];
  'mouse-down': [icon: Icon];
}>();

const containerStyles = ref<CSSProperties>({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '8px',
  padding: '16px 0'
});

const itemStyles = ref<CSSProperties>({
  width: '100%'
});

const handleIconClick = (icon: Icon) => {
  if (props.onClick) {
    props.onClick(icon);
  }
  emit('click', icon);
};

const handleIconMouseDown = (icon: Icon) => {
  if (props.onMouseDown) {
    props.onMouseDown(icon);
  }
  emit('mouse-down', icon);
};
</script>

<style scoped>
.icons-container {
  /* 图标容器样式 */
}

.icon-collection-item {
  /* 图标集合项样式 */
}
</style>
