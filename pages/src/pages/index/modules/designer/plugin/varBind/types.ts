import { T_PLGeoViewExt, T_PLContext, T_PLItem, T_Plugin, T_PLItemEditorDef } from '@mybricks/sdk';

export type { T_PLGeoViewExt, T_PLContext, T_PLItem, T_Plugin, T_PLItemEditorDef };

export type Data = {
  themeId: string;
  themeConfig: Record<string, string>;
};
export interface Theme {
  get: (val: string) => string;
  set: (id: string, val: string) => void;
  remove: (val: string) => void;
}
export type ThemeConfig = BaseThemeConfig | ComputedThemeConfig;

export interface BaseThemeConfig {
  id: string;
  name: string;
  type: 'base';
  description?: string;
}

export interface ComputedThemeConfig {
  id: string;
  name: string;
  type: 'computed';
  description?: string;
  pattern: {
    target: string;
    operators: Operator[];
  };
}

export interface PcThemeConfig {
  id: string;
}

export interface Operator {
  property: 's' | 'l' | 'a';
  rate: number;
}

export interface ThemeValue {
  id: string;
  title?: string;
  value: Record<string, string>;
}

export type PluginProps = {
  data: Data;
  theme: Theme;
  canvas: any;
};
