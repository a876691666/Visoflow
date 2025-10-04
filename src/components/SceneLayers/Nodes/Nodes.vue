<template>
  <div class="nodes-layer">
    <Node
      v-for="(node, index) in nodes"
      :key="node.id"
      :node="node"
      :order="index"
    />
  </div>
</template>

<script setup lang="ts">
import type { ViewItem } from '@/types';
import Node from './Node/Node.vue';

interface Props {
  nodes: ViewItem[];
}

defineProps<Props>();
</script>

<style scoped>
.nodes-layer {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
