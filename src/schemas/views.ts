import { z } from 'zod';
import { id, constrainedStrings, coords } from './common';
import { rectangleSchema } from './rectangle';
import { connectorSchema } from './connector';
import { textBoxSchema } from './textBox';

// 视图内的对象（节点）
export const viewItemSchema = z.object({
  id,
  // 视图内的节点基础信息，迁移自顶层 items
  name: constrainedStrings.name.optional(),
  description: constrainedStrings.description.optional(),
  icon: id.optional(),
  // 视图内的位置信息
  tile: coords,
  labelHeight: z.number().optional(),
  // 对象级图标缩放倍率（优先级最高），允许 0.1 - 5
  iconScale: z.number().min(0.1).max(5).optional(),
  // 对象级图标底部偏移（像素），优先级高于图标默认值
  iconBottom: z.number().optional(),
  // 显性继承控制（为 true 时不写入对应数值字段，走图标/视图/全局继承）
  inheritIconScale: z.boolean().optional(),
  inheritIconBottom: z.boolean().optional()
});

// 视图
export const viewSchema = z.object({
  id,
  lastUpdated: z.string().datetime().optional(),
  name: constrainedStrings.name,
  description: constrainedStrings.description.optional(),
  items: z.array(viewItemSchema),
  rectangles: z.array(rectangleSchema).optional(),
  connectors: z.array(connectorSchema).optional(),
  textBoxes: z.array(textBoxSchema).optional()
});

export const viewsSchema = z.array(viewSchema);
