import { useIsoflowUiStateStore } from 'src/context/isoflowContext';
import * as reducers from 'src/stores/reducers';
import { Model } from 'src/types';
import { INITIAL_SCENE_STATE } from 'src/config';

export const useView = () => {
  const uiStateStore = useIsoflowUiStateStore<any>();

  const changeView = (viewId: string, model: Model) => {
    reducers.view({
      action: 'SYNC_SCENE',
      payload: undefined,
      ctx: { viewId, state: { model, scene: INITIAL_SCENE_STATE } }
    });

    uiStateStore.setView(viewId);
  };

  return {
    changeView
  };
};
