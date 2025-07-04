<template>
  <div class="scene-layer" :class="{ 'disable-animation': disableAnimation }">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  disableAnimation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disableAnimation: false
});
</script>

<style scoped>
.scene-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transition: transform 0.2s ease;
}

.scene-layer.disable-animation {
  transition: none;
}

.scene-layer > * {
  pointer-events: auto;
}
</style>
