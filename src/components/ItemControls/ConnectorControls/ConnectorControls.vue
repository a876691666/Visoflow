<template>
  <ControlsContainer>
    <Section>
      <div class="input-group">
        <label class="input-label" :style="labelStyles">Description</label>
        <input
          class="text-input"
          :style="inputStyles"
          :value="connectorData.description"
          @input="handleDescriptionChange"
        />
      </div>
    </Section>

    <Section>
      <ColorSelector
        :active-color="connectorData.color"
        @change="handleColorChange"
      />
    </Section>

    <Section title="Width">
      <div class="slider-container">
        <input
          type="range"
          min="10"
          max="30"
          step="10"
          :value="connectorData.width"
          @input="handleWidthChange"
          class="slider"
          :style="sliderStyles"
        />
        <span class="slider-value">{{ connectorData.width }}px</span>
      </div>
    </Section>

    <Section title="Style">
      <select
        class="select-input"
        :style="selectStyles"
        :value="connectorData.style"
        @change="handleStyleChange"
      >
        <option v-for="style in styleOptions" :key="style" :value="style">
          {{ style }}
        </option>
      </select>
    </Section>

    <Section>
      <DeleteButton @click="handleDelete" />
    </Section>
  </ControlsContainer>
</template>

<script setup lang="ts">
import { ref, watch, type CSSProperties } from 'vue';
import { useSceneStore } from '@/stores/sceneStore';
import { useUiStateStore } from '@/stores/uiStateStore';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import ColorSelector from '@/components/ColorSelector/ColorSelector.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();

const sceneStore = useSceneStore();
const uiStateStore = useUiStateStore();

const connectorData = ref<any>({
  description: '',
  color: '',
  width: 20,
  style: 'solid'
});

const styleOptions = ref(['solid', 'dashed', 'dotted']);

const labelStyles = ref<CSSProperties>({});
const inputStyles = ref<CSSProperties>({});
const sliderStyles = ref<CSSProperties>({});
const selectStyles = ref<CSSProperties>({});

const updateStyles = () => {
  labelStyles.value = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
    display: 'block'
  };

  inputStyles.value = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  sliderStyles.value = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#ddd',
    outline: 'none'
  };

  selectStyles.value = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white'
  };
};

const updateConnectorData = () => {
  // 从store获取connector数据
  const connector = sceneStore.connectors?.[props.id];
  if (connector) {
    connectorData.value = { ...connector };
  }
};

const handleDescriptionChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const description = target.value;
  updateConnector({ description });
};

const handleColorChange = (color: string) => {
  updateConnector({ color });
};

const handleWidthChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const width = parseInt(target.value);
  updateConnector({ width });
};

const handleStyleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const style = target.value;
  updateConnector({ style });
};

const updateConnector = (updates: any) => {
  // 更新本地数据
  connectorData.value = { ...connectorData.value, ...updates };

  // 更新store中的数据
  sceneStore.updateConnectors({
    [props.id]: { ...connectorData.value, ...updates }
  });
};

const handleDelete = () => {
  uiStateStore.setItemControls(null);
  sceneStore.removeConnector(props.id);
};

// 监听ID变化
watch(() => props.id, updateConnectorData, { immediate: true });

// 初始化样式
updateStyles();
</script>

<style scoped>
.input-group {
  margin-bottom: 16px;
}

.input-label {
  /* 输入标签样式 */
}

.text-input {
  /* 文本输入样式 */
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
  /* 滑块样式 */
}

.slider-value {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.select-input {
  /* 选择器样式 */
}

.select-input:focus {
  border-color: #1976d2;
  outline: none;
}
</style>
