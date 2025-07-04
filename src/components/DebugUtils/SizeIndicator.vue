<template>
  <div class="size-indicator">
    <div class="size-info">Debug: Size Indicator</div>
  </div>
</template>

<script setup lang="ts">
// Size indicator debug component
</script>

<style scoped>
.size-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.size-info {
  white-space: nowrap;
}
</style>
