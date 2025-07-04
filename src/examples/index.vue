<template>
  <div class="examples">
    <h1>Isoflow Vue3 Examples</h1>
    <div class="example-container">
      <Isoflow 
        width="800px"
        height="600px"
        :enable-debug-tools="false"
        editor-mode="EDITABLE"
        @model-updated="onModelUpdated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Isoflow from '../Isoflow.vue'

const onModelUpdated = (model: any) => {
  console.log('Model updated:', model)
}
</script>

<style scoped>
.examples {
  padding: 20px;
}

.example-container {
  border: 1px solid #ccc;
  margin-top: 20px;
}
</style>