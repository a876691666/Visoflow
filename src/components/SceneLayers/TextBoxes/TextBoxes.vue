<template>
  <div class="textboxes-layer">
    <div v-for="(textBox, id) in textBoxes" :key="id" class="textbox-item">
      <!-- TextBox content will be implemented here -->
      <div class="textbox-content">Text Box Content</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  textBoxes: Record<string, any>;
}

const props = defineProps<Props>();
</script>

<style scoped>
.textboxes-layer {
  position: relative;
  width: 100%;
  height: 100%;
}

.textbox-item {
  position: absolute;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  min-width: 100px;
  min-height: 50px;
}

.textbox-content {
  font-size: 14px;
  line-height: 1.4;
}
</style>
