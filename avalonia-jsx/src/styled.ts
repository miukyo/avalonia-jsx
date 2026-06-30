import type { StyleRule } from './css';
import type { AvaloniaNode } from './renderer';
import { createComponent, insertNode, createElement } from './renderer';

declare global {
  interface AvaloniaNativeShape {
    applyStyles(control: object, rules: object[]): void;
    addGlobalStyles(rules: object[]): string;
    removeGlobalStyles(id: string): void;
    runAnimation(control: object, animation: object): void;
  }

  const AvaloniaNative: AvaloniaNativeShape;
}

/**
 * Creates a styled component by attaching CSS-like style rules.
 * The styles are applied as native Avalonia Style objects on mount.
 */
export function styled<TProps extends Record<string, unknown>>(
  Component: (props: TProps) => AvaloniaNode,
  styleRules: StyleRule[]
): (props: TProps) => AvaloniaNode {
  return function StyledComponent(props: TProps): AvaloniaNode {
    const node = Component(props);
    const origProps = node.props;

    if (styleRules && styleRules.length > 0) {
      const rulesJson = styleRules.map(r => ({
        selector: r.selector,
        properties: mapProperties(r.properties),
      }));

      const existingRef = origProps.ref;
      const refHandler = typeof existingRef === 'function'
        ? (el: AvaloniaNode) => {
            existingRef(el);
            if (el.NativeControl && typeof AvaloniaNative !== 'undefined') {
              AvaloniaNative.applyStyles(el.NativeControl, rulesJson);
            }
          }
        : (el: AvaloniaNode) => {
            if (el.NativeControl && typeof AvaloniaNative !== 'undefined') {
              AvaloniaNative.applyStyles(el.NativeControl, rulesJson);
            }
          };

      return createComponent(Component, {
        ...props,
        ref: refHandler as any,
      }) as AvaloniaNode;
    }

    return createComponent(Component, props) as AvaloniaNode;
  };
}

function mapProperties(props: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === 'string' && key !== 'class' && key !== 'className') {
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
