import {
  UNPROJECTED_TILE_SIZE,
  PROJECTED_TILE_SIZE,
  ZOOM_INCREMENT,
  MAX_ZOOM,
  MIN_ZOOM,
  TEXTBOX_PADDING,
  CONNECTOR_SEARCH_OFFSET,
  DEFAULT_FONT_FAMILY,
  TEXTBOX_DEFAULTS,
  TEXTBOX_FONT_WEIGHT,
  PROJECT_BOUNDING_BOX_PADDING
} from 'src/config';
import {
  Coords,
  TileOrigin,
  Connector,
  Size,
  Scroll,
  Mouse,
  ConnectorAnchor,
  ItemReference,
  Rect,
  ProjectionOrientationEnum,
  BoundingBox,
  TextBox,
  SlimMouseEvent,
  View,
  AnchorPosition
} from 'src/types';
import {
  CoordsUtils,
  SizeUtils,
  clamp,
  roundToOneDecimalPlace,
  findPath,
  toPx,
  getItemByIdOrThrow
} from 'src/utils';
import { useSceneStore } from 'src/stores/provider';

interface ScreenToIso {
  mouse: Coords;
  zoom: number;
  scroll: Scroll;
  rendererSize: Size;
}

// converts a mouse position to a tile position
export const screenToIso = ({
  mouse,
  zoom,
  scroll,
  rendererSize
}: ScreenToIso) => {
  const projectedTileSize = SizeUtils.multiply(PROJECTED_TILE_SIZE, zoom);
  const halfW = projectedTileSize.width / 2;
  const halfH = projectedTileSize.height / 2;

  const projectPosition = {
    x: -rendererSize.width * 0.5 + mouse.x - scroll.position.x,
    y: -rendererSize.height * 0.5 + mouse.y - scroll.position.y
  };

  const tile = {
    x: Math.floor(
      (projectPosition.x + halfW) / projectedTileSize.width -
        projectPosition.y / projectedTileSize.height
    ),
    y: -Math.floor(
      (projectPosition.y + halfH) / projectedTileSize.height +
        projectPosition.x / projectedTileSize.width
    )
  };

  return tile;
};

interface GetTilePosition {
  tile: Coords;
  origin?: TileOrigin;
}

export const getTilePosition = ({
  tile,
  origin = 'CENTER'
}: GetTilePosition) => {
  const halfW = PROJECTED_TILE_SIZE.width / 2;
  const halfH = PROJECTED_TILE_SIZE.height / 2;

  const position: Coords = {
    x: halfW * tile.x - halfW * tile.y,
    y: -(halfH * tile.x + halfH * tile.y)
  };

  switch (origin) {
    case 'TOP':
      return CoordsUtils.add(position, { x: 0, y: -halfH });
    case 'BOTTOM':
      return CoordsUtils.add(position, { x: 0, y: halfH });
    case 'LEFT':
      return CoordsUtils.add(position, { x: -halfW, y: 0 });
    case 'RIGHT':
      return CoordsUtils.add(position, { x: halfW, y: 0 });
    case 'CENTER':
    default:
      return position;
  }
};

type IsoToScreen = GetTilePosition & {
  rendererSize: Size;
};

export const isoToScreen = ({ tile, origin, rendererSize }: IsoToScreen) => {
  const position = getTilePosition({ tile, origin });

  return {
    x: position.x + rendererSize.width / 2,
    y: position.y + rendererSize.height / 2
  };
};

export const sortByPosition = (tiles: Coords[]) => {
  const xSorted = [...tiles];
  const ySorted = [...tiles];
  xSorted.sort((a, b) => {
    return a.x - b.x;
  });
  ySorted.sort((a, b) => {
    return a.y - b.y;
  });

  const highest = {
    byX: xSorted[xSorted.length - 1],
    byY: ySorted[ySorted.length - 1]
  };
  const lowest = { byX: xSorted[0], byY: ySorted[0] };

  const lowX = lowest.byX.x;
  const highX = highest.byX.x;
  const lowY = lowest.byY.y;
  const highY = highest.byY.y;

  return {
    byX: xSorted,
    byY: ySorted,
    highest,
    lowest,
    lowX,
    lowY,
    highX,
    highY
  };
};

