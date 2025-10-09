import { z } from 'zod';

export const groundConfigSchema = z.object({
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeOpacity: z.number().min(0).max(1).optional(),
  strokeWidth: z.number().min(0).optional(),
  backgroundImage: z.string().optional()
});

export const sceneSchema = z.object({
  groundConfig: groundConfigSchema.optional()
});
