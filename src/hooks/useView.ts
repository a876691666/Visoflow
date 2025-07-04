import { Model } from 'src/types'
import { useUiStateStore } from 'src/stores/uiStateStore'
import { useSceneStore } from 'src/stores/sceneStore'
import * as reducers from 'src/stores/reducers'
import { INITIAL_SCENE_STATE } from 'src/config'

export const useView = () => {
  const uiStateStore = useUiStateStore()
  const sceneStore = useSceneStore()

  const changeView = (viewId: string, model: Model) => {
    const newState = reducers.view({
      action: 'SYNC_SCENE',
      payload: undefined,
      ctx: { viewId, state: { model, scene: INITIAL_SCENE_STATE } }
    })

    sceneStore.set(newState.scene)
    uiStateStore.setView(viewId)
  }

  return {
    changeView
  }
}
