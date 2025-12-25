import { HomeAssistant } from '../types/homeassistant';
import { evaluateCssVariable } from './css-variable';

export function evaluateTemplate(template: string, hass: HomeAssistant) {
  if (typeof template !== 'string') return template;

  const { user, states } = hass;
  if (!user || !states) return template;

  const regexTemplate = /^\${(.+)}$/g;
  if (template.includes('${') && template.match(regexTemplate)) {
    ('use strict');

    const evaluated = eval(template.trim().substring(2, template.length - 1));

    if (Array.isArray(evaluated)) {
      return evaluated.map((r) => evaluateCssVariable(r));
    }

    const regexArray = /^\[[^\]]+\]$/g;
    if (typeof evaluated === 'string' && evaluated.match(regexArray)) {
      try {
        return eval(evaluated).map((r: string) => evaluateCssVariable(r));
      } catch {
        return evaluated;
      }
    }

    return evaluated;
  }

  return template;
}
