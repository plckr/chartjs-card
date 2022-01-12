import pkg from '../package.json'
import Chart from 'chart.js/auto'
import { LitElement, html } from 'lit-element'
import _ from 'lodash'

class Card extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      _config: { type: Object },
    }
  }

  constructor() {
    super()
    this._initialized = false
    this.chart = {}
    this._updateFromEntities = []
    this.chartConfig = {}

    // Set chart defaults
    Chart.defaults.color = this._evaluateCssVariable('var(--primary-text-color)')
    if (!Chart.defaults.title) Chart.defaults.title = {}
    Chart.defaults.title.fontSize = 14
    Chart.defaults.title.fontStyle = 'normal'
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('_config')) {
      return true
    }

    if (this._config) {
      const oldHass = changedProps.get('hass') || undefined

      if (oldHass) {
        let changed = false
        this._updateFromEntities.forEach((entity) => {
          changed = changed || Boolean(this.hass && oldHass.states[entity] !== this.hass.states[entity])
        })

        return changed
      }
    }

    return false
  }

  firstUpdated() {
    this._initialize()
  }

  updated(changedProps) {
    super.updated()

    if (this._initialized && changedProps.has('_config')) {
      this._initialize()
      return
    }

    this._updateChart()
  }

  _initialize() {
    if (this._initialized) this.chart.destroy()
    this.chartConfig = this._generateChartConfig(this._config)
    const ctx = this.renderRoot.querySelector('canvas').getContext('2d')
    this.chart = new Chart(ctx, this.chartConfig)
    this._initialized = true
  }

  _updateChart() {
    if (!this._initialized) return
    const chartConfig = this._generateChartConfig(this._config)
    this.chart.data = chartConfig.data
    this.chart.options = chartConfig.options
    this.chart.plugins = chartConfig.plugins
    this.chart.update('none')
  }

  _generateChartConfig(config) {
    // Reset dependency entities
    this._updateFromEntities = []

    let chartconfig = {
      type: config.chart,
      data: this._evaluateConfig(config.data),
      options: this._evaluateConfig(config.options),
      plugins: this._evaluateConfig(config.plugins),
    }

    if (typeof config.custom_options === 'object') {
      if (typeof config.custom_options.showLegend === 'boolean') {
        // chartconfig.options.legend.display = config.options.showLegend; // Defaults to True
        _.set(chartconfig, 'options.plugins.legend.display', config.custom_options.showLegend)
      }
    }

    return chartconfig
  }

  _evaluateConfig(config) {
    // Only allow Object as input
    if (typeof config === 'object') {
      let newObj = _.cloneDeepWith(config, (v) => {
        if (!_.isObject(v)) {
          if (this._evaluateTemplate(v) !== v) {
            // Search for entities inputs
            const regexEntity = /states\[["|'](.+?)["|']\]/g
            const matches = v.trim().matchAll(regexEntity)
            for (const match of matches) {
              if (!this._updateFromEntities.includes(match[1])) {
                this._updateFromEntities.push(match[1])
              }
            }

            return this._evaluateTemplate(v)
          }
          if (this._evaluateCssVariable(v) !== v) {
            return this._evaluateCssVariable(v)
          }
          return v
        }
      })
      return newObj
    } else {
      return config
    }
  }

  _evaluateCssVariable(variable) {
    const regexCssVar = /var[(](--[^-].+)[)]/
    var r = _.words(variable, regexCssVar)[1]

    if (!r) {
      return variable
    }

    return getComputedStyle(document.documentElement).getPropertyValue(r)
  }

  _evaluateTemplate(template) {
    if (typeof template === 'string') {
      ;('use strict')

      const user = this.hass?.user
      const states = this.hass?.states

      // Workaround to avoid rollup to remove above variables
      if (!user || !states) console.log('this never executes')

      const regexTemplate = /^\${(.+)}$/g
      template = template.trim()
      if (_.includes(template, '${') && template.match(regexTemplate)) {
        template = eval(template.substring(2, template.length - 1))

        const regexArray = /^\[[^\]]+\]$/g
        if (typeof template === 'string' && template.match(regexArray)) {
          try {
            return eval(template)
          } catch (e) {
            return template
          }
        }
      }
      return template
    }
    return template
  }

  setConfig(config) {
    // Deep clone
    this._config = JSON.parse(JSON.stringify(config))

    const availableTypes = ['line', 'bar', 'radar', 'doughnut', 'pie', 'polarArea', 'bubble', 'scatter']
    if (!this._config.chart) {
      throw new Error('You need to define type of chart')
    } else if (!availableTypes.includes(this._config.chart)) {
      throw new Error("Invalid config for 'chart'. Available options are: " + availableTypes.join(', '))
    }

    // Entity row
    if (typeof config.entity_row === 'undefined') {
      this._config.entity_row = false
    } else if (typeof this._config.entity_row !== 'boolean') {
      throw new Error('entity_row must be true or false')
    }
  }

  getCardSize() {
    return 4
  }

  render() {
    return html`
      <ha-card style="padding: ${this._config.entity_row ? '0px; box-shadow: none;' : '16px;'}">
        <canvas>Your browser does not support the canvas element.</canvas>
      </ha-card>
    `
  }
}
customElements.define(pkg.name, Card)
console.info(
  `%c ${pkg.name} ${pkg.version} \n%c chart.js ${pkg.dependencies['chart.js']}`,
  'color: white; font-weight: bold; background: #ff6384',
  'color: #ff6384; font-weight: bold'
)
