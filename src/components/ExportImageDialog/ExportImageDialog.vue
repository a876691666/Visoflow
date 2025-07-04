<template>
  <div class="export-dialog-overlay" @click="handleOverlayClick">
    <div class="export-dialog" @click.stop>
      <div class="dialog-header">
        <h3>Export Image</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <div class="dialog-content">
        <div class="form-group">
          <label>Format:</label>
          <select v-model="exportFormat">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="svg">SVG</option>
          </select>
        </div>

        <div class="form-group">
          <label>Quality:</label>
          <input v-model="quality" type="range" min="0.1" max="1" step="0.1" />
          <span>{{ Math.round(quality * 100) }}%</span>
        </div>

        <div class="form-group">
          <label>
            <input v-model="includeBackground" type="checkbox" />
            Include Background
          </label>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-primary" @click="handleExport">Export</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  close: [];
}>();

const exportFormat = ref('png');
const quality = ref(0.9);
const includeBackground = ref(true);

const handleOverlayClick = () => {
  emit('close');
};

const handleExport = () => {
  console.log('Exporting image:', {
    format: exportFormat.value,
    quality: quality.value,
    includeBackground: includeBackground.value
  });

  // Export logic will be implemented here
  // This would typically use dom-to-image or similar library

  emit('close');
};
</script>

<style scoped>
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.export-dialog {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 400px;
  max-width: 500px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.dialog-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group select,
.form-group input[type='range'] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input[type='checkbox'] {
  margin-right: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}
</style>
