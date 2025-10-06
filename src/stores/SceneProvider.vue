<template>
  <slot />
</template>

<script setup lang="ts">
import { provideSceneStore, useProvider } from './provider';

const API = useProvider();
provideSceneStore(API);
</script>
