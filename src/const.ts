import { ChartType, Plugin } from 'chart.js';

import pkg from '../package.json';

export const CARD_NAME = pkg.name;
export const CARD_EDITOR_NAME = `${CARD_NAME}-editor`;
export const CARD_VERSION = pkg.version;
export const CARD_CHARTJS_VERSION = pkg.dependencies['chart.js'];
export const CARD_AUTHOR = pkg.author;
export const CARD_DESCRIPTION = pkg.description;
export const CARD_REPOSITORY_URL = pkg.repository.url;

export const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'radar', label: 'Radar' },
  { value: 'doughnut', label: 'Doughnut' },
  { value: 'pie', label: 'Pie' },
  { value: 'polarArea', label: 'Polar Area' },
  { value: 'bubble', label: 'Bubble' },
  { value: 'scatter', label: 'Scatter' },
];

type ChartjsPlugin = {
  key: string;
  label: string;
  version: string;
  documentationURL: string;
  import: Plugin;
};

export const CHART_PLUGINS: ChartjsPlugin[] = [
  {
    key: 'zoom',
    label: 'Zoom',
    version: pkg.dependencies['chartjs-plugin-zoom'],
    documentationURL: 'https://www.chartjs.org/chartjs-plugin-zoom/latest/',
    import: (await import('chartjs-plugin-zoom')).default,
  },
  {
    key: 'annotation',
    label: 'Annotation',
    version: pkg.dependencies['chartjs-plugin-annotation'],
    documentationURL: 'https://www.chartjs.org/chartjs-plugin-annotation/latest/',
    import: (await import('chartjs-plugin-annotation')).default,
  },
];