// Returns a complete set of tiles that form a grid area (takes in any number of tiles to use points to encapsulate)
export const getGridSubset = (tiles: Coords[]) => {
  const { lowX, lowY, highX, highY } = sortByPosition(tiles);

  const subset = [];

  for (let x = lowX; x < highX + 1; x += 1) {
    for (let y = lowY; y < highY + 1; y += 1) {
      subset.push({ x, y });
    }
  }

  return subset;
};

export const isWithinBounds = (tile: Coords, bounds: Coords[]) => {
  const { lowX, lowY, highX, highY } = sortByPosition(bounds);

  return tile.x >= lowX && tile.x <= highX && tile.y >= lowY && tile.y <= highY;
};

// Returns the four corners of a grid that encapsulates all tiles
// passed in (at least 1 tile needed)
export const getBoundingBox = (
  tiles: Coords[],
  offset: Coords = CoordsUtils.zero()
): BoundingBox => {
  const { lowX, lowY, highX, highY } = sortByPosition(tiles);

  return [
    { x: lowX - offset.x, y: lowY - offset.y },
    { x: highX + offset.x, y: lowY - offset.y },
    { x: highX + offset.x, y: highY + offset.y },
    { x: lowX - offset.x, y: highY + offset.y }
  ];
};

export const getBoundingBoxSize = (boundingBox: Coords[]): Size => {
  const { lowX, lowY, highX, highY } = sortByPosition(boundingBox);

  return {
    width: highX - lowX + 1,
    height: highY - lowY + 1
  };
};

// transform: translate(0px, -0.816px) rotate(-30deg) skewX(30deg) scale(0.817, 0.707);
const isoProjectionBaseValues =
  'translate(0px, -0.816px) rotate(-30deg) skewX(30deg) scale(0.817, 0.707)';

// transform: translate(0px, -0.816px) rotate(30deg) skewX(-30deg) scale(0.817, 0.707);
const isoProjectionYValues =
  'translate(0px, -0.816px) rotate(30deg) skewX(-30deg) scale(0.817, 0.707)';

// transform: translate(0px, -100%) rotate(-30deg) skewX(330deg) scale(0.817, 0.707);
const isoProjectionDXValues =
  'translate(0px, -100%) rotate(-30deg) skewX(330deg) scale(0.817, 0.707)';

// transform: translate(0px, -100%) rotate(30deg) skewX(-330deg) scale(0.817, 0.707);
const isoProjectionDYValues =
  'translate(0px, -100%) rotate(30deg) skewX(-330deg) scale(0.817, 0.707)';

export const getIsoMatrix = (
  orientation?: keyof typeof ProjectionOrientationEnum
) => {
  switch (orientation) {
    case ProjectionOrientationEnum.Y:
      return isoProjectionYValues;
    case ProjectionOrientationEnum.DX:
      // Mirror horizontally from X orientation (flip a and c)
      return isoProjectionDXValues;
    case ProjectionOrientationEnum.DY:
      // Start from Y orientation, then mirror horizontally (flip a and c)
      return isoProjectionDYValues;
    case ProjectionOrientationEnum.X:
    default:
      return isoProjectionBaseValues;
  }
};

export const getIsoProjectionCss = (
  orientation?: keyof typeof ProjectionOrientationEnum
) => {
  const matrixTransformValues = getIsoMatrix(orientation);

  return matrixTransformValues;
};

export const getIsoProjectionOrigin = (
  orientation?: keyof typeof ProjectionOrientationEnum
) => {
  switch (orientation) {
    case ProjectionOrientationEnum.Y:
      return 'left top';
    case ProjectionOrientationEnum.DX:
      return 'left bottom';
    case ProjectionOrientationEnum.DY:
      return 'left bottom';
    case ProjectionOrientationEnum.X:
    default:
      return 'left top';
  }
};

