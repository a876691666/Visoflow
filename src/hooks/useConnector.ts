import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import { useSceneStore } from '@/stores/sceneStore';

export const useConnector = (id: string) => {
  const sceneStore = useSceneStore();
  const connector = ref<any>(null);

  const updateConnector = () => {
    const connectors = Object.values(sceneStore.connectors || {});
    connector.value = getItemByIdOrThrow(connectors, id).value;
  };

  // 监听id和connectors变化
  watch([() => id, () => sceneStore.connectors], updateConnector, {
    immediate: true,
    deep: true
  });

  return connector;
};
