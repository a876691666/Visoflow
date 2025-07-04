<template>
  <div style="width: 100vw; height: 100vh;">
    <div style="width: 100%; height: 100%;">
      <component :is="currentExampleComponent" />
    </div>
    <select 
      v-model="currentExample"
      style="
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: white;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
      "
    >
      <option 
        v-for="(example, i) in examples" 
        :key="example.name" 
        :value="i"
      >
        {{ example.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BasicEditor from './BasicEditor/BasicEditor.vue'
import DebugTools from './DebugTools/DebugTools.vue'
import ReadonlyMode from './ReadonlyMode/ReadonlyMode.vue'

const examples = [
  { name: 'Basic editor', component: BasicEditor },
  { name: 'Debug tools', component: DebugTools },
  { name: 'Read-only mode', component: ReadonlyMode }
]

const currentExample = ref(0)

const currentExampleComponent = computed(() => {
  return examples[currentExample.value].component
})
</script>