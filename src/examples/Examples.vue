<template>
  <div class="examples-container">
    <!-- 示例内容区域 -->
    <div class="examples-content">
      <!-- 基础编辑器示例 -->
      <div v-if="selectedExample === 0" class="example-wrapper">
        <BasicEditor />
      </div>

      <!-- 调试工具示例 -->
      <div v-else-if="selectedExample === 1" class="example-wrapper">
        <DebugTools />
      </div>

      <!-- 只读模式示例 -->
      <div v-else-if="selectedExample === 2" class="example-wrapper">
        <ReadonlyMode />
      </div>

      <!-- 自定义配置示例 -->
      <div v-else-if="selectedExample === 3" class="example-wrapper">
        <CustomConfig />
      </div>
    </div>

    <!-- 示例选择器和控制面板 -->
    <div class="controls-panel">
      <!-- 示例选择下拉框 -->
      <div class="control-group">
        <label for="example-selector">选择示例:</label>
        <select
          id="example-selector"
          v-model="selectedExample"
          class="example-selector"
        >
          <option
            v-for="(example, index) in examples"
            :key="example.name"
            :value="index"
          >
            {{ example.name }}
          </option>
        </select>
      </div>

      <!-- 示例描述 -->
      <div class="example-description">
        <h3>{{ currentExample.name }}</h3>
        <p>{{ currentExample.description }}</p>

        <!-- 功能特性列表 -->
        <div v-if="currentExample.features" class="features-list">
          <h4>主要功能:</h4>
          <ul>
            <li v-for="feature in currentExample.features" :key="feature">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button
          @click="resetExample"
          class="btn btn-secondary"
          :disabled="!canReset"
        >
          重置示例
        </button>
        <button
          @click="exportExample"
          class="btn btn-primary"
          :disabled="!canExport"
        >
          导出图表
        </button>
      </div>

      <!-- 状态信息 -->
      <div class="status-info">
        <div class="status-item">
          <span class="label">当前模式:</span>
          <span class="value">{{ currentExample.mode }}</span>
        </div>
        <div class="status-item">
          <span class="label">版本:</span>
          <span class="value">Vue 3 + TypeScript</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BasicEditor from './BasicEditor/BasicEditor.vue';
import DebugTools from './DebugTools/DebugTools.vue';
import ReadonlyMode from './ReadonlyMode/ReadonlyMode.vue';
import CustomConfig from './CustomConfig/CustomConfig.vue';

interface ExampleItem {
  name: string;
  description: string;
  mode: string;
  features?: string[];
}

const examples: ExampleItem[] = [
  {
    name: '基础编辑器',
    description:
      '展示Isoflow的基本编辑功能，包括节点拖拽、连接器绘制、图标库使用等核心特性。',
    mode: '可编辑',
    features: [
      '拖拽式节点创建',
      '智能连接器绘制',
      '丰富的图标库支持',
      '实时图表编辑',
      '缩放和平移操作'
    ]
  },
  {
    name: '调试工具',
    description:
      '启用开发者调试工具，显示网格、坐标、性能指标等调试信息，方便开发和问题排查。',
    mode: '调试模式',
    features: [
      '网格显示和坐标系',
      '性能监控面板',
      '元素边界框显示',
      '事件日志记录',
      '状态实时监控'
    ]
  },
  {
    name: '只读模式',
    description:
      '演示图表的只读展示模式，适用于报告、演示或数据可视化场景，用户可以浏览但不能编辑。',
    mode: '只读',
    features: [
      '图表浏览和缩放',
      '节点详情查看',
      '导出功能保留',
      '响应式布局',
      '无编辑权限保护'
    ]
  },
  {
    name: '自定义配置',
    description:
      '展示如何通过自定义配置来定制Isoflow的外观、行为和功能，包括主题、图标、颜色等。',
    mode: '高级配置',
    features: [
      '自定义主题和颜色',
      '个性化图标库',
      '布局算法配置',
      '交互行为定制',
      '插件扩展支持'
    ]
  }
];

const selectedExample = ref(0);
const canReset = ref(true);
const canExport = ref(true);

// 当前示例信息 - 使用ref + watch替代computed
const currentExample = ref(examples[0]);

// 监听示例切换
watch(
  selectedExample,
  (newIndex) => {
    currentExample.value = examples[newIndex];
    console.log(`切换到示例: ${examples[newIndex].name}`);
  },
  { immediate: true }
);

// 重置示例
const resetExample = () => {
  console.log('重置示例:', currentExample.value.name);
  // 这里可以触发子组件的重置事件
  // emit('reset-example', selectedExample.value);
};

// 导出示例
const exportExample = () => {
  console.log('导出示例:', currentExample.value.name);
  // 这里可以触发子组件的导出事件
  // emit('export-example', selectedExample.value);
};
</script>

<style scoped>
.examples-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  position: relative;
  background-color: #f8f9fa;
}

.examples-content {
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.example-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.controls-panel {
  width: 320px;
  height: 100%;
  background: white;
  border-left: 1px solid #e9ecef;
  padding: 20px;
  overflow-y: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

.control-group {
  margin-bottom: 24px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.example-selector {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: #495057;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.example-selector:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.example-description {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.example-description h3 {
  margin: 0 0 12px 0;
  color: #212529;
  font-size: 18px;
  font-weight: 600;
}

.example-description p {
  margin: 0 0 16px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.features-list {
  margin-top: 16px;
}

.features-list h4 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
}

.features-list ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

.features-list li {
  margin-bottom: 4px;
  color: #6c757d;
  font-size: 13px;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
  transform: translateY(-1px);
}

.status-info {
  padding: 16px;
  background-color: #e9ecef;
  border-radius: 6px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-item .label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.status-item .value {
  font-size: 13px;
  color: #495057;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .examples-container {
    flex-direction: column;
  }

  .controls-panel {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-left: none;
    border-top: 1px solid #e9ecef;
  }

  .examples-content {
    height: 60vh;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    flex: none;
  }
}
</style>
