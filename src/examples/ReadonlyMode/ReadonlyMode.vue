<template>
  <Isoflow 
    :initial-data="{ ...initialData, fitToView: true }" 
    editor-mode="EXPLORABLE_READONLY"
  />
</template>

<script setup lang="ts">
import Isoflow from 'src/Isoflow.vue'
import { initialData } from '../initialData'
</script>