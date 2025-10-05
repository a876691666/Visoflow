<template>
  <TransformControls v-if="node" :from="node.tile" :to="node.tile" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useViewItem } from 'src/hooks/useViewItem';
import TransformControls from './TransformControls.vue';

interface Props {
  id: string;
}
const props = defineProps<Props>();

const nodeRef = useViewItem(props.id);
const node = computed(() => nodeRef.value);
</script>

<style scoped>
/* NodeTransformControls 样式 */
</style>
