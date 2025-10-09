<template>
  <div class="textboxes-layer">
    <TextBox
      v-for="textBox in reversedTextBoxes"
      :key="textBox.id"
      :textBox="textBox"
    />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import TextBox from './TextBox.vue';
import type { SceneTextBox, TextBox as TextBoxType } from '@/types';
import { useSceneStore } from 'src/stores/provider';

const sceneStore = useSceneStore();

const reversedTextBoxes = shallowRef<(TextBoxType & SceneTextBox)[]>([]);

watch(
  sceneStore.textBoxs,
  (newTextBoxs) => {
    reversedTextBoxes.value = [...newTextBoxs].reverse();
  },
  { immediate: true }
);
</script>

<style scoped>
.textboxes-layer {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
