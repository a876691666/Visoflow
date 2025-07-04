<template>
  <div v-if="showGuide" class="shortcuts-guide-overlay" @click="closeGuide">
    <div class="shortcuts-guide" @click.stop>
      <div class="guide-header">
        <h2>⌨️ 键盘快捷键</h2>
        <button class="close-button" @click="closeGuide">✕</button>
      </div>
      
      <div class="shortcuts-content">
        <div class="shortcuts-section">
          <h3>🔍 视图控制</h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <span class="key-combo">Ctrl + =</span>
              <span class="description">放大</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Ctrl + -</span>
              <span class="description">缩小</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Ctrl + 0</span>
              <span class="description">重置缩放</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">F</span>
              <span class="description">适应视图</span>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>🎯 模式切换</h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <span class="key-combo">V</span>
              <span class="description">导航模式</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">P</span>
              <span class="description">平移模式</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">C</span>
              <span class="description">连接模式</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">T</span>
              <span class="description">文本模式</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Esc</span>
              <span class="description">取消选择/退出模式</span>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>⚡ 操作快捷键</h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <span class="key-combo">Ctrl + A</span>
              <span class="description">全选</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Delete</span>
              <span class="description">删除选中项</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Backspace</span>
              <span class="description">删除选中项</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Ctrl + R</span>
              <span class="description">刷新视图</span>
            </div>
          </div>
        </div>

        <div class="shortcuts-section">
          <h3>🔧 调试功能</h3>
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <span class="key-combo">F12</span>
              <span class="description">切换调试信息</span>
            </div>
            <div class="shortcut-item">
              <span class="key-combo">Ctrl + H</span>
              <span class="description">显示/隐藏此帮助</span>
            </div>
          </div>
        </div>
      </div>

      <div class="guide-footer">
        <p>💡 提示：在输入框中时快捷键不会生效</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUiStateStore } from 'src/stores/uiStateStore'

const uiStateStore = useUiStateStore()

const showGuide = computed(() => uiStateStore.showShortcutsGuide)

const closeGuide = () => {
  uiStateStore.setShowShortcutsGuide(false)
}
</script>

<style scoped>
.shortcuts-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.shortcuts-guide {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.guide-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.shortcuts-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  padding: 24px;
}

.shortcuts-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #374151;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.shortcut-item:hover {
  background: #f3f4f6;
}

.key-combo {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #374151;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.description {
  color: #6b7280;
  font-size: 14px;
}

.guide-footer {
  background: #f9fafb;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.guide-footer p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .shortcuts-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .guide-header {
    padding: 20px 20px 16px;
  }
  
  .shortcuts-guide {
    margin: 10px;
    max-height: 95vh;
  }
}

/* 滚动条样式 */
.shortcuts-guide::-webkit-scrollbar {
  width: 6px;
}

.shortcuts-guide::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.shortcuts-guide::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.shortcuts-guide::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>