export const getTranslateCSS = (translate: Coords = { x: 0, y: 0 }) => {
  return `translate(${translate.x}px, ${translate.y}px)`;
};

// 以屏幕视点中心为锚点的缩放（按钮加减）
export const incrementZoom = (zoom: number, scroll: Scroll) => {
  const newZoom = roundToOneDecimalPlace(
    clamp(zoom + ZOOM_INCREMENT, MIN_ZOOM, MAX_ZOOM)
  );
  const ratio = newZoom / (zoom || 1);
  const newScroll: Scroll = {
    position: {
      x: scroll.position.x * ratio,
      y: scroll.position.y * ratio
    },
    offset: scroll.offset
  };
  return { zoom: newZoom, scroll: newScroll };
};

export const decrementZoom = (zoom: number, scroll: Scroll) => {
  const newZoom = roundToOneDecimalPlace(
    clamp(zoom - ZOOM_INCREMENT, MIN_ZOOM, MAX_ZOOM)
  );
  const ratio = newZoom / (zoom || 1);
  const newScroll: Scroll = {
    position: {
      x: scroll.position.x * ratio,
      y: scroll.position.y * ratio
    },
    offset: scroll.offset
  };
  return { zoom: newZoom, scroll: newScroll };
};

interface GetMouse {
  interactiveElement: HTMLElement;
  zoom: number;
  scroll: Scroll;
  lastMouse: Mouse;
  mouseEvent: SlimMouseEvent;
  rendererSize: Size;
}

export const getMouse = ({
  interactiveElement,
  zoom,
  scroll,
  lastMouse,
  mouseEvent,
  rendererSize
}: GetMouse): Mouse => {
  const componentOffset = interactiveElement.getBoundingClientRect();
  const offset: Coords = {
    x: componentOffset?.left ?? 0,
    y: componentOffset?.top ?? 0
  };

  const { clientX, clientY } = mouseEvent;

  const mousePosition = {
    x: clientX - offset.x,
    y: clientY - offset.y
  };

  const newPosition: Mouse['position'] = {
    screen: mousePosition,
    tile: screenToIso({
      mouse: mousePosition,
      zoom,
      scroll,
      rendererSize
    })
  };

  const newDelta: Mouse['delta'] = {
    screen: CoordsUtils.subtract(newPosition.screen, lastMouse.position.screen),
    tile: CoordsUtils.subtract(newPosition.tile, lastMouse.position.tile)
  };

  const getMousedown = (): Mouse['mousedown'] => {
    switch (mouseEvent.type) {
      case 'mousedown':
        return newPosition;
      case 'mousemove':
        return lastMouse.mousedown;
      default:
        return null;
    }
  };

  const nextMouse: Mouse = {
    position: newPosition,
    delta: newDelta,
    mousedown: getMousedown()
  };

  return nextMouse;
};

export const getAllAnchors = (connectors: Connector[]) => {
  return connectors.reduce((acc, connector) => {
    return [...acc, ...connector.anchors];
  }, [] as ConnectorAnchor[]);
};

export const getAnchorTile = (anchor: ConnectorAnchor, view: View): Coords => {
  if (anchor.ref.item) {
    const viewItem = getItemByIdOrThrow(view.items, anchor.ref.item).value;
    return viewItem.tile;
  }

  if (anchor.ref.anchor) {
    const allAnchors = getAllAnchors(view.connectors ?? []);
    const nextAnchor = getItemByIdOrThrow(allAnchors, anchor.ref.anchor).value;

    return getAnchorTile(nextAnchor, view);
  }

  if (anchor.ref.tile) {
    return anchor.ref.tile;
  }

  throw new Error('Could not get anchor tile.');
};

interface NormalisePositionFromOrigin {
  position: Coords;
  origin: Coords;
}

export const normalisePositionFromOrigin = ({
  position,
  origin
}: NormalisePositionFromOrigin) => {
  return CoordsUtils.subtract(origin, position);
};

