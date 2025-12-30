export function evaluateCssVariable(variable: string): string {
  if (typeof variable !== 'string' || variable.trim() === '') return variable;

  const regexCssVar = /var\((--[^,)]+)(?:,\s*(.*))?\)/g;

  let result = variable;
  let match;

  while ((match = regexCssVar.exec(variable)) !== null) {
    const [fullMatch, varName, fallback] = match;
    const value = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();

    const resolvedValue = value || (fallback ? evaluateCssVariable(fallback.trim()) : '');
    result = result.replace(fullMatch, resolvedValue);
  }

  return result;
}
