export function evaluateCssVariable(variable: string | number): string | number {
  if (typeof variable !== 'string') return variable;

  const regexCssVar = /var[(](--[^-].+)[)]/;

  const r = variable.match(regexCssVar)?.[1];
  if (!r) return variable;

  return window.getComputedStyle(document.documentElement).getPropertyValue(r);
}
