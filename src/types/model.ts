import z from 'zod';
import {
  iconSchema,
  modelSchema,
  viewsSchema,
  viewSchema,
  viewItemSchema,
  connectorSchema,
  iconsSchema,
  colorsSchema,
  anchorSchema,
  textBoxSchema,
  rectangleSchema,
  connectorStyleOptions
} from 'src/schemas';

export { connectorStyleOptions } from 'src/schemas';
export type Model = z.infer<typeof modelSchema>;
export type Icon = z.infer<typeof iconSchema>;
export type Icons = z.infer<typeof iconsSchema>;
export type Colors = z.infer<typeof colorsSchema>;
export type Views = z.infer<typeof viewsSchema>;
export type View = z.infer<typeof viewSchema>;
export type ViewItem = z.infer<typeof viewItemSchema>;
export type ConnectorStyle = keyof typeof connectorStyleOptions;
export type ConnectorAnchor = z.infer<typeof anchorSchema>;
export type Connector = z.infer<typeof connectorSchema>;
export type TextBox = z.infer<typeof textBoxSchema>;
export type Rectangle = z.infer<typeof rectangleSchema>;
