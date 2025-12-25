export function evaluateCssVariable(variable: string): string {
  if (typeof variable !== 'string' || variable.trim() === '') return variable;

  const regexCssVar = /var\((--[^,)]+)(?:,\s*(.*))?\)/;

  const match = variable.match(regexCssVar);
  if (!match) return variable;

  const [, varName, fallback] = match;
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(varName).trim();

  return variable.replace(regexCssVar, value || evaluateCssVariable(fallback));
}
