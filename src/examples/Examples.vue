<template>
  <SceneProvider>
    <Visoflow :initial-data="initialDataConfig" />
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
</script>
