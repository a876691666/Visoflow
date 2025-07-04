import { ModelStore, UiStateStore, Size } from 'src/types';
// import { useScene } from 'src/composables/useScene';

export interface State {
  model: ModelStore;
  scene: any; // TODO: Replace with proper Scene type
  uiState: UiStateStore;
  rendererRef: HTMLElement;
  rendererSize: Size;
  isRendererInteraction: boolean;
}

export type ModeActionsAction = (state: State) => void;

export type ModeActions = {
  entry?: ModeActionsAction;
  exit?: ModeActionsAction;
  mousemove?: ModeActionsAction;
  mousedown?: ModeActionsAction;
  mouseup?: ModeActionsAction;
};
