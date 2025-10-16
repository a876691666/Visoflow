import type {
  Model,
  Connector,
  ConnectorAnchor,
  View,
  Rectangle
} from 'src/types';
import { getAllAnchors, getItemByIdOrThrow } from 'src/utils';

type IssueType =
  | {
      type: 'INVALID_ANCHOR_TO_VIEW_ITEM_REF';
      params: {
        anchor: string;
        viewItem: string;
        view: string;
        connector: string;
      };
    }
  | {
      type: 'INVALID_CONNECTOR_COLOR_REF';
      params: {
        connector: string;
        view: string;
        color: string;
      };
    }
  | {
      type: 'INVALID_RECTANGLE_COLOR_REF';
      params: {
        rectangle: string;
        view: string;
        color: string;
      };
    }
  | {
      type: 'INVALID_ANCHOR_TO_ANCHOR_REF';
      params: {
        srcAnchor: string;
        destAnchor: string;
        view: string;
        connector: string;
      };
    }
  // 视图项即为源数据，不再校验到顶层 items 的引用
  | {
      type: 'INVALID_ANCHOR_REF';
      params: {
        anchor: string;
        view: string;
        connector: string;
      };
    }
  // 顶层 items 已移除，相关校验作废
  | {
      type: 'CONNECTOR_TOO_FEW_ANCHORS';
      params: {
        connector: string;
        view: string;
      };
    };

type Issue = IssueType & {
  message: string;
};

// 新增：从视图中移除指定线条（不产生 issue）
const removeConnectorFromView = (view: View, connectorId: string) => {
  if (!view.connectors) return;
  view.connectors = view.connectors.filter((c) => c.id !== connectorId);
};

export const validateConnectorAnchor = (
  anchor: ConnectorAnchor,
  ctx: {
    view: View;
    connector: Connector;
    allAnchors: ConnectorAnchor[];
  }
): Issue[] => {
  const issues: Issue[] = [];

  if (Object.keys(anchor.ref).length !== 1) {
    issues.push({
      type: 'INVALID_ANCHOR_REF',
      params: {
        anchor: anchor.id,
        view: ctx.view.id,
        connector: ctx.connector.id
      },
      message:
        'Connector includes an anchor that references more than one item.  An anchor can only reference one item.'
    });
  }

  if (anchor.ref.item) {
    try {
      getItemByIdOrThrow(ctx.view.items, anchor.ref.item);
    } catch (e) {
      issues.push({
        type: 'INVALID_ANCHOR_TO_VIEW_ITEM_REF',
        params: {
          anchor: anchor.id,
          viewItem: anchor.ref.item,
          view: ctx.view.id,
          connector: ctx.connector.id
        },
        message:
          'Connector includes an anchor that references an item that does not exist in this view.'
      });
    }
  }

  if (anchor.ref.anchor) {
    const targetAnchorId = ctx.allAnchors
      .map(({ id }) => {
        return id;
      })
      .includes(anchor.ref.anchor);

    if (!targetAnchorId) {
      issues.push({
        type: 'INVALID_ANCHOR_TO_ANCHOR_REF',
        params: {
          destAnchor: anchor.id,
          srcAnchor: anchor.ref.anchor,
          view: ctx.view.id,
          connector: ctx.connector.id
        },
        message:
          'Connector includes an anchor that references another connector anchor that does not exist in this view.'
      });
    }
  }

  return issues;
};

export const validateConnector = (
  connector: Connector,
  ctx: {
    view: View;
    model: Model;
    allAnchors: ConnectorAnchor[];
  }
): Issue[] => {
  const issues: Issue[] = [];

  // 颜色合法性暂不作为删除条件，保持与现有注释一致
  if (connector.color) {
    try {
      getItemByIdOrThrow(ctx.model.colors, connector.color);
    } catch (e) {
      // TODO: 等待兼容直接颜色和色卡
      // 忽略颜色问题，不删除、不记录 issue
    }
  }

  // 锚点过少 -> 直接移除线条
  if (connector.anchors.length < 2) {
    removeConnectorFromView(ctx.view, connector.id);
    return [];
  }

  // 校验每个锚点，若有任一失败 -> 直接移除线条
  const { anchors } = connector;
  for (const anchor of anchors) {
    const anchorIssues = validateConnectorAnchor(anchor, {
      view: ctx.view,
      connector,
      allAnchors: ctx.allAnchors
    });
    if (anchorIssues.length > 0) {
      removeConnectorFromView(ctx.view, connector.id);
      return [];
    }
  }

  // 所有检查通过，不产生 issue
  return issues;
};

export const validateRectangle = (
  rectangle: Rectangle,
  ctx: { view: View; model: Model }
): Issue[] => {
  const issues: Issue[] = [];
  // Rectangle currently has no additional cross-field validation.
  // Keep parameters accessed to satisfy linters until future rules are added.
  void rectangle;
  void ctx;

  return issues;
};

export const validateView = (view: View, ctx: { model: Model }): Issue[] => {
  const issues: Issue[] = [];

  if (view.connectors) {
    // 使用副本遍历，期间允许移除无效线条；每次校验前重新计算 allAnchors
    for (const connector of [...view.connectors]) {
      issues.push(
        ...validateConnector(connector, {
          view,
          model: ctx.model,
          allAnchors: getAllAnchors(view.connectors)
        })
      );
    }
  }

  if (view.rectangles) {
    view.rectangles.forEach((rectangle) => {
      issues.push(
        ...validateRectangle(rectangle, {
          view,
          model: ctx.model
        })
      );
    });
  }

  // 不再需要校验 view.items 到 model.items 的引用一致性

  return issues;
};

// 顶层 ModelItem 已废弃

export const validateModel = (model: Model): Issue[] => {
  const issues: Issue[] = [];

  model.views.forEach((view) => {
    issues.push(...validateView(view, { model }));
  });

  return issues;
};
