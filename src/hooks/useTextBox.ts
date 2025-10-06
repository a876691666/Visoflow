import { ref, watch } from 'vue';
import { useSceneStore } from 'src/stores/provider';

export const useTextBox = (id: string) => {
  const sceneStore = useSceneStore();
  const textBox = ref<any>(null);

  const updateTextBox = () => {
    textBox.value = sceneStore.getTextBox(id) || null;
  };

  watch([() => id, sceneStore.textBoxs], updateTextBox, {
    immediate: true
  });

  return textBox;
};
