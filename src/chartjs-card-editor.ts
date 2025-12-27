import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { CardConfig } from './chartjs-card';
import { CARD_EDITOR_NAME } from './const';
import { HomeAssistant } from './types/homeassistant';

const CHART_TYPES = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'radar', label: 'Radar' },
  { value: 'doughnut', label: 'Doughnut' },
  { value: 'pie', label: 'Pie' },
  { value: 'polarArea', label: 'Polar Area' },
  { value: 'bubble', label: 'Bubble' },
  { value: 'scatter', label: 'Scatter' },
];

const AVAILABLE_PLUGINS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'annotation', label: 'Annotation' },
];

@customElement(CARD_EDITOR_NAME)
export class ChartjsCardEditor extends LitElement {
  @property({ attribute: false })
  public hass!: HomeAssistant;

  @state()
  private _config!: CardConfig;

  public setConfig(config: CardConfig): void {
    this._config = config;
  }

  private _dispatchConfigChanged(config: CardConfig): void {
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleChartTypeChange(ev: Event): void {
    const target = ev.target as HTMLSelectElement;
    const newConfig = { ...this._config, chart: target.value };
    this._dispatchConfigChanged(newConfig);
  }

  private _handleDataChange(ev: CustomEvent): void {
    const value = ev.detail.value;
    try {
      const parsed = JSON.parse(value);
      const newConfig = { ...this._config, data: parsed };
      this._dispatchConfigChanged(newConfig);
    } catch {
      // Invalid JSON, don't update
    }
  }

  private _handleOptionsChange(ev: CustomEvent): void {
    const value = ev.detail.value;
    try {
      const parsed = JSON.parse(value);
      const newConfig = { ...this._config, options: parsed };
      this._dispatchConfigChanged(newConfig);
    } catch {
      // Invalid JSON, don't update
    }
  }

  private _handleShowLegendChange(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const newConfig = {
      ...this._config,
      custom_options: {
        ...this._config.custom_options,
        showLegend: target.checked,
      },
    };
    this._dispatchConfigChanged(newConfig);
  }

  private _handleEntityRowChange(ev: Event): void {
    const target = ev.target as HTMLInputElement;
    const newConfig = { ...this._config, entity_row: target.checked };
    this._dispatchConfigChanged(newConfig);
  }

  private _handlePluginToggle(plugin: string, checked: boolean): void {
    const currentPlugins = this._config.register_plugins || [];
    let newPlugins: string[];

    if (checked) {
      newPlugins = [...currentPlugins, plugin];
    } else {
      newPlugins = currentPlugins.filter((p) => p !== plugin);
    }

    const newConfig = { ...this._config, register_plugins: newPlugins };
    this._dispatchConfigChanged(newConfig);
  }

  static styles = css`
    :host {
      display: block;
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 16px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .section h2 {
      cursor: default;
      font-size: 14px;
      font-weight: 400;
      color: var(--primary-text-color);
      margin: 0;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    ha-code-editor {
      display: block;
      width: 100%;
      --code-mirror-height: 200px;
    }

    ha-select {
      width: 100%;
    }
  `;

  render() {
    if (!this._config) {
      return nothing;
    }

    return html`
      <div class="editor-container">
        <!-- Chart Type -->
        <div class="section">
          <h2>Chart Type</h2>
          <ha-select
            .value=${this._config.chart}
            @selected=${this._handleChartTypeChange}
            @closed=${(ev: Event) => ev.stopPropagation()}
          >
            ${CHART_TYPES.map((type) => {
              return html` <ha-list-item .value=${type.value}> ${type.label} </ha-list-item> `;
            })}
          </ha-select>
        </div>

        <!-- Data Editor -->
        <div class="section">
          <h2>Data</h2>
          <ha-code-editor
            mode="yaml"
            .value=${JSON.stringify(this._config.data || {}, null, 2)}
            @value-changed=${this._handleDataChange}
          ></ha-code-editor>
        </div>

        <!-- Options Editor -->
        <div class="section">
          <h2>Options</h2>
          <ha-code-editor
            mode="yaml"
            .value=${JSON.stringify(this._config.options || {}, null, 2)}
            @value-changed=${this._handleOptionsChange}
          ></ha-code-editor>
        </div>

        <!-- Custom Options -->
        <div class="section">
          <h2>Custom Options</h2>
          <div class="checkbox-group">
            <ha-formfield label="Show Legend">
              <ha-checkbox
                .checked=${this._config.custom_options?.showLegend ?? false}
                @change=${this._handleShowLegendChange}
              ></ha-checkbox>
            </ha-formfield>
          </div>
        </div>

        <!-- Register Plugins -->
        <div class="section">
          <h2>Register Plugins</h2>
          <div class="checkbox-group">
            ${AVAILABLE_PLUGINS.map(
              (plugin) => html`
                <ha-formfield .label=${plugin.label}>
                  <ha-checkbox
                    .checked=${this._config.register_plugins?.includes(plugin.value) ?? false}
                    @change=${(ev: Event) =>
                      this._handlePluginToggle(
                        plugin.value,
                        (ev.target as HTMLInputElement).checked
                      )}
                  ></ha-checkbox>
                </ha-formfield>
              `
            )}
          </div>
        </div>

        <!-- Entity Row -->
        <div class="section">
          <ha-formfield label="Entity Row Mode">
            <ha-switch
              .checked=${this._config.entity_row ?? false}
              @change=${this._handleEntityRowChange}
            ></ha-switch>
          </ha-formfield>
        </div>
      </div>
    `;
  }
}