interface GetConnectorPath {
  anchors: ConnectorAnchor[];
  view: View;
}

export const getConnectorPath = ({
  anchors,
  view
}: GetConnectorPath): {
  tiles: Coords[];
  rectangle: Rect;
} => {
  if (anchors.length < 2)
    throw new Error(
      `Connector needs at least two anchors (receieved: ${anchors.length})`
    );

  const anchorPosition = anchors.map((anchor) => {
    return getAnchorTile(anchor, view);
  });

  const searchArea = getBoundingBox(anchorPosition, CONNECTOR_SEARCH_OFFSET);

  const sorted = sortByPosition(searchArea);
  const searchAreaSize = getBoundingBoxSize(searchArea);
  const rectangle = {
    from: { x: sorted.highX, y: sorted.highY },
    to: { x: sorted.lowX, y: sorted.lowY }
  };

  const positionsNormalisedFromSearchArea = anchorPosition.map((position) => {
    return normalisePositionFromOrigin({
      position,
      origin: rectangle.from
    });
  });

  const tiles = positionsNormalisedFromSearchArea.reduce<Coords[]>(
    (acc, position, i) => {
      if (i === 0) return acc;

      const prev = positionsNormalisedFromSearchArea[i - 1];
      const path = findPath({
        from: prev,
        to: position,
        gridSize: searchAreaSize
      });

      return [...acc, ...path];
    },
    []
  );

  return { tiles, rectangle };
};

type GetRectangleFromSize = (
  from: Coords,
  size: Size
) => { from: Coords; to: Coords };

export const getRectangleFromSize: GetRectangleFromSize = (from, size) => {
  return {
    from,
    to: { x: from.x + size.width, y: from.y + size.height }
  };
};

export const hasMovedTile = (mouse: Mouse) => {
  if (!mouse.delta) return false;

  return !CoordsUtils.isEqual(mouse.delta.tile, CoordsUtils.zero());
};

export const connectorPathTileToGlobal = (
  tile: Coords,
  origin: Coords
): Coords => {
  return CoordsUtils.subtract(
    CoordsUtils.subtract(origin, CONNECTOR_SEARCH_OFFSET),
    CoordsUtils.subtract(tile, CONNECTOR_SEARCH_OFFSET)
  );
};

export const getTextBoxEndTile = (textBox: TextBox, size: Size) => {
  if (
    textBox.orientation === ProjectionOrientationEnum.X ||
    textBox.orientation === ProjectionOrientationEnum.DX
  ) {
    return CoordsUtils.add(textBox.tile, {
      x: size.width,
      y: 0
    });
  }

  return CoordsUtils.add(textBox.tile, {
    x: 0,
    y: -size.width
  });
};

interface GetItemAtTile {
  tile: Coords;
  scene: ReturnType<typeof useSceneStore>;
  // 新增：偏好返回的连接器 id（若该瓦片存在多个连接器时优先）
  preferredConnectorId?: string | null;
}

