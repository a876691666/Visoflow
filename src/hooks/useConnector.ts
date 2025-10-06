import { ref, watch } from 'vue';
import { useSceneStore } from 'src/stores/provider';

export const useConnector = (id: string) => {
  const sceneStore = useSceneStore();
  const connector = ref<any>(null);

  const updateConnector = () => {
    connector.value = sceneStore.getConnector(id) || null;
  };

  watch([sceneStore.connectors], updateConnector, {
    immediate: true
  });

  return connector;
};
