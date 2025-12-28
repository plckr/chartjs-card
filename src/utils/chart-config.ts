import { CardConfig } from '../chartjs-card';
import { HomeAssistant } from '../types/homeassistant';
import { evaluateTemplate } from './evaluate-template';
import { cloneDeepWith, isObject, setPath } from './object';

export function parseChartConfig(
  rawConfig: CardConfig,
  hass: HomeAssistant
): { config: any; accessedEntities: string[] } {
  const accessedEntities = new Set<string>();

  const config = JSON.parse(JSON.stringify(rawConfig));

  const chartconfig = {
    type: config.chart,
    data: evaluateConfig(config.data, accessedEntities, hass),
    options: evaluateConfig(config.options, accessedEntities, hass),
    plugins: evaluateConfig(config.plugins, accessedEntities, hass),
  };

  if (isObject(config.custom_options)) {
    if (typeof config.custom_options.showLegend === 'boolean') {
      setPath(chartconfig, 'options.plugins.legend.display', config.custom_options.showLegend);
    }
  }

  return {
    config: chartconfig,
    accessedEntities: Array.from(accessedEntities),
  };
}

function evaluateConfig(config: unknown, entities: Set<string>, hass: HomeAssistant) {
  if (!isObject(config)) return config;

  return cloneDeepWith(config, (v) => {
    if (!(typeof v === 'string')) return;

    return evaluateTemplate(v, hass, (entity) => {
      entities.add(entity);
    });
  });
}
