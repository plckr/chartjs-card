import { HomeAssistant } from '../types/homeassistant';
import { isArray } from './array';
import { evaluateCssVariable } from './css-variable';

export function evaluateTemplate(
  template: string,
  hassProp: HomeAssistant
): { result: any; accessedEntities: string[] } {
  const accessedEntities = new Set<string>();

  ('use strict');
  const hass = {
    ...hassProp,
    states: new Proxy(hassProp.states, {
      get(target, prop) {
        if (typeof prop === 'string') {
          accessedEntities.add(prop);
        }
        return target[prop];
      },
    }),
  };
  const { user, states } = hass;
  if (!user && !states) {
    // used for eval, so that Rollup doesn't remove the variables definition
    console.info('Should never happen');
  }

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
    evaluated = evaluated.map((r) => {
      if (typeof r === 'string') {
        return evaluateCssVariable(r);
      }

      return r;
    });
  }

  return {
    result: evaluated,
    accessedEntities: Array.from(accessedEntities),
  };
}

function stringMatchesArray(value: string): boolean {
  const regexArray = /^\[[^\]]+\]$/g;
  return value.match(regexArray) !== null;
}
