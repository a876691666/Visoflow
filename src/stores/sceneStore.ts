import { defineStore } from 'pinia'
import { SceneStore } from 'src/types'

export const useSceneStore = defineStore('scene', {
  state: (): Omit<SceneStore, 'actions'> => ({
    connectors: {},
    textBoxes: {}
  }),
  
  actions: {
    updateState(newState: Partial<SceneStore>) {
      Object.assign(this, newState)
    }
  }
})