export const getItemAtTile = ({
  tile,
  scene,
  preferredConnectorId
}: GetItemAtTile): ItemReference | null => {
  // 小工具：收集当前瓦片上的所有连接器
  const connectorsAtTile = () =>
    scene.connectors.value.filter((con) => {
      return con.path.tiles.find((pathTile) => {
        const globalPathTile = connectorPathTileToGlobal(
          pathTile,
          con.path.rectangle.from
        );
        return CoordsUtils.isEqual(globalPathTile, tile);
      });
    });

  // 在画线模式下：只命中连接器，且若多条重叠优先返回指定的 preferredConnectorId
  if (scene.getLineMode()) {
    const at = connectorsAtTile();
    if (!at.length) return null;

    const preferred = preferredConnectorId
      ? at.find((c) => c.id === preferredConnectorId)
      : null;
    const target = preferred ?? at[0];

    return {
      type: 'CONNECTOR',
      id: target.id
    };
  }

  // 非画线模式：先检查节点
  const viewItem = scene.items.value.find((item) => {
    return CoordsUtils.isEqual(item.tile, tile);
  });

  if (viewItem) {
    return {
      type: 'ITEM',
      id: viewItem.id
    };
  }

  // 再检查文本框
  const textBox = scene.textBoxs.value.find((tb) => {
    const textBoxTo = getTextBoxEndTile(tb, tb.size);
    const textBoxBounds = getBoundingBox([
      tb.tile,
      {
        x: Math.ceil(textBoxTo.x),
        y:
          tb.orientation === 'X' || tb.orientation === 'DX'
            ? Math.ceil(textBoxTo.y)
            : Math.floor(textBoxTo.y)
      }
    ]);

    return isWithinBounds(tile, textBoxBounds);
  });

  if (textBox) {
    return {
      type: 'TEXTBOX',
      id: textBox.id
    };
  }

  // 然后检查连接器：若多条重叠优先返回 preferredConnectorId
  const at = connectorsAtTile();
  if (at.length) {
    const preferred = preferredConnectorId
      ? at.find((c) => c.id === preferredConnectorId)
      : null;
    const target = preferred ?? at[0];

    return {
      type: 'CONNECTOR',
      id: target.id
    };
  }

  // 最后检查矩形
  const rectangle = scene.rectangles.value.find(({ from, to }) => {
    return isWithinBounds(tile, [from, to]);
  });

  if (rectangle) {
    return {
      type: 'RECTANGLE',
      id: rectangle.id
    };
  }

  return null;
};

interface FontProps {
  fontWeight: number | string;
  fontSize: number;
  fontFamily: string;
}

export const getTextWidth = (
  text: string,
  fontProps: FontProps,
  opts?: { paddingLeftPx?: number; paddingRightPx?: number }
) => {
  if (!text) return 0;

  const defaultPaddingX = TEXTBOX_PADDING * UNPROJECTED_TILE_SIZE;
  const paddingLeftPx = opts?.paddingLeftPx ?? defaultPaddingX;
  const paddingRightPx = opts?.paddingRightPx ?? defaultPaddingX;
  const fontSizePx = toPx(fontProps.fontSize * UNPROJECTED_TILE_SIZE);
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not get canvas context');
  }

  context.font = `${fontProps.fontWeight} ${fontSizePx} ${fontProps.fontFamily}`;
  const metrics = context.measureText(text);

  canvas.remove();

  return (
    (metrics.width + paddingLeftPx + paddingRightPx) / UNPROJECTED_TILE_SIZE -
    0.8
  );
};

export const getTextBoxDimensions = (textBox: TextBox): Size => {
  // 解析每个文本框自定义的左右内边距（像素）
  const parsePx = (v: unknown): number | undefined => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const m = v.trim().match(/^(\d+)(px)?$/i);
      if (m) return parseInt(m[1], 10);
    }
    return undefined;
  };
  const cs: any = textBox.contentStyle ?? {};
  const defaultPaddingX = TEXTBOX_PADDING * UNPROJECTED_TILE_SIZE;
  const paddingLeftPx =
    parsePx(cs.paddingLeft ?? cs.padding) ?? defaultPaddingX;
  const paddingRightPx =
    parsePx(cs.paddingRight ?? cs.padding) ?? defaultPaddingX;

  const width = getTextWidth(
    textBox.content,
    {
      fontSize: textBox.fontSize ?? TEXTBOX_DEFAULTS.fontSize,
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: TEXTBOX_FONT_WEIGHT
    },
    {
      paddingLeftPx,
      paddingRightPx
    }
  );
  const height = 1;

  return { width, height };
};

export const outermostCornerPositions: TileOrigin[] = [
  'BOTTOM',
  'RIGHT',
  'TOP',
  'LEFT'
];

export const convertBoundsToNamedAnchors = (
  boundingBox: BoundingBox
): {
  [key in AnchorPosition]: Coords;
} => {
  return {
    BOTTOM_LEFT: boundingBox[0],
    BOTTOM_RIGHT: boundingBox[1],
    TOP_RIGHT: boundingBox[2],
    TOP_LEFT: boundingBox[3]
  };
};

