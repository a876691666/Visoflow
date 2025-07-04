<template>
  <Isoflow :initial-data="initialDataConfig" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Isoflow from '@/Isoflow.vue';
import { initialData } from '../initialData';

debugger;
const initialDataConfig = ref({
  ...initialData,
  fitToView: true
});
</script>

<style scoped>
/* BasicEditor组件样式 */
</style>
