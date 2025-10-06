<template>
  <div class="nodes-layer">
    <Node
      v-for="(node, index) in items"
      :key="node.id"
      :node="node"
      :order="index"
    />
  </div>
</template>

<script setup lang="ts">
import Node from './Node/Node.vue';
import { useSceneStore } from 'src/stores/provider';

const { items } = useSceneStore();
</script>

<style scoped>
.nodes-layer {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
