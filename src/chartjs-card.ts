import Chart, {
  ChartData,
  ChartOptions,
  ChartTypeRegistry,
  PluginOptionsByType,
} from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { LitElement, PropertyValues, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';

import pkg from '../package.json';
import { HomeAssistant } from './types/homeassistant';
import { parseChartConfig } from './utils/chart-config';
import { evaluateCssVariable } from './utils/css-variable';

export type CardConfig = {
  chart: string;
  data: ChartData<keyof ChartTypeRegistry>;
  options?: Partial<ChartOptions<keyof ChartTypeRegistry>>;
  plugins?: PluginOptionsByType<keyof ChartTypeRegistry>;
  custom_options?: Partial<{
    showLegend: boolean;
  }>;
  entity_row?: boolean;
  register_plugins?: string[];
};

@customElement(pkg.name)
export default class Card extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  private canvasRef = createRef<HTMLCanvasElement>();

  @state()
  private chart: Chart<keyof ChartTypeRegistry> | null = null;

  private _updateFromEntities: string[] = [];

  @state()
  private _config!: CardConfig;

  public static async getConfigElement() {
    await import('./chartjs-card-editor');
    return document.createElement('chartjs-card-editor');
  }

  setConfig(config: CardConfig) {
    const availableTypes = [
      'line',
      'bar',
      'radar',
      'doughnut',
      'pie',
      'polarArea',
      'bubble',
      'scatter',
    ];

    if (!config.chart) {
      throw new Error('You need to define type of chart');
    } else if (!availableTypes.includes(config.chart)) {
      throw new Error(
        "Invalid config for 'chart'. Available options are: " + availableTypes.join(', ')
      );
    }

    // Entity row
    if (typeof config.entity_row === 'undefined') {
      config.entity_row = false;
    } else if (typeof config.entity_row !== 'boolean') {
      throw new Error('entity_row must be true or false');
    }

    Chart.defaults.color = evaluateCssVariable('var(--primary-text-color)');
    Chart.defaults.font.size = 12;
    Chart.defaults.font.style = 'normal';
    Chart.defaults.maintainAspectRatio = false;

    const availablePlugins = {
      zoom: zoomPlugin,
      annotation: annotationPlugin,
    };

    // Register plugins
    for (const key in availablePlugins) {
      const pluginKey = key as keyof typeof availablePlugins;

      if (Array.isArray(config.register_plugins) && config.register_plugins.includes(pluginKey)) {
        Chart.register(availablePlugins[pluginKey]);
      } else if (Chart.registry.plugins.get(pluginKey)) {
        Chart.unregister(availablePlugins[pluginKey]);
      }
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this._config = config;
  }

  shouldUpdate(changedProps: PropertyValues) {
    if (changedProps.has('_config')) {
      return true;
    }

    const oldHass = changedProps.get('hass');

    if (this._config && oldHass) {
      return this._updateFromEntities.some((entity) => {
        return oldHass.states[entity] !== this.hass.states[entity];
      });
    }

    return false;
  }

  update(changedProps: PropertyValues) {
    super.update(changedProps);

    const parsedConfig = parseChartConfig(this._config, this.hass);
    this._updateFromEntities = parsedConfig.entities;

    if (!this.chart) {
      const ctx = this.canvasRef.value!.getContext('2d')!;
      this.chart = new Chart(ctx, parsedConfig.config);
    } else {
      this.chart.data = parsedConfig.config.data;
      this.chart.options = parsedConfig.config.options;
      this.chart.plugins = parsedConfig.config.plugins;
      this.chart.update('none');
    }
  }

  getCardSize() {
    return 4;
  }

  static styles = css`
    :host {
      display: block;
    }

    ha-card {
      position: relative;
      width: 100%;
      height: 100%;
      padding: var(--ha-space-4);
    }

    ha-card[data-entity-row='true'] {
      padding: 0px;
      box-shadow: none;
    }
  `;

  render() {
    return html`
      <ha-card data-entity-row=${this._config.entity_row}>
        <canvas ${ref(this.canvasRef)}> Your browser does not support the canvas element. </canvas>
      </ha-card>
    `;
  }
}
