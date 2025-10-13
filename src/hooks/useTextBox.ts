import { ref, watch, isRef } from 'vue';
import { useSceneStore } from 'src/stores/provider';

// 允许传入字符串、Ref 或 Getter，使父级 id 改变时能够联动
type IdSource = string | { value: string } | (() => string);

export const useTextBox = (idSource: IdSource) => {
  const sceneStore = useSceneStore();
  const textBox = ref<any>(null);

  const getId = (): string => {
    if (typeof idSource === 'function') return (idSource as () => string)();
    if (isRef(idSource)) return (idSource as any).value as string;
    return idSource as string;
  };

  const updateTextBox = () => {
    const id = getId();
    textBox.value = sceneStore.getTextBox(id) || null;
  };

  watch([() => getId(), sceneStore.textBoxs], updateTextBox, {
    immediate: true
  });

  return textBox;
};
