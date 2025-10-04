<template>
  <ControlsContainer>
    <Section>
      <div class="input-group">
        <label class="input-label">Text Content</label>
        <textarea
          class="text-input"
          :value="textBoxData.content"
          @input="handleContentChange"
          rows="3"
        />
      </div>
    </Section>

    <Section title="Text size">
      <div class="slider-container">
        <input
          type="range"
          min="0.3"
          max="0.9"
          step="0.1"
          :value="textBoxData.fontSize"
          @input="handleFontSizeChange"
          class="slider"
        />
        <span class="slider-value">{{ textBoxData.fontSize }}</span>
      </div>
    </Section>

    <Section title="Alignment">
      <div class="toggle-group">
        <button
          class="toggle-button"
          :class="{ active: textBoxData.orientation === 'X' }"
          @click="() => handleOrientationChange('X')"
        >
          <svg
            class="orientation-icon"
            :style="xOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
        <button
          class="toggle-button"
          :class="{ active: textBoxData.orientation === 'Y' }"
          @click="() => handleOrientationChange('Y')"
        >
          <svg
            class="orientation-icon"
            :style="yOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
      </div>
    </Section>

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import {
  useIsoflowSceneStore,
  useIsoflowUiStateStore
} from 'src/context/isoflowContext';
import { useTextBox } from 'src/hooks/useTextBox';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const sceneStore = useIsoflowSceneStore<any>();
const uiStateStore = useIsoflowUiStateStore<any>();

const textBoxData = ref<any>({
  id: '',
  content: '',
  fontSize: 0.5,
  orientation: 'X'
});

const xOrientationStyles = ref<CSSProperties>({});
const yOrientationStyles = ref<CSSProperties>({});

const updateTextBoxData = () => {
  // 从store获取文本框数据
  const textBox = sceneStore.textBoxes?.[props.id];
  if (textBox) {
    textBoxData.value = { ...textBox };
  } else {
    // 使用composable获取数据
    const textBoxRef = useTextBox(props.id);
    if (textBoxRef.value) {
      textBoxData.value = textBoxRef.value as any;
    }
  }
};

const updateOrientationStyles = () => {
  // 简化的等距投影CSS
  const isoTransform = 'matrix(0.866, 0.5, -0.866, 0.5, 0, 0)';

  xOrientationStyles.value = {
    transform: isoTransform,
    width: '16px',
    height: '16px',
    fill: 'currentColor'
  };

  yOrientationStyles.value = {
    transform: `scale(-1, 1) ${isoTransform} scale(-1, 1)`,
    width: '16px',
    height: '16px',
    fill: 'currentColor'
  };
};

const handleContentChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const content = target.value;
  updateTextBox({ content });
};

const handleFontSizeChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const fontSize = parseFloat(target.value);
  updateTextBox({ fontSize });
};

const handleOrientationChange = (orientation: string) => {
  if (textBoxData.value.orientation === orientation) return;
  updateTextBox({ orientation });
};

const updateTextBox = (updates: any) => {
  // 更新本地数据
  textBoxData.value = { ...textBoxData.value, ...updates };

  // 更新store中的数据
  sceneStore.updateTextBoxes({
    [props.id]: { ...textBoxData.value, ...updates }
  });
};

const handleDelete = () => {
  uiStateStore.setItemControls(null);
  sceneStore.removeTextBox(props.id);
};

// 监听ID变化
watch(() => props.id, updateTextBoxData, { immediate: true });

// 初始化样式
updateOrientationStyles();
</script>

<style scoped>
.input-group {
  margin-bottom: 16px;
}

.input-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.text-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
}

.text-input:focus {
  border-color: #1976d2;
  outline: none;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #ddd;
  outline: none;
}

.slider-value {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-button:hover {
  background-color: #f5f5f5;
}

.toggle-button.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}

/* .orientation-icon intentionally inherits styles declared inline */
</style>
