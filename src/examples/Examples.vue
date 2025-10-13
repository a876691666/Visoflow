<template>
  <SceneProvider>
    <Visoflow
      :initial-data="initialDataConfig"
      @hover-item="onHoverItem"
      @unhover-item="onUnhoverItem"
      @click-item="onClickItem"
      @click-canvas="onCanvasClick"
    />
    <!-- <Visoflow
      :initial-data="initialDataConfig"
      @hover-item="onHoverItem"
      @unhover-item="onUnhoverItem"
      @click-item="onClickItem"
      @click-canvas="onCanvasClick"
      editor-mode="NON_INTERACTIVE"
    /> -->
  </SceneProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Visoflow from '@/Visoflow.vue';
import { initialData } from './initialData';
import SceneProvider from 'src/stores/SceneProvider.vue';

const initialDataConfig = ref({
  ...initialData,
  fitToView: true
});

// 事件打印
const onHoverItem = (item: any | null) => {
  console.log('[hoverItem]', item);
};
const onUnhoverItem = (item: any | null) => {
  console.log('[unhoverItem]', item);
};
const onClickItem = (item: any | null) => {
  console.log('[clickItem]', item);
};
const onCanvasClick = (e: MouseEvent) => {
  console.log('[clickCanvas]', e);
};
</script>
