import { ref, watch } from 'vue';
import { getItemByIdOrThrow } from '@/utils';
import { useIsoflowSceneStore } from 'src/context/isoflowContext';

export const useConnector = (id: string) => {
  const sceneStore = useIsoflowSceneStore<any>();
  const connector = ref<any>(null);

  const updateConnector = () => {
    const connectors = Object.values(sceneStore.connectors || {}) as any[];
    connector.value = getItemByIdOrThrow<any>(connectors, id).value;
  };

  // 监听id和connectors变化
  watch([() => id, () => sceneStore.connectors], updateConnector, {
    immediate: true,
    deep: true
  });

  return connector;
};
