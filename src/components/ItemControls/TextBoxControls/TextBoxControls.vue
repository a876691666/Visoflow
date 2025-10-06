<template>
  <ControlsContainer>
    <Section>
      <div class="input-group">
        <label class="input-label">Text Content</label>
        <textarea
          class="text-input"
          :value="textBox?.content || ''"
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
          max="3"
          step="0.1"
          :value="textBox?.fontSize ?? 0.3"
          @input="handleFontSizeChange"
          class="slider"
        />
        <span class="slider-value">{{
          (textBox?.fontSize ?? 0.3).toFixed(1)
        }}</span>
      </div>
    </Section>

    <Section title="框高度">
      <div class="slider-container">
        <input
          type="range"
          min="12"
          max="500"
          step="1"
          :value="textBox?.containerStyle?.height ?? 100"
          @input="handleContainerHeightChange"
          class="slider"
        />
        <span class="slider-value">{{
          (textBox?.containerStyle?.height ?? 100).toFixed(0)
        }}</span>
      </div>
    </Section>

    <Section title="Alignment">
      <div class="toggle-group">
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.X
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.X)"
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
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.Y
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.Y)"
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
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.DX
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.DX)"
        >
          <svg
            class="orientation-icon"
            :style="dxOrientationStyles"
            viewBox="0 0 24 24"
          >
            <path
              d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
            />
          </svg>
        </button>
        <button
          class="toggle-button"
          :class="{
            active: textBox?.orientation === ProjectionOrientationEnum.DY
          }"
          @click="() => handleOrientationChange(ProjectionOrientationEnum.DY)"
        >
          <svg
            class="orientation-icon"
            :style="dyOrientationStyles"
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
import { computed, type CSSProperties } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useTextBox } from 'src/hooks/useTextBox';
import { getIsoProjectionCss } from 'src/utils';
import { ProjectionOrientationEnum } from 'src/types';
import ControlsContainer from '../components/ControlsContainer.vue';
import Section from '../components/Section.vue';
import DeleteButton from '../components/DeleteButton.vue';
import { useSceneStore } from 'src/stores/provider';
import { syncTextBox } from 'src/stores/reducers/textBox';

interface Props {
  id: string;
}

const props = defineProps<Props>();
const uiStateStore = useIsoflowUiStateStore<any>();
const sceneStore = useSceneStore();
const textBoxRef = useTextBox(props.id);

const textBox = computed(() => textBoxRef.value);

const xOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.X),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));

const yOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.Y),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));
const dxOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.DX).replace(
    '-100%',
    '0%'
  ),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));
const dyOrientationStyles = computed<CSSProperties>(() => ({
  transform: getIsoProjectionCss(ProjectionOrientationEnum.DY).replace(
    '-100%',
    '0%'
  ),
  width: '16px',
  height: '16px',
  fill: 'currentColor'
}));

const handleContentChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLTextAreaElement;
  const content = target.value;
  sceneStore.updateTextBox(textBox.value.id, { content });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleFontSizeChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const fontSize = parseFloat(target.value);
  sceneStore.updateTextBox(textBox.value.id, { fontSize });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleContainerHeightChange = (event: Event) => {
  if (!textBox.value) return;
  const target = event.target as HTMLInputElement;
  const containerHeight = parseFloat(target.value);
  sceneStore.updateTextBox(textBox.value.id, {
    containerStyle: {
      ...textBox.value.containerStyle,
      height: containerHeight
    }
  });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleOrientationChange = (
  orientation: keyof typeof ProjectionOrientationEnum
) => {
  if (!textBox.value) return;
  if (textBox.value.orientation === orientation) return;
  sceneStore.updateTextBox(textBox.value.id, { orientation });
  syncTextBox(textBox.value.id, sceneStore);
};

const handleDelete = () => {
  if (!textBox.value) return;
  uiStateStore.setItemControls(null);
  sceneStore.removeTextBox(textBox.value.id);
};
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
.orientation-label {
  font-size: 12px;
  font-weight: 600;
}
</style>
