<template>
  <div ref="rendererRef" class="renderer">
    <div class="renderer-info">
      <h3>Isoflow Vue 3 - 渲染器</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>状态:</strong> {{ isReady ? '就绪' : '初始化中...' }}
        </div>
        <div class="info-item">
          <strong>当前视图:</strong> {{ currentView?.name || '无' }}
        </div>
        <div class="info-item">
          <strong>项目数量:</strong> {{ itemCount }}
        </div>
        <div class="info-item">
          <strong>连接器:</strong> {{ connectorCount }}
        </div>
        <div class="info-item">
          <strong>缩放:</strong> {{ zoom.toFixed(2) }}x
        </div>
        <div class="info-item">
          <strong>编辑模式:</strong> {{ editorMode }}
        </div>
      </div>
      
      <div class="scene-preview" v-if="hasData">
        <h4>场景内容:</h4>
        <div class="content-list">
          <div v-for="item in items" :key="item.id" class="content-item">
            📦 项目: {{ item.id.substring(0, 8) }}...
          </div>
          <div v-for="connector in connectors" :key="connector.id" class="content-item">
            🔗 连接器: {{ connector.id.substring(0, 8) }}...
          </div>
          <div v-for="textBox in textBoxes" :key="textBox.id" class="content-item">
            📝 文本框: {{ textBox.content || textBox.id.substring(0, 8) + '...' }}
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <p>🎨 等待数据加载...</p>
        <p>这里将显示您的等距图表</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useScene } from 'src/hooks/useScene'
import { useInitialDataManager } from 'src/hooks/useInitialDataManager'

interface Props {
  // Add renderer props here based on original implementation
  [key: string]: any
}

const props = defineProps<Props>()

const rendererRef = ref<HTMLDivElement>()
const uiStateStore = useUiStateStore()
const scene = useScene()
const initialDataManager = useInitialDataManager()

const isReady = computed(() => initialDataManager.isReady.value)
const currentView = computed(() => scene.currentView.value)
const items = computed(() => scene.items.value)
const connectors = computed(() => scene.connectors.value)
const textBoxes = computed(() => scene.textBoxes.value)
const zoom = computed(() => uiStateStore.zoom)
const editorMode = computed(() => uiStateStore.editorMode)

const itemCount = computed(() => items.value.length)
const connectorCount = computed(() => connectors.value.length)
const hasData = computed(() => itemCount.value > 0 || connectorCount.value > 0 || textBoxes.value.length > 0)

onMounted(() => {
  if (rendererRef.value) {
    uiStateStore.setRendererEl(rendererRef.value)
  }
})
</script>

<style scoped>
.renderer {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  overflow: auto;
}

.renderer-info {
  padding: 20px;
  color: #2d3748;
}

.renderer-info h3 {
  margin: 0 0 20px 0;
  color: #1a202c;
  font-size: 24px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 6px;
  border-left: 4px solid #6366f1;
  font-size: 14px;
}

.info-item strong {
  color: #4f46e5;
}

.scene-preview {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.scene-preview h4 {
  margin: 0 0 12px 0;
  color: #1a202c;
  font-size: 18px;
}

.content-list {
  max-height: 200px;
  overflow-y: auto;
}

.content-item {
  padding: 8px 12px;
  margin: 4px 0;
  background: #f7fafc;
  border-radius: 4px;
  border-left: 3px solid #38b2ac;
  font-size: 13px;
  font-family: monospace;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}
</style>