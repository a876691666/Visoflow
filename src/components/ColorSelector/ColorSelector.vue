<template>
  <div class="color-selector">
    <ColorSwatch
      v-for="color in colors"
      :key="color.id"
      :hex="color.value"
      :is-active="activeColor === color.id"
      @click="() => handleColorChange(color.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useIsoflowModelStore } from 'src/context/isoflowContext';
import ColorSwatch from './ColorSwatch.vue';

interface Props {
  onChange: (color: string) => void;
  activeColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  activeColor: ''
});

const modelStore = useIsoflowModelStore<any>();
const colors = ref<Array<{ id: string; value: string }>>([]);

const updateColors = () => {
  // 从store获取颜色数据
  colors.value = modelStore.colors || [
    { id: 'red', value: '#f44336' },
    { id: 'blue', value: '#2196f3' },
    { id: 'green', value: '#4caf50' },
    { id: 'yellow', value: '#ffeb3b' },
    { id: 'purple', value: '#9c27b0' },
    { id: 'orange', value: '#ff9800' },
    { id: 'teal', value: '#009688' },
    { id: 'pink', value: '#e91e63' }
  ];
};

const handleColorChange = (colorId: string) => {
  props.onChange(colorId);
};

// 监听scene store的颜色变化
watch(() => modelStore.colors, updateColors, { immediate: true, deep: true });
</script>

<style scoped>
.color-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
