import { ref, watch } from 'vue';
import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import { useSceneStore } from 'src/stores/provider';

export const useRectangle = (id: string) => {
  const sceneStore = useSceneStore();
  const uiStateStore = useIsoflowUiStateStore<any>();
  const rectangle = ref<any>(null);

  const updateRectangle = () => {
    rectangle.value = sceneStore.getRectangle(id) || null;
  };

  watch([() => uiStateStore.view, sceneStore.rectangles], updateRectangle, {
    immediate: true
  });

  return rectangle;
};
