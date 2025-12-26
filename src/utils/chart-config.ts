import { ChartConfiguration } from 'chart.js';

import { CardConfig } from '../chartjs-card';
import { HomeAssistant } from '../types/homeassistant';
import { evaluateCssVariable } from './css-variable';
import { evaluateTemplate } from './evaluate-template';
import { cloneDeepWith, isObject, setPath } from './object';

export function parseChartConfig(
  rawConfig: CardConfig,
  hass: HomeAssistant
): { config: ChartConfiguration; entities: string[] } {
  const entities: string[] = [];

  const config = JSON.parse(JSON.stringify(rawConfig));

  const chartconfig = {
    type: config.chart,
    data: evaluateConfig(config.data, entities, hass),
    options: evaluateConfig(config.options, entities, hass),
    plugins: evaluateConfig(config.plugins, entities, hass),
  };

  if (isObject(config.custom_options)) {
    if (typeof config.custom_options.showLegend === 'boolean') {
      setPath(chartconfig, 'options.plugins.legend.display', config.custom_options.showLegend);
    }
  }

  return { config: chartconfig, entities };
}

function evaluateConfig(config: object, entities: string[], hass: HomeAssistant) {
  if (!isObject(config)) return config;

  return cloneDeepWith(config, (v) => {
    if (!(typeof v === 'string')) return;

    const evaluated = evaluateTemplate(v, hass);

    const regexEntity = /states\[["|'](.+?)["|']\]/g;
    const matches = v.trim().matchAll(regexEntity);
    for (const match of matches) {
      if (!entities.includes(match[1])) {
        entities.push(match[1]);
      }
    }

    return evaluateCssVariable(evaluated);
  });
}
