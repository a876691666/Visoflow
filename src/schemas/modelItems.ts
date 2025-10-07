import { z } from 'zod';
import { id } from './common';

// 顶层 items 将被移除；为兼容旧数据，这里保留一个最小 schema，使解析通过但不再含业务字段
export const modelItemSchema = z.object({
  id
});

export const modelItemsSchema = z.array(modelItemSchema);
