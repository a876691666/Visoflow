<template>
  <div class="connector-labels-layer">
    <div
      v-for="(connector, id) in connectors"
      :key="id"
      class="connector-label"
    >
      <!-- Connector labels will be implemented here -->
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  connectors: Record<string, any>;
}

const props = defineProps<Props>();
</script>

<style scoped>
.connector-labels-layer {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.connector-label {
  position: absolute;
  background-color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid #ddd;
}
</style>
