<template>
  <div class="ground-config">
    <div class="ground-config-header">
      <h3>地面配置</h3>
    </div>

    <div class="ground-config-content">
      <!-- 配置范围选择 -->
      <div class="config-section">
        <label class="config-label">配置范围</label>
        <div class="scope-selector">
          <label class="scope-option">
            <input
              type="radio"
              value="current"
              v-model="configScope"
              @change="onScopeChange"
            />
            <span>当前场景</span>
          </label>
          <label class="scope-option">
            <input
              type="radio"
              value="global"
              v-model="configScope"
              @change="onScopeChange"
            />
            <span>全局配置</span>
          </label>
        </div>
        <div class="scope-hint">
          {{
            configScope === 'current'
              ? '仅影响当前场景的地面显示'
              : '影响所有场景的默认地面显示'
          }}
        </div>
      </div>

      <!-- 背景图片上传 -->
      <div class="config-section">
        <label class="config-label">背景图片</label>
        <div class="image-upload-area">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="file-input"
          />
          <div
            class="upload-zone"
            @click="openFileDialog"
            @dragover.prevent
            @drop.prevent="handleImageDrop"
          >
            <div v-if="!currentImage" class="upload-placeholder">
              <div class="upload-icon">📁</div>
              <div class="upload-text">点击或拖拽上传背景图片</div>
              <div class="upload-hint">支持 JPG、PNG 等格式</div>
            </div>
            <div v-else class="image-preview">
              <img :src="currentImage" alt="背景图片预览" />
              <div class="image-actions">
                <button @click.stop="removeImage" class="remove-btn">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 网格样式配置 -->
      <div class="config-section">
        <label class="config-label">网格样式</label>

        <div class="style-row">
          <label>填充色:</label>
          <PanelColorPicker
            :value="gridStyle.fill || '#000000'"
            @change="
              (hex: string) => {
                gridStyle.fill = hex;
                updateGridStyle();
              }
            "
          />
        </div>

        <div class="style-row">
          <label>边框色:</label>
          <PanelColorPicker
            :value="gridStyle.stroke || '#000000'"
            @change="
              (hex: string) => {
                gridStyle.stroke = hex;
                updateGridStyle();
              }
            "
          />
        </div>

        <div class="style-row">
          <label>边框透明度:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            v-model.number="gridStyle.strokeOpacity"
            @input="updateGridStyle"
          />
          <span class="value-display">{{ gridStyle.strokeOpacity }}</span>
        </div>

        <div class="style-row">
          <label>边框宽度:</label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            v-model.number="gridStyle.strokeWidth"
            @input="updateGridStyle"
          />
          <span class="value-display">{{ gridStyle.strokeWidth }}px</span>
        </div>
      </div>

      <!-- 预设样式 -->
      <div class="config-section">
        <label class="config-label">快速预设</label>
        <div class="preset-buttons">
          <button
            v-for="preset in presets"
            :key="preset.name"
            @click="applyPreset(preset)"
            class="preset-btn"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>

      <!-- 地板缩放配置 -->
      <div class="config-section">
        <label class="config-label">地板缩放</label>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          v-model.number="gridStyle.backgroundScale"
          @input="updateGroundConfig()"
        />
        <div class="value-display">{{ gridStyle.backgroundScale }}x</div>
      </div>

      <!-- 应用全局配置按钮 -->
      <div class="config-section" v-if="configScope === 'current'">
        <button @click="applyGlobalConfig" class="apply-global-btn">
          应用全局配置
        </button>
        <div class="apply-hint">将全局配置应用到当前场景</div>
      </div>

      <!-- 重置按钮 -->
      <div class="config-section">
        <button @click="resetToDefault" class="reset-btn">重置为默认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useSceneStore } from 'src/stores/provider';
import PanelColorPicker from 'src/components/PanelConrols/PanelColorPicker.vue';

const sceneStore = useSceneStore();
const fileInput = ref<HTMLInputElement>();
const currentImage = ref<string>('');
const configScope = ref<'current' | 'global'>('current');

const gridStyle = reactive({
  fill: 'none',
  stroke: '#000000',
  strokeOpacity: 0.15,
  strokeWidth: 5,
  backgroundScale: 1
});

const presets = [
  {
    name: '默认网格',
    style: {
      fill: 'none',
      stroke: '#000000',
      strokeOpacity: 0.15,
      strokeWidth: 5
    }
  },
  {
    name: '淡蓝网格',
    style: {
      fill: '#f0f8ff',
      stroke: '#4169e1',
      strokeOpacity: 0.3,
      strokeWidth: 2
    }
  },
  {
    name: '米白背景',
    style: {
      fill: '#faf0e6',
      stroke: '#deb887',
      strokeOpacity: 0.5,
      strokeWidth: 1
    }
  },
  {
    name: '透明网格',
    style: {
      fill: 'transparent',
      stroke: '#cccccc',
      strokeOpacity: 0.2,
      strokeWidth: 1
    }
  }
];

onMounted(() => {
  // 从store中获取当前配置
  loadCurrentConfig();
});

