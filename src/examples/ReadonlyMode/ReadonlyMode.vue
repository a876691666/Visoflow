<template>
  <Isoflow
    :initial-data="initialDataConfig"
    editor-mode="EXPLORABLE_READONLY"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Isoflow from '@/Isoflow.vue';
import { initialData } from '../initialData';

const initialDataConfig = ref({
  ...initialData,
  fitToView: true
});
</script>

<style scoped>
/* ReadonlyMode组件样式 */
</style>
