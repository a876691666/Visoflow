import {
  generateId,
  getItemAtTile,
  hasMovedTile,
  setWindowCursor
} from 'src/utils';
import { ModeActions, Connector as ConnectorI } from 'src/types';
import { syncConnector } from 'src/stores/reducers/connector';

export const Connector: ModeActions = {
  entry: () => {
    setWindowCursor('crosshair');
  },
  exit: () => {
    setWindowCursor('default');
  },
  mousemove: ({ uiState, scene }) => {
    if (
      uiState.mode.type !== 'CONNECTOR' ||
      !uiState.mode.id ||
      !hasMovedTile(uiState.mouse)
    )
      return;

    const connector = scene.getConnector(uiState.mode.id)!;

    const itemAtTile = getItemAtTile({
      tile: uiState.mouse.position.tile,
      scene
    });

    if (itemAtTile?.type === 'ITEM') {
      connector.anchors[1] = { id: generateId(), ref: { item: itemAtTile.id } };

      scene.updateConnector(uiState.mode.id, connector);
      syncConnector(connector.id, scene);
    } else {
      connector.anchors[1] = {
        id: generateId(),
        ref: { tile: uiState.mouse.position.tile }
      };

      scene.updateConnector(uiState.mode.id, connector);
      syncConnector(connector.id, scene);
    }
  },
  mousedown: ({ uiState, scene, isRendererInteraction }) => {
    if (uiState.mode.type !== 'CONNECTOR' || !isRendererInteraction) return;

    const newConnector: ConnectorI = {
      id: generateId(),
      color: scene.colors.value[0].id,
      anchors: []
    };

    const itemAtTile = getItemAtTile({
      tile: uiState.mouse.position.tile,
      scene
    });

    if (itemAtTile && itemAtTile.type === 'ITEM') {
      newConnector.anchors = [
        { id: generateId(), ref: { item: itemAtTile.id } },
        { id: generateId(), ref: { item: itemAtTile.id } }
      ];
    } else {
      newConnector.anchors = [
        { id: generateId(), ref: { tile: uiState.mouse.position.tile } },
        { id: generateId(), ref: { tile: uiState.mouse.position.tile } }
      ];
    }

    scene.addConnector(newConnector as any);
    syncConnector(newConnector.id, scene);

    uiState.setMode({
      type: 'CONNECTOR',
      showCursor: true,
      id: newConnector.id
    });
  },
  mouseup: ({ uiState, scene }) => {
    if (uiState.mode.type !== 'CONNECTOR' || !uiState.mode.id) return;

    const connector = scene.getConnector(uiState.mode.id);
    if (connector) {
      const firstAnchor = connector.anchors[0];
      const lastAnchor = connector.anchors[connector.anchors.length - 1];

      if (
        connector.path.tiles.length < 2 ||
        !(firstAnchor.ref.item && lastAnchor.ref.item)
      ) {
        scene.removeConnector(uiState.mode.id);
      }

      scene.updateConnector(uiState.mode.id, connector);
      syncConnector(connector.id, scene);
    }

    uiState.setMode({
      type: 'CURSOR',
      showCursor: true,
      mousedownItem: null
    });
  }
};
