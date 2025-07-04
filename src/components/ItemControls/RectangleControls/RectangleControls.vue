<template>
  <ControlsContainer>
    <Section>
      <ColorSelector
        :active-color="rectangleData.color"
        @change="handleColorChange"
      />
    </Section>

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import { useUiStateStore } from '@/stores/uiStateStore';
import { useRectangle } from 'src/hooks/useRectangle';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import ColorSelector from '@/components/ColorSelector/ColorSelector.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const sceneStore = useSceneStore();
const uiStateStore = useUiStateStore();

const rectangleData = ref<any>({
  id: '',
  color: ''
});

const updateRectangleData = () => {
  // 从store获取矩形数据
  const rect = sceneStore.rectangles?.[props.id];
  if (rect) {
    rectangleData.value = { ...rect };
  } else {
    // 使用composable获取数据
    const { rectangle } = useRectangle(props.id);
    if (rectangle.value) {
      rectangleData.value = rectangle.value;
    }
  }
};

const handleColorChange = (color: string) => {
  // 更新本地数据
  rectangleData.value.color = color;

  // 更新store中的数据
  if (sceneStore.updateRectangle) {
    sceneStore.updateRectangle(rectangleData.value.id, { color });
  }
};

const handleDelete = () => {
  uiStateStore.setItemControls(null);

  if (sceneStore.deleteRectangle) {
    sceneStore.deleteRectangle(rectangleData.value.id);
  }
};

// 监听ID变化
watch(() => props.id, updateRectangleData, { immediate: true });
</script>

<style scoped>
/* RectangleControls组件样式 */
</style>
