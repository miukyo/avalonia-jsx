import type { StyleRule } from './css';

declare global {
  interface AvaloniaNativeShape {
    addGlobalStyles(rules: object[]): string;
    removeGlobalStyles(id: string): void;
  }

  const AvaloniaNative: AvaloniaNativeShape;
}

const styleIds = new Set<string>();

/**
 * GlobalStyles component (replaces `<style>` elements at build time).
 * On mount, registers styles with the C# bridge.
 * On unmount, removes them.
 */
export function GlobalStyles(props: { rules: StyleRule[] }): null {
  if (typeof AvaloniaNative !== 'undefined' && props.rules?.length > 0) {
    const rulesJson = props.rules.map(r => ({
      selector: r.selector,
      properties: mapProperties(r.properties),
    }));

    const id = AvaloniaNative.addGlobalStyles(rulesJson);
    styleIds.add(id);

    // Track for cleanup on hot reload
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (!win.__avaloniaGlobalStyles) win.__avaloniaGlobalStyles = [];
      win.__avaloniaGlobalStyles.push(id);
    }
  }
  return null;
}

function mapProperties(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string') {
      const lowerVal = value.toLowerCase();
      if (lowerVal === 'true') { result[key] = true; continue; }
      if (lowerVal === 'false') { result[key] = false; continue; }
      const num = Number(value);
      if (!isNaN(num) && value.trim() !== '' && key !== 'class' && key !== 'className' && key !== 'selector') {
        result[key] = num;
        continue;
      }
    }
    result[key] = value;
  }
  return result;
}
