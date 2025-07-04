<template>
  <div class="ui-overlay">
    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <div class="toolbar-section">
        <h2 class="app-title">🎨 Isoflow Vue 3</h2>
        <span class="status-badge" :class="{ 'ready': isReady }">
          {{ isReady ? '就绪' : '加载中' }}
        </span>
      </div>
      
      <div class="toolbar-section">
        <button 
          class="tool-button"
          @click="fitToView"
          title="适应视图"
        >
          🔍 适应视图
        </button>
        <button 
          class="tool-button"
          @click="resetView"
          title="重置视图"
        >
          🔄 重置
        </button>
      </div>
    </div>

    <!-- 右侧信息面板 -->
    <div class="info-panel">
      <div class="panel-section">
        <h3>视图控制</h3>
        <div class="control-row">
          <label>缩放:</label>
          <input 
            type="range" 
            min="0.2" 
            max="2" 
            step="0.1" 
            :value="zoom"
            @input="updateZoom($event)"
            class="zoom-slider"
          >
          <span class="zoom-value">{{ (zoom * 100).toFixed(0) }}%</span>
        </div>
      </div>

      <div class="panel-section" v-if="hasDebugTools">
        <h3>调试信息</h3>
        <div class="debug-info">
          <div>模式: {{ mode?.type || 'N/A' }}</div>
          <div>鼠标: ({{ mousePos.x }}, {{ mousePos.y }})</div>
          <div>渲染器: {{ rendererEl ? '已连接' : '未连接' }}</div>
        </div>
      </div>

      <div class="panel-section">
        <h3>快捷键</h3>
        <div class="shortcuts">
          <div><kbd>Ctrl</kbd> + <kbd>+</kbd> 放大</div>
          <div><kbd>Ctrl</kbd> + <kbd>-</kbd> 缩小</div>
          <div><kbd>Space</kbd> 平移模式</div>
          <div><kbd>Esc</kbd> 取消选择</div>
        </div>
      </div>
    </div>

    <!-- 底部状态栏 -->
    <div class="bottom-status">
      <div class="status-section">
        <span>模式: {{ editorModeText }}</span>
        <span>视图: {{ currentView?.name || '无' }}</span>
      </div>
      <div class="status-section">
        <span>项目: {{ itemCount }}</span>
        <span>连接器: {{ connectorCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useScene } from 'src/hooks/useScene'
import { useInitialDataManager } from 'src/hooks/useInitialDataManager'
import { useDiagramUtils } from 'src/hooks/useDiagramUtils'

const uiStateStore = useUiStateStore()
const scene = useScene()
const initialDataManager = useInitialDataManager()
const diagramUtils = useDiagramUtils()

const isReady = computed(() => initialDataManager.isReady.value)
const zoom = computed(() => uiStateStore.zoom)
const mode = computed(() => uiStateStore.mode)
const editorMode = computed(() => uiStateStore.editorMode)
const hasDebugTools = computed(() => uiStateStore.enableDebugTools)
const rendererEl = computed(() => uiStateStore.rendererEl)
const currentView = computed(() => scene.currentView.value)
const itemCount = computed(() => scene.items.value.length)
const connectorCount = computed(() => scene.connectors.value.length)

const mousePos = computed(() => ({
  x: Math.round(uiStateStore.mouse.position.screen.x || 0),
  y: Math.round(uiStateStore.mouse.position.screen.y || 0)
}))

const editorModeText = computed(() => {
  switch (editorMode.value) {
    case 'EDITABLE': return '可编辑'
    case 'EXPLORABLE_READONLY': return '只读浏览'
    case 'NON_INTERACTIVE': return '非交互'
    default: return editorMode.value
  }
})

const updateZoom = (event: Event) => {
  const target = event.target as HTMLInputElement
  uiStateStore.setZoom(parseFloat(target.value))
}

const fitToView = async () => {
  await diagramUtils.fitToView()
}

const resetView = () => {
  uiStateStore.resetUiState()
}
</script>

<style scoped>
.ui-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  pointer-events: auto;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: #fed7d7;
  color: #c53030;
  transition: all 0.2s;
}

.status-badge.ready {
  background: #c6f6d5;
  color: #2f855a;
}

.tool-button {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-button:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.info-panel {
  position: absolute;
  top: 80px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 16px;
  pointer-events: auto;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section:last-child {
  margin-bottom: 0;
}

.panel-section h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.control-row label {
  font-weight: 500;
  color: #4a5568;
  min-width: 40px;
}

.zoom-slider {
  flex: 1;
}

.zoom-value {
  font-family: monospace;
  font-weight: 500;
  min-width: 40px;
  text-align: right;
}

.debug-info {
  font-size: 12px;
  font-family: monospace;
  color: #718096;
}

.debug-info div {
  margin: 4px 0;
}

.shortcuts {
  font-size: 12px;
}

.shortcuts div {
  margin: 6px 0;
  color: #4a5568;
}

.shortcuts kbd {
  background: #e2e8f0;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 500;
}

.bottom-status {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  pointer-events: auto;
}

.status-section {
  display: flex;
  gap: 20px;
}

.status-section span {
  opacity: 0.9;
}
</style>