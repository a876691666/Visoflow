import { updateState } from 'src/utils/reactivity';
import {
  ConnectorAnchor,
  SceneConnector,
  ModeActions,
  ModeActionsAction,
  Coords,
  View
} from 'src/types';
import {
  getItemAtTile,
  hasMovedTile,
  getAnchorAtTile,
  getItemByIdOrThrow,
  generateId,
  CoordsUtils,
  getAnchorTile,
  connectorPathTileToGlobal
} from 'src/utils';
import { useSceneStore } from 'src/stores/provider';
import { syncConnector } from 'src/stores/reducers/connector';

const getAnchorOrdering = (
  anchor: ConnectorAnchor,
  connector: SceneConnector,
  view: View
) => {
  const anchorTile = getAnchorTile(anchor, view);

  let bestT = 0; // 段内参数 [0,1]
  let index = connector.path.tiles.findIndex((pathTile) => {
    const globalTile = connectorPathTileToGlobal(
      pathTile,
      connector.path.rectangle.from
    );
    return CoordsUtils.isEqual(globalTile, anchorTile);
  });

  if (index === -1) {
    // 将路径点转换为全局坐标
    const globalPathPoints: Coords[] = connector.path.tiles.map((pathTile) =>
      connectorPathTileToGlobal(pathTile, connector.path.rectangle.from)
    );

    // 1) 若锚点正好落在路径顶点，直接返回该顶点索引（与旧逻辑保持兼容）
    const vertexIndex = globalPathPoints.findIndex((p) =>
      CoordsUtils.isEqual(p, anchorTile)
    );
    if (vertexIndex !== -1) return vertexIndex;

    // 2) 否则计算点到每个线段的最短距离，选最近线段
    // 若不足两点，无法构成线段
    if (globalPathPoints.length < 2) {
      throw new Error(
        'Connector path has insufficient points to form segments.'
      );
    }

    let bestDist2 = Number.POSITIVE_INFINITY;

    for (let i = 0; i < globalPathPoints.length - 1; i++) {
      const a = globalPathPoints[i];
      const b = globalPathPoints[i + 1];

      // 向量运算
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const wx = anchorTile.x - a.x;
      const wy = anchorTile.y - a.y;

      const vv = vx * vx + vy * vy; // |v|^2
      // 退化线段（重合点）
      if (vv === 0) {
        const dx = anchorTile.x - a.x;
        const dy = anchorTile.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist2) {
          bestDist2 = d2;
          index = i;
          bestT = 0; // 落在点 a
        }
        continue;
      }

      // 投影参数 t = (w·v)/|v|^2 ，并裁剪到 [0,1]
      const tRaw = (wx * vx + wy * vy) / vv;
      const t = Math.max(0, Math.min(1, tRaw));

      // 最近点 P = a + t*v
      const px = a.x + t * vx;
      const py = a.y + t * vy;

      const dx = anchorTile.x - px;
      const dy = anchorTile.y - py;
      const d2 = dx * dx + dy * dy;

      if (d2 < bestDist2) {
        bestDist2 = d2;
        index = i;
        bestT = t;
      }
    }
  }

  if (index === -1) {
    throw new Error(
      `Could not calculate ordering index of anchor [anchorId: ${anchor.id}]`
    );
  }

  // 返回连续可排序的序号：段索引 + 段内比例
  return index + bestT;
};

const getAnchor = (
  connectorId: string,
  tile: Coords,
  scene: ReturnType<typeof useSceneStore>
) => {
  const connector = getItemByIdOrThrow(
    scene.connectors.value,
    connectorId
  ).value;
  const anchor = getAnchorAtTile(tile, connector.anchors);

  if (!anchor) {
    const newAnchor: ConnectorAnchor = {
      id: generateId(),
      ref: { tile }
    };

    const orderedAnchors = [...connector.anchors, newAnchor]
      .map((anch) => {
        return {
          ...anch,
          ordering: getAnchorOrdering(anch, connector, scene.getCurrentView()!)
        };
      })
      .sort((a, b) => {
        return a.ordering - b.ordering;
      });

    scene.updateConnector(connector.id, { anchors: orderedAnchors });
    syncConnector(connector.id, scene);
    return newAnchor;
  }

  return anchor;
};

const mousedown: ModeActionsAction = ({
  uiState,
  scene,
  isRendererInteraction
}) => {
  if (uiState.mode.type !== 'CURSOR' || !isRendererInteraction) return;

  const itemAtTile = getItemAtTile({
    tile: uiState.mouse.position.tile,
    scene
  });

  if (itemAtTile) {
    uiState.mode.mousedownItem = itemAtTile;
    uiState.setMode(uiState.mode);
    uiState.setItemControls(itemAtTile);
  } else {
    uiState.mode.mousedownItem = null;
    uiState.setMode(uiState.mode);
    uiState.setItemControls(null);
  }
};

export const Cursor: ModeActions = {
  entry: (state) => {
    const { uiState } = state;

    if (uiState.mode.type !== 'CURSOR') return;

    if (uiState.mode.mousedownItem) {
      mousedown(state);
    }
  },
  mousemove: ({ scene, uiState }) => {
    if (uiState.mode.type !== 'CURSOR' || !hasMovedTile(uiState.mouse)) return;

    let item = uiState.mode.mousedownItem;

    if (item?.type === 'CONNECTOR' && uiState.mouse.mousedown) {
      const anchor = getAnchor(item.id, uiState.mouse.mousedown.tile, scene);

      item = {
        type: 'CONNECTOR_ANCHOR',
        id: anchor.id
      };
    }

    if (item) {
      uiState.setMode({
        type: 'DRAG_ITEMS',
        showCursor: true,
        items: [item],
        isInitialMovement: true
      });
    }
  },
  mousedown,
  mouseup: ({ uiState, isRendererInteraction }) => {
    if (uiState.mode.type !== 'CURSOR' || !isRendererInteraction) return;

    if (uiState.mode.mousedownItem) {
      if (uiState.mode.mousedownItem.type === 'ITEM') {
        uiState.setItemControls({
          type: 'ITEM',
          id: uiState.mode.mousedownItem.id
        });
      } else if (uiState.mode.mousedownItem.type === 'RECTANGLE') {
        uiState.setItemControls({
          type: 'RECTANGLE',
          id: uiState.mode.mousedownItem.id
        });
      } else if (uiState.mode.mousedownItem.type === 'CONNECTOR') {
        uiState.setItemControls({
          type: 'CONNECTOR',
          id: uiState.mode.mousedownItem.id
        });
      } else if (uiState.mode.mousedownItem.type === 'TEXTBOX') {
        uiState.setItemControls({
          type: 'TEXTBOX',
          id: uiState.mode.mousedownItem.id
        });
      }
    } else {
      uiState.setItemControls(null);
    }

    uiState.setMode(
      updateState(uiState.mode, (draft) => {
        draft.mousedownItem = null;
      })
    );
  }
};
