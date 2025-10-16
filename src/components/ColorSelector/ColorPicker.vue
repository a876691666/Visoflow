<template>
  <div class="color-picker">
    <PanelColorPicker :value="value" @change="handlePicked" />
  </div>
</template>

<script setup lang="ts">
import PanelColorPicker from 'src/components/PanelConrols/PanelColorPicker.vue';

interface Props {
  value?: string;
  onChange?: (color: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  value: '#000000',
  onChange: undefined
});

const emit = defineEmits<{
  change: [color: string];
}>();

const handlePicked = (color: string) => {
  props.onChange?.(color);
  emit('change', color);
};
</script>

<style scoped>
.color-picker {
  position: relative;
  display: inline-block;
}
</style>
