import Chart from 'chart.js';
import { LitElement, html, css, TemplateResult } from 'lit-element';
import { HomeAssistant, hasConfigOrEntityChanged } from 'custom-card-helpers';
import deepcopy from 'deep-clone-simple';
import _ from 'lodash';

class ChartjsCard extends LitElement {
  
  static get properties() {
    return {
      hass: { type: Object},
      _config: { type: Object },
      chart: { type: Object },
      chartProp: { type: Object },
      _updateFromEntities: { type: Array },
      _initialized: { type: Boolean }
    };
  }

  constructor() {
    super();
    this._updateFromEntities = [];
    this._initialized = false;
  }
  
  _initialize() {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    // if (this._helpers === undefined) return;
    this._initialized = true;
  }
  
  shouldUpdate(changedProps) {
    if (!this._initialized) {
      this._initialize();
    }

    if (changedProps.has('_config')) {
      return true;
    }

    if (this._config) {
      const oldHass = changedProps.get('hass') || undefined;

      if (oldHass) {
        let changed = false;
        this._updateFromEntities.forEach(entity => {
          changed =
            changed ||
            Boolean(
              this.hass &&
                oldHass.states[entity] !== this.hass.states[entity],
            );
        });
        
        if (changed) {
          this._updateChart();
        }
        
        return changed;
      }
    }

    return true;
  }

  firstUpdated() {
    this._setChartConfig();
    
    const ctx = this.renderRoot.querySelector('canvas').getContext('2d');
    
    this.chart = new Chart(ctx, this.chartProp);
  }
  
  _updateChart() {
    this._updateFromEntities = [];
    this.chartProp.data = this._evaluateConfig(deepcopy(this._config.data));
    this.chartProp.options = this._evaluateConfig(deepcopy(this._config.options));
    this.chart.update({duration: 0, easing: 'linear'});
  }
  
  _setChartDefaults() {
    Chart.defaults.global.defaultFontColor = this._evaluateCssVariable('var(--primary-text-color)');
    _.set(Chart.defaults.global, 'title.fontSize', '14');
    _.set(Chart.defaults.global, 'title.fontStyle', 'normal');
  }
  
  _setChartConfig(){
    let chartconfig = {};
    chartconfig.type = this._config.chart;
    chartconfig.data = this._evaluateConfig(deepcopy(this._config.data));
    chartconfig.options = this._evaluateConfig(deepcopy(this._config.options));
      
    if (typeof this._config.custom_options.showLegend === "boolean") {
      // chartconfig.options.legend.display = this._config.options.showLegend; // Defaults to True
      var teste = deepcopy(this._config);
      _.set(chartconfig, 'options.legend.display', this._config.custom_options.showLegend);
    }
    
    this.chartProp = chartconfig;
  }
  
  _evaluateConfig(config) {
    
    // Only allow Object as input
    if (typeof config === 'object') {
      let newObj = _.cloneDeepWith(config, (v) => {
        if(!_.isObject(v)) {
          if (this._evaluateTemplate(v) !== v) {
            
            // Search for entities inputs
            let regexEntity = /states\[["|'](.+?)["|']\]/g;
            let matches = v.trim().matchAll(regexEntity);
            for (const match of matches) {
              if (!this._updateFromEntities.includes(match[1])) {
                this._updateFromEntities.push(match[1]);
              }
            }
            
            return this._evaluateTemplate(v);
          }
          if (this._evaluateCssVariable(v) !== v) {
            return this._evaluateCssVariable(v);
          }
        	return v;
        }
      });
      return newObj;
    } else {
      return config;
    }
  }
  
  _evaluateCssVariable(variable) {
    let regexCssVar = /var[(](--[^-].+)[)]/;
    var r = _.words(variable, regexCssVar)[1];
    
    if (!r) {
      return variable;
    }
    
    return getComputedStyle(document.documentElement).getPropertyValue(r);
  }
  
  _evaluateTemplate(template) {
    if (typeof template === 'string') {
      var user = this.hass ? this.hass.user : undefined;
      var states = this.hass ? this.hass.states : undefined;
      
      "use strict";
      
      let regexTemplate = /^\${([^}]+)}$/g;
      template = template.trim();
      if (_.includes(template, '${') && template.match(regexTemplate)) {
        
    	  template = eval(template.substring(2, template.length - 1));
    	  
    	  let regexArray = /^\[[^\]]+\]$/g;
        if (typeof template === 'string' && template.match(regexArray)) {
          try {
            return eval(template);
          } catch(e) {
            return template;
          }
        }
      }
      return template;
      
    }
    return template;
  
    // if (typeof template === 'object') {
    //   var newObj = _.cloneDeepWith(template, function(v) {
    //   	let regexTemplate = /^\${([^}]+)}$/g;
    //     if(!_.isObject(v)) {
    //       if (_.includes(v, '${') && v.trim().match(regexTemplate)) {
    //         let result = '';
    //       	result = eval(v.trim().substring(2, v.length - 1));
          	
    //         if (result.match(/^\[[^\]]+\]$/g)) {
    //           try {
    //             return eval(result);
    //           } catch(e) {
    //             return result;
    //           }
              
    //         }
    //         return result;
    //       }
    //     }
    //   });
    //   return newObj;
    // }
  }
  
  setConfig(config) {
    this._config = deepcopy(config);
    this._setChartDefaults();
    
    const availableTypes = ['line', 'radar', 'bar', 'horizontalBar', 'pie', 'doughnut', 'polarArea', 'bubble', 'scatter'];
    if (!this._config.chart) {
      throw new Error("You need to define type of chart");
    } else if ( !availableTypes.includes(this._config.chart) ) {
      throw new Error("Invalid config for 'chart'. Available options are: "+availableTypes.join(", "));
    }
    
    // Entity row
    if (typeof this._config.entity_row === "undefined") {
      this._config.entity_row = false;
    } else if (typeof this._config.entity_row !== "boolean") {
      throw new Error("entity_row must be true or false")
    }
  }

  getCardSize() {
    return 4;
  }

  render() {
    return html`
      <ha-card style="padding: ${this._config.entity_row ? '0px; box-shadow: none;' : '16px;'}">
        <canvas></canvas>
      </ha-card>
    `;
  }

  static get styles() {
    return css``;
  }
}
customElements.define("chartjs-card", ChartjsCard);
console.info(
  '%c  CHARTJS-CARD  \n%c Version 0.0.1 ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);