import { z } from 'zod';
import { id, constrainedStrings, coords } from './common';
import { rectangleSchema } from './rectangle';
import { connectorSchema } from './connector';
import { textBoxSchema } from './textBox';

export const viewItemSchema = z.object({
  id,
  // 视图内的节点基础信息，迁移自顶层 items
  name: constrainedStrings.name.optional(),
  description: constrainedStrings.description.optional(),
  icon: id.optional(),
  // 视图内的位置信息
  tile: coords,
  labelHeight: z.number().optional()
});

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
