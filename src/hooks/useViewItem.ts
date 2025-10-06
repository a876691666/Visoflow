import { useSceneStore } from 'src/stores/provider';

export const useViewItem = () => {
  const sceneStore = useSceneStore();

  return sceneStore.items;
};
