// Type definitions for the keyframes tagged template
// At build time, the Vite plugin replaces keyframes`...` with inline JSON.
// This module provides the type and a runtime fallback for dynamic animations.

import type { KeyframeDef, AnimationDef } from './css';

let keyframeCounter = 0;

function generateName(): string {
  return `kf_${(++keyframeCounter).toString(36)}`;
}

/**
 * Tagged template for defining CSS @keyframes.
 * At build time, this is replaced by the Vite plugin with an inline AnimationDef.
 * At runtime, this parses the CSS text on the fly for dynamic animations.
 */
export function keyframes(literals: TemplateStringsArray, ...values: unknown[]): AnimationDef {
  let cssText = '';
  for (let i = 0; i < literals.length; i++) {
    cssText += literals[i];
    if (i < values.length) cssText += String(values[i]);
  }
  return parseKeyframesCss(cssText);
}

function parseKeyframesCss(cssText: string): AnimationDef {
  const keyframes: KeyframeDef[] = [];
  const keyframeRe = /\b(from|to|\d+%)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = keyframeRe.exec(cssText)) !== null) {
    const key = match[1].trim();
    const body = match[2].trim();
    const offset = key === 'from' ? 0 : key === 'to' ? 1 : parseInt(key) / 100;
    const properties: Record<string, unknown> = {};
    const propRe = /([^:]+):\s*([^;]+);?\s*/g;
    let pm: RegExpExecArray | null;
    while ((pm = propRe.exec(body)) !== null) {
      properties[pm[1].trim()] = pm[2].trim();
    }
    keyframes.push({ offset, properties });
  }
  keyframes.sort((a, b) => a.offset - b.offset);

  return {
    name: generateName(),
    keyframes,
  };
}

export type { KeyframeDef, AnimationDef };
