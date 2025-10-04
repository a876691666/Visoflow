<template>
  <div class="textboxes-layer">
    <TextBox
      v-for="(textBox, id) in combinedTextBoxes"
      :key="id"
      :textBox="textBox"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TextBox from './TextBox.vue';
import type { TextBox as TextBoxType, SceneTextBox } from '@/types';

interface Props {
  textBoxes:
    | Array<TextBoxType & Partial<SceneTextBox>>
    | Record<string, TextBoxType>;
  sceneTextBoxes?: Record<string, SceneTextBox>;
}

const props = withDefaults(defineProps<Props>(), {
  sceneTextBoxes: () => ({})
});

// 合并视图和场景数据
const combinedTextBoxes = ref<Record<string, TextBoxType & SceneTextBox>>({});

const updateCombinedTextBoxes = () => {
  const combined: Record<string, TextBoxType & SceneTextBox> = {};

  if (Array.isArray(props.textBoxes)) {
    props.textBoxes.forEach((tb: any) => {
      const id = tb.id;
      const sceneData = props.sceneTextBoxes?.[id];
      combined[id] = {
        ...(tb as TextBoxType),
        ...(sceneData as SceneTextBox)
      } as any;
    });
  } else {
    Object.entries(props.textBoxes).forEach(([id, textBox]) => {
      const sceneData = props.sceneTextBoxes?.[id];
      combined[id] = {
        ...textBox,
        ...(sceneData as SceneTextBox)
      } as any;
    });
  }

  combinedTextBoxes.value = combined;
};

// 监听props变化
watch(
  [() => props.textBoxes, () => props.sceneTextBoxes],
  updateCombinedTextBoxes,
  { immediate: true }
);
</script>

<style scoped>
.textboxes-layer {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
