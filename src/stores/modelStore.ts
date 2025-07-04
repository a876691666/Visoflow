import { defineStore } from 'pinia'
import { ModelStore } from 'src/types'
import { INITIAL_DATA } from 'src/config'

export const useModelStore = defineStore('model', {
  state: (): Omit<ModelStore, 'actions'> => ({
    ...INITIAL_DATA
  }),
  
  actions: {
    updateState(newState: Partial<ModelStore>) {
      Object.assign(this, newState)
    }
  }
})