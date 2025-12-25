import Chart, {
  ChartConfiguration,
  ChartData,
  ChartOptions,
  ChartTypeRegistry,
  PluginOptionsByType,
} from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';
import { LitElement, PropertyValues, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import _ from 'lodash';

import pkg from '../package.json';
import { HomeAssistant } from './types/homeassistant';
import { evaluateCssVariable } from './utils/css-variable';
import { evaluateTemplate } from './utils/evaluate-template';
import { isObject, setPath } from './utils/object';

type CardConfig = {
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

  private _initialized: boolean;

  private chart: Chart<keyof ChartTypeRegistry>;

  private _updateFromEntities: string[];

  private chartConfig: Partial<ChartConfiguration>;

  @state()
  private _config!: CardConfig;

  constructor() {
    super();
    this._initialized = false;
    this.chart = {};
    this._updateFromEntities = [];
    this.chartConfig = {};

    // Set chart defaults
    Chart.defaults.color = evaluateCssVariable('var(--primary-text-color)');
    Chart.defaults.title = {
      fontSize: 14,
      fontStyle: 'normal',
    };
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('_config')) {
      return true;
    }

    if (this._config) {
      const oldHass = changedProps.get('hass') || undefined;

      if (oldHass) {
        let changed = false;
        this._updateFromEntities.forEach((entity) => {
          changed =
            changed || Boolean(this.hass && oldHass.states[entity] !== this.hass.states[entity]);
        });

        return changed;
      }
    }

    return false;
  }

  firstUpdated() {
    this._initialize();
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (this._initialized && changedProps.has('_config')) {
      this._initialize();
      return;
    }

    this._updateChart();
  }

  private _initialize() {
    // Register zoom plugin
    if (Array.isArray(this._config.register_plugins)) {
      if (this._config.register_plugins.includes('zoom')) {
        Chart.register(zoomPlugin);
      }
      if (this._config.register_plugins.includes('annotation')) {
        Chart.register(annotationPlugin);
      }
    }

    if (this._initialized) this.chart.destroy();
    this.chartConfig = this._generateChartConfig(this._config);
    const ctx = this.renderRoot.querySelector('canvas')!.getContext('2d')!;
    this.chart = new Chart(ctx, this.chartConfig);
    this._initialized = true;
  }

  private _updateChart() {
    if (!this._initialized) return;
    const chartConfig = this._generateChartConfig(this._config);
    this.chart.data = chartConfig.data;
    this.chart.options = chartConfig.options;
    this.chart.plugins = chartConfig.plugins;
    this.chart.update('none');
  }

  private _generateChartConfig(config: CardConfig) {
    // Reset dependency entities
    this._updateFromEntities = [];

    let chartconfig = {
      type: config.chart,
      data: this._evaluateConfig(config.data),
      options: this._evaluateConfig(config.options),
      plugins: this._evaluateConfig(config.plugins),
    };

    if (typeof config.custom_options === 'object') {
      if (typeof config.custom_options.showLegend === 'boolean') {
        // chartconfig.options.legend.display = config.options.showLegend; // Defaults to True
        setPath(chartconfig, 'options.plugins.legend.display', config.custom_options.showLegend);
      }
    }

    return chartconfig;
  }

  private _evaluateConfig(config: object) {
    if (isObject(config)) {
      const newObj = _.cloneDeepWith(config, (v) => {
        if (!isObject(v)) {
          if (evaluateTemplate(v, this.hass) !== v) {
            // Search for entities inputs
            const regexEntity = /states\[["|'](.+?)["|']\]/g;
            const matches = v.trim().matchAll(regexEntity);
            for (const match of matches) {
              if (!this._updateFromEntities.includes(match[1])) {
                this._updateFromEntities.push(match[1]);
              }
            }

            return evaluateTemplate(v, this.hass);
          }
          if (evaluateCssVariable(v) !== v) {
            return evaluateCssVariable(v);
          }
          return v;
        }
      });
      return newObj;
    } else {
      return config;
    }
  }

  setConfig(config: CardConfig) {
    // Deep clone
    this._config = JSON.parse(JSON.stringify(config));

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
    if (!this._config.chart) {
      throw new Error('You need to define type of chart');
    } else if (!availableTypes.includes(this._config.chart)) {
      throw new Error(
        "Invalid config for 'chart'. Available options are: " + availableTypes.join(', ')
      );
    }

    // Entity row
    if (typeof config.entity_row === 'undefined') {
      this._config.entity_row = false;
    } else if (typeof this._config.entity_row !== 'boolean') {
      throw new Error('entity_row must be true or false');
    }
  }

  getCardSize() {
    return 4;
  }

  render() {
    return html`
      <ha-card style="padding: ${this._config.entity_row ? '0px; box-shadow: none;' : '16px;'}">
        <canvas>Your browser does not support the canvas element.</canvas>
      </ha-card>
    `;
  }
}
