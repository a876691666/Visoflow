import { z } from 'zod';
import { INITIAL_DATA } from '../config';
import { constrainedStrings } from './common';
import { viewsSchema } from './views';
import { validateModel } from './validation';
import { iconsSchema } from './icons';
import { colorsSchema } from './colors';

export const modelSchema = z
  .object({
    version: z.string().max(10).optional(),
    title: constrainedStrings.name,
    description: constrainedStrings.description.optional(),
    views: viewsSchema,
    icons: iconsSchema,
    colors: colorsSchema,
    global: z
      .object({
        grid: z
          .object({
            style: z.record(z.any())
          })
          .optional(),
        // 全局图标缩放倍率（默认 1），当视图未设置 iconScale 时作为回退
        iconScale: z.number().min(0.1).max(5).optional(),
        // 全局图标底部偏移（像素），当对象与图标都未设置时作为回退
        iconBottom: z.number().optional()
      })
      .optional()
  })
  .superRefine((model, ctx) => {
    const issues = validateModel({ ...INITIAL_DATA, ...model });

    issues.forEach((issue) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: issue.params,
        message: issue.message
      });
    });
  });
