import Chart from 'chart.js';
import { LitElement, html, css, TemplateResult } from 'lit-element';
import deepcopy from 'deep-clone-simple';
import _ from 'lodash';

class ChartjsCard extends LitElement {
  
  static get properties() {
    return {
      hass: { type: Object},
      _config: { type: Object },
      chart: { type: Object },
      chartProp: { type: Object }
    };
  }

  constructor() {
    super();
  }

  firstUpdated() {
    this._setChartConfig();
    
    const ctx = this.renderRoot.querySelector('canvas').getContext('2d');
    
    this.chart = new Chart(ctx, this.chartProp);
  }
  
  _setChartConfig(){
    let chartconfig = {};
    chartconfig.data = this._checkConfig(deepcopy(this._config.data));
    chartconfig.options = this._checkConfig(deepcopy(this._config.options));
    
    // chartconfig.options.scales.yAxes[0].gridLines.color = 
    // chartconfig.options.scales.xAxes[0].gridLines.color = this._evaluateCssVariable('var(--secondary-background-color)');
    
    Chart.defaults.global.defaultFontColor = this._evaluateCssVariable('var(--primary-text-color)');
    _.set(Chart.defaults.global, 'title.fontSize', '14');
    _.set(Chart.defaults.global, 'title.fontStyle', 'normal');
    
    const availableTypes = ['line', 'radar', 'bar', 'horizontalBar', 'pie', 'doughnut', 'polarArea', 'bubble', 'scatter'];
    if (!this._config.chart) {
      throw new Error("You need to define type of chart");
    } else if ( !availableTypes.includes(this._config.chart) ) {
      throw new Error("Invalid config for 'chart'. Available options are: "+availableTypes.join(", "));
    } else {
      if (this._config.chart == 'pie'){
        console.log(Chart.defaults.global);
      }
      chartconfig.type = this._config.chart;
    }
      
    if (typeof this._config.custom_options.showLegend === "boolean") {
      // chartconfig.options.legend.display = this._config.options.showLegend; // Defaults to True
      var teste = deepcopy(this._config);
      _.set(chartconfig, 'options.legend.display', this._config.custom_options.showLegend);
    }
    
    // Entity row
    if (typeof this._config.entity_row === "undefined") {
      this._config.entity_row = false;
    } else if (typeof this._config.entity_row !== "boolean") {
      throw new Error("entity_row must be true or false")
    }
    
    // const type = config.chart;
    // const data = {
    //   labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    //   datasets: [{
    //       label: '# of Votes',
    //       data: [12, 19, 3, 5, 2, 3],
    //       backgroundColor: [
    //           'rgba(255, 99, 132, 0.2)',
    //           'rgba(54, 162, 235, 0.2)',
    //           'rgba(255, 206, 86, 0.2)',
    //           'rgba(75, 192, 192, 0.2)',
    //           'rgba(153, 102, 255, 0.2)',
    //           'rgba(255, 159, 64, 0.2)'
    //       ],
    //       borderColor: [
    //           'rgba(255,99,132,1)',
    //           'rgba(54, 162, 235, 1)',
    //           'rgba(255, 206, 86, 1)',
    //           'rgba(75, 192, 192, 1)',
    //           'rgba(153, 102, 255, 1)',
    //           'rgba(255, 159, 64, 1)'
    //       ],
    //       borderWidth: 1
    //   }]
    // }
    // const options = {
    //   scales: {
    //       yAxes: [{
    //           ticks: {
    //               beginAtZero: true
    //           }
    //       }]
    //   }
    // }
    
    this.chartProp = chartconfig;
  }
  
  _checkConfig(config) {
    
    // Only allow Object as input
    if (typeof config === 'object') {
      var newObj = _.cloneDeepWith(config, (v) => {
        if(!_.isObject(v)) {
          if (this._evaluateTemplate(v) !== v) {
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
  }

  getCardSize() {
    return 3;
  }

  render() {
    return html`
      <ha-card style="padding: ${this._config.entity_row ? '0px; box-shadow: none;' : '16px;'}">
        <canvas></canvas>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      
    `;
  }
}
customElements.define("chartjs-card", ChartjsCard);
console.info(
  '%c  CHARTJS-CARD  \n%c Version 0.0.1 ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);