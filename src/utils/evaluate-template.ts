import { HomeAssistant } from '../types/homeassistant';
import { isArray } from './array';
import { evaluateCssVariable } from './css-variable';

export function evaluateTemplate(template: string, hass: HomeAssistant) {
  ('use strict');

  const { user, states } = hass;
  if (!user || !states) return template;

  let evaluated = eval(`\`${template.replaceAll('`', '\\`')}\``);

  if (typeof evaluated === 'string' && stringMatchesArray(evaluated)) {
    try {
      ('use strict');
      evaluated = eval(evaluated);
    } catch {
      // no-op
    }
  }

  if (isArray(evaluated)) {
    return evaluated.map((r) => {
      if (typeof r === 'string') {
        return evaluateCssVariable(r);
      }

      return r;
    });
  }

  return evaluated;
}

function stringMatchesArray(value: string): boolean {
  const regexArray = /^\[[^\]]+\]$/g;
  return value.match(regexArray) !== null;
}
