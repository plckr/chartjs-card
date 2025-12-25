import './chartjs-card';

import { dependencies, name, version } from '../package.json';
import { registerCustomCard } from './utils/register-card';

console.info(
  `%c ${name} ${version} \n%c chart.js ${dependencies['chart.js']}`,
  'color: white; font-weight: bold; background: #ff6384',
  'color: #ff6384; font-weight: bold'
);

registerCustomCard({
  type: name,
  name: 'Chart.js Card',
  description:
    'Chart.js card for Home Assistant Allows to create highly customized graphs with support for templating',
  documentationURL: 'https://github.com/plckr/chartjs-card',
  preview: true,
});
