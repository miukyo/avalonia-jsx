// Type definitions for the css tagged template
// At build time, the Vite plugin replaces css`...` with inline JSON.
// This module provides the type and a runtime no-op fallback.

export interface StyleRule {
  selector: string;
  properties: Record<string, unknown>;
}

export interface KeyframeDef {
  offset: number;
  properties: Record<string, unknown>;
}

export interface AnimationDef {
  name: string;
  keyframes: KeyframeDef[];
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface StyleSheet {
  rules: StyleRule[];
}

/**
 * Tagged template for defining CSS styles.
 * At build time, this is replaced by the Vite plugin with inline JSON.
 * At runtime, this is a no-op that returns an empty StyleSheet.
 */
export function css(literals: TemplateStringsArray, ...values: unknown[]): StyleSheet {
  // Runtime fallback: simple text concatenation (dynamic styles)
  let result = '';
  for (let i = 0; i < literals.length; i++) {
    result += literals[i];
    if (i < values.length) result += String(values[i]);
  }
  return parseCssText(result);
}

function parseCssText(cssText: string): StyleSheet {
  const rules: StyleRule[] = [];
  const blockRe = /([^{]+)\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(cssText)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    const properties: Record<string, unknown> = {};
    const propRe = /([^:]+):\s*([^;]+);?\s*/g;
    let pm: RegExpExecArray | null;
    while ((pm = propRe.exec(body)) !== null) {
      properties[pm[1].trim()] = pm[2].trim();
    }
    if (Object.keys(properties).length > 0) {
      rules.push({ selector, properties });
    }
  }
  return { rules };
}
