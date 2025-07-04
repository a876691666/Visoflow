<template>
  <div class="main-menu">
    <IconButton name="Main Menu" @click="toggleMenu">
      <template #icon>
        <div class="menu-icon">☰</div>
      </template>
    </IconButton>

    <div v-if="isMenuOpen" class="menu-dropdown">
      <div class="menu-item" @click="handleMenuAction('new')">New Diagram</div>
      <div class="menu-item" @click="handleMenuAction('save')">Save</div>
      <div class="menu-item" @click="handleMenuAction('load')">Load</div>
      <div class="menu-separator"></div>
      <div class="menu-item" @click="handleMenuAction('export')">
        Export Image
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconButton from '../IconButton/IconButton.vue';

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleMenuAction = (action: string) => {
  console.log('Menu action:', action);
  isMenuOpen.value = false;

  // Menu action logic will be implemented here
  switch (action) {
    case 'new':
      // New diagram logic
      break;
    case 'save':
      // Save logic
      break;
    case 'load':
      // Load logic
      break;
    case 'export':
      // Export logic
      break;
  }
};
</script>

<style scoped>
.main-menu {
  position: relative;
}

.menu-icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  z-index: 1000;
  margin-top: 4px;
}

.menu-item {
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-item:first-child {
  border-radius: 8px 8px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 8px 8px;
}

.menu-separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}
</style>
