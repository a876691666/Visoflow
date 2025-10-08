import { z } from 'zod';
import { id, constrainedStrings } from './common';

export const iconSchema = z.object({
  id,
  name: constrainedStrings.name,
  url: z.string(),
  collection: constrainedStrings.name.optional(),
  isIsometric: z.boolean().optional(),
  // 图标默认缩放倍率（可选，0.1 - 5），作为对象/视图未设置时的回退
  iconScale: z.number().min(0.1).max(5).optional(),
  // 图标相对底部的像素偏移（向下为正，向上为负），对象未设置时回退到此值
  iconBottom: z.number().optional()
});

export const iconsSchema = z.array(iconSchema);
