import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import {
  useIsoflowModelStore,
  useIsoflowSceneStore,
  useIsoflowUiStateStore
} from 'src/context/isoflowContext';

export const useTextBox = (id: string) => {
  const modelStore = useIsoflowModelStore<any>();
  const uiStateStore = useIsoflowUiStateStore<any>();
  const sceneStore = useIsoflowSceneStore<any>();
  const textBox = ref<any>(null);

  const updateTextBox = () => {
    try {
      // 获取当前视图的文本框
      const currentViewId = uiStateStore.view;
      const currentView = getItemByIdOrThrow(
        modelStore.views || [],
        currentViewId
      ).value;
      const textBoxes = (currentView as any).textBoxes || [];

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
      immediate: true
    }
  );

  return textBox;
};