export const getAnchorAtTile = (tile: Coords, anchors: ConnectorAnchor[]) => {
  return anchors.find((anchor) => {
    return Boolean(
      anchor.ref.tile && CoordsUtils.isEqual(anchor.ref.tile, tile)
    );
  });
};

export const getAnchorParent = (anchorId: string, connectors: Connector[]) => {
  const connector = connectors.find((con) => {
    return con.anchors.find((anchor) => {
      return anchor.id === anchorId;
    });
  });

  if (!connector) {
    throw new Error(`Could not find connector with anchor id ${anchorId}`);
  }

  return connector;
};

export const getTileScrollPosition = (
  tile: Coords,
  origin?: TileOrigin
): Coords => {
  const tilePosition = getTilePosition({ tile, origin });

  return {
    x: -tilePosition.x,
    y: -tilePosition.y
  };
};

export const getConnectorsByViewItem = (
  viewItemId: string,
  connectors: Connector[]
) => {
  return connectors.filter((connector) => {
    return connector.anchors.find((anchor) => {
      return anchor.ref.item === viewItemId;
    });
  });
};

export const getConnectorDirectionIcon = (connectorTiles: Coords[]) => {
  if (connectorTiles.length < 2) return null;

  const iconTile = connectorTiles[connectorTiles.length - 2];
  const lastTile = connectorTiles[connectorTiles.length - 1];

  let rotation;

  if (lastTile.x > iconTile.x) {
    if (lastTile.y > iconTile.y) {
      rotation = 135;
    } else if (lastTile.y < iconTile.y) {
      rotation = 45;
    } else {
      rotation = 90;
    }
  }

  if (lastTile.x < iconTile.x) {
    if (lastTile.y > iconTile.y) {
      rotation = -135;
    } else if (lastTile.y < iconTile.y) {
      rotation = -45;
    } else {
      rotation = -90;
    }
  }

  if (lastTile.x === iconTile.x) {
    if (lastTile.y > iconTile.y) {
      rotation = 180;
    } else if (lastTile.y < iconTile.y) {
      rotation = 0;
    } else {
      rotation = -90;
    }
  }

  return {
    x: iconTile.x * UNPROJECTED_TILE_SIZE + UNPROJECTED_TILE_SIZE / 2,
    y: iconTile.y * UNPROJECTED_TILE_SIZE + UNPROJECTED_TILE_SIZE / 2,
    rotation
  };
};

export const getProjectBounds = (
  view: View,
  padding = PROJECT_BOUNDING_BOX_PADDING
): Coords[] => {
  const itemTiles = view.items.map((item) => {
    return item.tile;
  });

  const connectors = view.connectors ?? [];
  const connectorTiles = connectors.reduce<Coords[]>((acc, connector) => {
    const path = getConnectorPath({ anchors: connector.anchors, view });

    return [...acc, path.rectangle.from, path.rectangle.to];
  }, []);

  const rectangles = view.rectangles ?? [];
  const rectangleTiles = rectangles.reduce<Coords[]>((acc, rectangle) => {
    return [...acc, rectangle.from, rectangle.to];
  }, []);

  const textBoxes = view.textBoxes ?? [];
  const textBoxTiles = textBoxes.reduce<Coords[]>((acc, textBox) => {
    const size = getTextBoxDimensions(textBox);

    return [
      ...acc,
      textBox.tile,
      CoordsUtils.add(textBox.tile, {
        x: size.width,
        y: size.height
      })
    ];
  }, []);

  let allTiles = [
    ...itemTiles,
    ...connectorTiles,
    ...rectangleTiles,
    ...textBoxTiles
  ];

  if (allTiles.length === 0) {
    const centerTile = CoordsUtils.zero();
    allTiles = [centerTile, centerTile, centerTile, centerTile];
  }

  const corners = getBoundingBox(allTiles, {
    x: padding,
    y: padding
  });

  return corners;
};

