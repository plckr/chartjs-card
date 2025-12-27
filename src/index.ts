import './chartjs-card';

import {
  CARD_CHARTJS_VERSION,
  CARD_DESCRIPTION,
  CARD_NAME,
  CARD_REPOSITORY_URL,
  CARD_VERSION,
} from './const';
import { registerCustomCard } from './utils/register-card';

console.info(
  `%c ${CARD_NAME} ${CARD_VERSION} \n%c chart.js ${CARD_CHARTJS_VERSION}`,
  'color: white; font-weight: bold; background: #ff6384',
  'color: #ff6384; font-weight: bold'
);

registerCustomCard({
  type: CARD_NAME,
  name: 'Chart.js Card',
  description: CARD_DESCRIPTION,
  documentationURL: CARD_REPOSITORY_URL,
  preview: true,
});
