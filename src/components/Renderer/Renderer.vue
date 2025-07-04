<template>
  <div
    ref="containerRef"
    :style="{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      backgroundColor: props.backgroundColor || '#f5f5f5'
    }"
  >
    <!-- Scene layers will be added here -->
    <div class="scene-content">
      <!-- Placeholder for now -->
      <div>Renderer Component (Vue3 placeholder)</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useInteractionManager } from 'src/composables/useInteractionManager'
// import { useScene } from 'src/composables/useScene'

interface Props {
  showGrid?: boolean
  backgroundColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  showGrid: true,
  backgroundColor: '#f5f5f5'
})

const containerRef = ref<HTMLDivElement>()

const uiStateStore = useUiStateStore()
const { setInteractionsElement } = useInteractionManager()
// const scene = useScene() // TODO: Use when implementing scene rendering

onMounted(() => {
  if (containerRef.value) {
    uiStateStore.setRendererEl(containerRef.value)
    setInteractionsElement(containerRef.value)
  }
})
</script>