const loadCurrentConfig = () => {
  if (configScope.value === 'current') {
    const currentConfig = sceneStore.getGroundConfig();
    if (currentConfig) {
      // 逐个属性更新以确保响应式更新
      gridStyle.fill = currentConfig.fill || 'none';
      gridStyle.stroke = currentConfig.stroke || '#000000';
      gridStyle.strokeOpacity = currentConfig.strokeOpacity ?? 0.15;
      gridStyle.strokeWidth = currentConfig.strokeWidth ?? 5;
      gridStyle.backgroundScale = currentConfig.backgroundScale ?? 1;

      if (currentConfig.backgroundImage) {
        currentImage.value = currentConfig.backgroundImage;
      } else {
        currentImage.value = '';
      }
    }
  } else {
    const globalConfig = sceneStore.getGlobalGroundConfig();
    if (globalConfig && Object.keys(globalConfig).length > 0) {
      // 逐个属性更新以确保响应式更新
      gridStyle.fill = globalConfig.fill || 'none';
      gridStyle.stroke = globalConfig.stroke || '#000000';
      gridStyle.strokeOpacity = globalConfig.strokeOpacity ?? 0.15;
      gridStyle.strokeWidth = globalConfig.strokeWidth ?? 5;
      gridStyle.backgroundScale = globalConfig.backgroundScale ?? 1;

      if (globalConfig.backgroundImage) {
        currentImage.value = globalConfig.backgroundImage;
      } else {
        currentImage.value = '';
      }
    }
  }
};

const onScopeChange = () => {
  // 切换配置范围时重新加载配置
  loadCurrentConfig();
};

const openFileDialog = () => {
  fileInput.value?.click();
};

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    processImageFile(file);
  }
};

const handleImageDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    processImageFile(file);
  }
};

const processImageFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    currentImage.value = result;
    updateGroundConfig();
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  currentImage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  updateGroundConfig();
};

const updateGridStyle = () => {
  updateGroundConfig();
};

const updateGroundConfig = (reset?: boolean) => {
  const config = {
    ...gridStyle,
    backgroundImage: currentImage.value || undefined
  };

  if (configScope.value === 'current') {
    if (reset) {
      sceneStore.setGroundConfig({});
    } else {
      sceneStore.setGroundConfig(config);
    }
  } else {
    sceneStore.setGlobalGroundConfig(config);
  }
};

const applyPreset = (preset: (typeof presets)[0]) => {
  // 逐个属性更新以确保响应式更新
  gridStyle.fill = preset.style.fill;
  gridStyle.stroke = preset.style.stroke;
  gridStyle.strokeOpacity = preset.style.strokeOpacity;
  gridStyle.strokeWidth = preset.style.strokeWidth;
  updateGroundConfig();
};

const applyGlobalConfig = () => {
  const globalConfig = sceneStore.getGlobalGroundConfig();
  if (globalConfig) {
    // 逐个属性更新以确保响应式更新
    gridStyle.fill = globalConfig.fill || 'none';
    gridStyle.stroke = globalConfig.stroke || '#000000';
    gridStyle.strokeOpacity = globalConfig.strokeOpacity ?? 0.15;
    gridStyle.strokeWidth = globalConfig.strokeWidth ?? 5;
    gridStyle.backgroundScale = globalConfig.backgroundScale ?? 1;

    // 如果全局配置有背景图片，也应用到当前场景
    if (globalConfig.backgroundImage) {
      currentImage.value = globalConfig.backgroundImage;
    } else {
      currentImage.value = '';
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }

    // 将配置保存到当前场景
    updateGroundConfig();
  }
};

const resetToDefault = () => {
  // 逐个属性重置为默认值以确保响应式更新
  gridStyle.fill = 'none';
  gridStyle.stroke = '#000000';
  gridStyle.strokeOpacity = 0.15;
  gridStyle.strokeWidth = 5;
  gridStyle.backgroundScale = 1;

  currentImage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  updateGroundConfig();
};
</script>

<style scoped>
.ground-config {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ground-config-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.ground-config-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.ground-config-content {
  padding: 20px;
}

.config-section {
  margin-bottom: 24px;
}

.config-label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.scope-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.scope-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.scope-option input[type='radio'] {
  margin: 0;
}

.scope-hint {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.image-upload-area {
  margin-bottom: 16px;
}

.file-input {
  display: none;
}

.upload-zone {
  border: 2px dashed #d0d7de;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
}

.upload-zone:hover {
  border-color: #1e5bd6;
  background: #f6f8fa;
}

.upload-placeholder {
  color: #656d76;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #888;
}

.image-preview {
  position: relative;
}

.image-preview img {
  max-width: 100%;
  max-height: 120px;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
}

.image-actions {
  margin-top: 8px;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: #c82333;
}

.style-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.style-row label {
  min-width: 80px;
  font-size: 14px;
  color: #555;
}

.style-row input[type='color'] {
  width: 40px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.style-row input[type='range'] {
  flex: 1;
  margin: 0 8px;
}

.value-display {
  min-width: 40px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.preset-btn {
  padding: 8px 12px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: #f6f8fa;
  border-color: #1e5bd6;
}

.apply-global-btn {
  width: 100%;
  padding: 10px;
  background: #0969da;
  border: 1px solid #0969da;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: white;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.apply-global-btn:hover {
  background: #0860ca;
  border-color: #0860ca;
}

.apply-hint {
  font-size: 12px;
  color: #666;
  text-align: center;
  font-style: italic;
}

.reset-btn {
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background: #e9ecef;
}

/***** 地板缩放样式 *****/
.value-display {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}
</style>
