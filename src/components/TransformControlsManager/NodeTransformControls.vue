<template>
  <TransformControls v-if="node" :from="node.tile" :to="node.tile" />
</template>

<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import TransformControls from './TransformControls.vue';
import { useSceneStore } from 'src/stores/provider';

interface Props {
  id: string;
}
const props = defineProps<Props>();

const sceneStore = useSceneStore();
const node = shallowRef();

watch(
  () => props.id,
  () => {
    node.value = sceneStore.getItem(props.id);
  },
  { immediate: true }
);
</script>

<style scoped>
/* NodeTransformControls 样式 */
</style>