export const getUnprojectedBounds = (view: View) => {
  const projectBounds = getProjectBounds(view);

  const cornerPositions = projectBounds.map((corner) => {
    return getTilePosition({
      tile: corner
    });
  });
  const sortedCorners = sortByPosition(cornerPositions);
  const topLeft = { x: sortedCorners.lowX, y: sortedCorners.lowY };
  const size = getBoundingBoxSize(cornerPositions);

  return {
    width: size.width,
    height: size.height,
    x: topLeft.x,
    y: topLeft.y
  };
};

// 新增：用于控制 fitToView 的四边内边距（像素）
type ViewPadding = { top: number; right: number; bottom: number; left: number };

export const getFitToViewParams = (
  view: View,
  viewportSize: Size,
  padding: ViewPadding = { top: 0, right: 0, bottom: 0, left: 0 }
) => {
  const projectBounds = getProjectBounds(view);
  const sortedCornerPositions = sortByPosition(projectBounds);
  const boundingBoxSize = getBoundingBoxSize(projectBounds);
  const unprojectedBounds = getUnprojectedBounds(view);

  // 可用视口尺寸（扣除 padding）
  const availableViewport: Size = {
    width: Math.max(1, viewportSize.width - (padding.left + padding.right)),
    height: Math.max(1, viewportSize.height - (padding.top + padding.bottom))
  };

  const zoom = clamp(
    Math.min(
      availableViewport.width / unprojectedBounds.width,
      availableViewport.height / unprojectedBounds.height
    ),
    0,
    MAX_ZOOM
  );

  // 基础的内容中心（以 tile 为单位，并按现有逻辑乘以 zoom）
  const scrollTarget: Coords = {
    x: (sortedCornerPositions.lowX + boundingBoxSize.width / 2) * zoom,
    y: (sortedCornerPositions.lowY + boundingBoxSize.height / 2) * zoom
  };

  const baseScroll = getTileScrollPosition(scrollTarget);

  // 期望内容中心（像素）：位于 padding 包围下的可用区域中心
  const viewportCenter: Coords = {
    x: viewportSize.width / 2,
    y: viewportSize.height / 2
  };
  const desiredCenter: Coords = {
    x: padding.left + availableViewport.width / 2,
    y: padding.top + availableViewport.height / 2
  };

  // 将基准滚动按屏幕像素偏移，令内容中心对齐期望中心
  const deltaPx = CoordsUtils.subtract(desiredCenter, viewportCenter);
  const scroll = CoordsUtils.add(baseScroll, deltaPx);

  return {
    zoom,
    scroll
  };
};

export type MouseWheelZoomInput = {
  zoom: number;
  scroll: Scroll;
  deltaY: number;
  clientX: number;
  clientY: number;
  containerRect: { left: number; top: number; width: number; height: number };
};

export const getZoomByMouseWheel = ({
  zoom,
  scroll,
  deltaY,
  clientX,
  clientY,
  containerRect
}: MouseWheelZoomInput) => {
  // 步进缩放，向上滚放大，向下缩小
  const step = deltaY < 0 ? ZOOM_INCREMENT : -ZOOM_INCREMENT;
  const target = clamp(zoom + step, MIN_ZOOM, MAX_ZOOM);
  const newZoom = roundToOneDecimalPlace(target);
  const ratio = newZoom / (zoom || 1);

  // 鼠标相对容器中心的向量 m
  const mouse = {
    x: clientX - containerRect.left,
    y: clientY - containerRect.top
  };
  const center = { x: containerRect.width / 2, y: containerRect.height / 2 };
  const m = { x: mouse.x - center.x, y: mouse.y - center.y };

  const newScroll: Scroll = {
    position: {
      x: ratio * scroll.position.x + (1 - ratio) * m.x,
      y: ratio * scroll.position.y + (1 - ratio) * m.y
    },
    offset: scroll.offset
  };

  return { zoom: newZoom, scroll: newScroll };
};
