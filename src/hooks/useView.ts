import { useUiStateStore } from 'src/stores/uiStateStore';
import { useSceneStore } from 'src/stores/sceneStore';
import * as reducers from 'src/stores/reducers';
import { Model } from 'src/types';
import { INITIAL_SCENE_STATE } from 'src/config';

export const useView = () => {
  const uiStateStore = useUiStateStore();
  const sceneStore = useSceneStore();

  const changeView = (viewId: string, model: Model) => {
    const newState = reducers.view({
      action: 'SYNC_SCENE',
      payload: undefined,
      ctx: { viewId, state: { model, scene: INITIAL_SCENE_STATE } }
    });

    sceneStore.updateConnectors(newState.scene.connectors);
    sceneStore.updateTextBoxes(newState.scene.textBoxes);
    uiStateStore.setView(viewId);
  };

  return {
    changeView
  };
};
