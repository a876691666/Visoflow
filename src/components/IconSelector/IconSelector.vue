<template>
  <div class="icon-selector">
    <div class="selector-header">
      <h3>图标库</h3>
      <div class="search-box">
        <input 
          v-model="searchTerm"
          placeholder="搜索图标..."
          class="search-input"
          @input="onSearchInput"
        >
        <div class="search-results" v-if="filteredIcons && searchTerm">
          <div class="results-header">
            搜索结果 ({{ filteredIcons.length }})
          </div>
          <div class="icon-grid">
            <div 
              v-for="icon in filteredIcons" 
              :key="icon.id"
              class="icon-item"
              @click="selectIcon(icon)"
            >
              <div class="icon-preview">{{ getIconDisplay(icon) }}</div>
              <div class="icon-name">{{ icon.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="categories-section" v-if="!searchTerm">
      <div 
        v-for="category in iconCategories" 
        :key="category.id"
        class="category-group"
      >
        <div 
          class="category-header" 
          @click="toggleCategory(category.id)"
        >
          <span class="expand-icon">
            {{ category.isExpanded ? '📂' : '📁' }}
          </span>
          <span class="category-name">
            {{ category.id || '未分类' }} ({{ category.icons.length }})
          </span>
        </div>
        
        <div v-if="category.isExpanded" class="category-content">
          <div class="icon-grid">
            <div 
              v-for="icon in category.icons" 
              :key="icon.id"
              class="icon-item"
              @click="selectIcon(icon)"
            >
              <div class="icon-preview">{{ getIconDisplay(icon) }}</div>
              <div class="icon-name">{{ icon.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedIcon" class="selection-info">
      <h4>已选择:</h4>
      <div class="selected-icon">
        <span class="icon-display">{{ getIconDisplay(selectedIcon) }}</span>
        <span class="icon-details">{{ selectedIcon.name }}</span>
        <button @click="clearSelection" class="clear-btn">清除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIconCategories } from 'src/hooks/useIconCategories'
import { useIconFiltering } from 'src/hooks/useIconFiltering'
import { useUiStateStore } from 'src/stores/uiStateStore'
import type { Icon } from 'src/types'

const emit = defineEmits<{
  iconSelected: [icon: Icon]
}>()

const uiStateStore = useUiStateStore()
const { iconCategories } = useIconCategories()
const { setFilter, filteredIcons } = useIconFiltering()

const searchTerm = ref('')
const selectedIcon = ref<Icon | null>(null)

const onSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchTerm.value = target.value
  setFilter(target.value)
}

const toggleCategory = (categoryId: string) => {
  const categories = [...uiStateStore.iconCategoriesState]
  const categoryIndex = categories.findIndex(cat => cat.id === categoryId)
  if (categoryIndex !== -1) {
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      isExpanded: !categories[categoryIndex].isExpanded
    }
    uiStateStore.setIconCategoriesState(categories)
  }
}

const selectIcon = (icon: Icon) => {
  selectedIcon.value = icon
  emit('iconSelected', icon)
}

const clearSelection = () => {
  selectedIcon.value = null
}

const getIconDisplay = (icon: Icon): string => {
  // 简单的图标显示逻辑，实际项目中应该渲染真实图标
  const iconMap: Record<string, string> = {
    'server': '🖥️',
    'database': '🗄️',
    'laptop': '💻',
    'router': '📡',
    'storage': '💾',
    'office': '🏢',
    'user': '👤',
    'block': '🧱',
    'function-module': '⚙️',
    'queue': '📋',
    'plane': '✈️',
    'paymentcard': '💳'
  }
  return iconMap[icon.id] || '📦'
}
</script>

<style scoped>
.icon-selector {
  width: 300px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.selector-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.selector-header h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #1a202c;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.results-header {
  padding: 8px 12px;
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.categories-section {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.category-group {
  margin-bottom: 8px;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-header:hover {
  background: #e2e8f0;
}

.expand-icon {
  margin-right: 8px;
  font-size: 14px;
}

.category-name {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.category-content {
  margin-top: 8px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  padding: 8px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.icon-item:hover {
  border-color: #6366f1;
  background: #f8fafc;
  transform: translateY(-1px);
}

.icon-preview {
  font-size: 24px;
  margin-bottom: 4px;
}

.icon-name {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

.selection-info {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.selection-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

.selected-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #d1d5db;
}

.icon-display {
  font-size: 20px;
}

.icon-details {
  flex: 1;
  font-size: 13px;
  color: #374151;
}

.clear-btn {
  padding: 4px 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #dc2626;
}
</style>