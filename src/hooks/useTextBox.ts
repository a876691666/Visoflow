import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import { useModelStore } from '@/stores/modelStore';
import { useUiStateStore } from '@/stores/uiStateStore';
import { useSceneStore } from '@/stores/sceneStore';

export const useTextBox = (id: string) => {
  const modelStore = useModelStore();
  const uiStateStore = useUiStateStore();
  const sceneStore = useSceneStore();
  const textBox = ref<any>(null);

  const updateTextBox = () => {
    try {
      // 获取当前视图的文本框
      const currentViewId = uiStateStore.view;
      const currentView = getItemByIdOrThrow(
        modelStore.views || [],
        currentViewId
      ).value;
      const textBoxes = currentView.textBoxes || [];

      const viewTextBox = getItemByIdOrThrow(textBoxes, id).value;
      const sceneTextBox = sceneStore.textBoxes[id];

      // 合并视图和场景数据
      textBox.value = {
        ...viewTextBox,
        ...sceneTextBox
      };
    } catch (error) {
      console.warn(`TextBox with id ${id} not found`);
      textBox.value = null;
    }
  };

  // 监听id和相关状态变化
  watch(
    [
      () => id,
      () => uiStateStore.view,
      () => modelStore.views,
      () => sceneStore.textBoxes
    ],
    updateTextBox,
    {
      immediate: true,
    }
  );

  return textBox;
};
