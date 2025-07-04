<template>
  <Isoflow
    :initial-data="initialDataConfig"
    :enable-debug-tools="true"
    height="100%"
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
/* DebugTools组件样式 */
</style>
