import { Model, Scene } from 'src/types';
import type * as viewReducers from './view';
import type * as connectorReducers from './connector';
import type * as layerOrderingReducers from './layerOrdering';

export interface State {
  model: Model;
  scene: Scene;
}

export interface ViewReducerContext {
  viewId: string;
  state: State;
}

type ViewReducerAction =
  | {
      action: 'CREATE_VIEW';
      payload: Parameters<typeof viewReducers.createView>[0];
    }
  | {
      action: 'UPDATE_VIEW';
      payload: Parameters<typeof viewReducers.updateView>[0];
    }
  | {
      action: 'DELETE_VIEW';
      payload: undefined;
    }
  | {
      action: 'SYNC_CONNECTOR';
      payload: Parameters<typeof connectorReducers.syncConnector>[0];
    }
  | {
      action: 'CHANGE_LAYER_ORDER';
      payload: Parameters<typeof layerOrderingReducers.changeLayerOrder>[0];
    };

export type ViewReducerParams = ViewReducerAction & { ctx: ViewReducerContext };
