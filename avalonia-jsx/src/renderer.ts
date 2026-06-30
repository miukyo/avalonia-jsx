import { createRenderer } from 'solid-js/universal';

declare global {
  interface AvaloniaNativeShape {
    updateProperty(control: object, propName: string, value: any): void;
    insertChild(parent: object, child: object, anchor: object | null): void;
    removeChild(parent: object, child: object): void;
  }

  const AvaloniaNative: AvaloniaNativeShape;
}

/**
 * The virtual node object that SolidJS-Avalonia manages.
 * When you use `ref` on a component, you receive an instance of this.
 * `NativeControl` is the underlying Avalonia CLR control object, available
 * after the element has been mounted into the visual tree.
 */
export interface AvaloniaNode<TNative = unknown> {
  type: string;
  props: Record<string, unknown>;
  children: AvaloniaNode[];
  parent: AvaloniaNode | null;
  /** The underlying Avalonia native CLR control. Only set after mounting. */
  NativeControl?: TNative;
}

export const {
  render: solidRender,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps
} = createRenderer({
  createElement(string: string) {
    return { type: string, props: {}, children: [] };
  },
  createTextNode(value: string) {
    return { type: 'textBlock', props: { Text: value }, children: [] };
  },
  replaceText(textNode: any, value: string) {
    textNode.props.Text = value;
    if (textNode.NativeControl && typeof AvaloniaNative !== 'undefined') {
      AvaloniaNative.updateProperty(textNode.NativeControl, "Text", value);
    }
  },
  setProperty(node: any, name: string, value: any) {
    if (name === "props") {
      Object.assign(node.props, value);
    } else {
      // Map 'class' prop to 'Classes' for Avalonia
      const propName = name === "class" || name === "className" ? "Classes" : name;
      node.props[propName] = value;
      if (node.NativeControl && typeof AvaloniaNative !== 'undefined') {
        AvaloniaNative.updateProperty(node.NativeControl, propName, value);
      }
    }
  },
  insertNode(parent: any, node: any, anchor?: any) {
    node.parent = parent;
    if (anchor) {
      const index = parent.children.indexOf(anchor);
      parent.children.splice(index, 0, node);
    } else {
      parent.children.push(node);
    }

    if (parent.NativeControl && typeof AvaloniaNative !== 'undefined') {
      AvaloniaNative.insertChild(parent.NativeControl, node, anchor?.NativeControl || null);
    }
  },
  isTextNode(node: any) {
    return node.type === "textBlock";
  },
  removeNode(parent: any, node: any) {
    node.parent = null;
    const index = parent.children.indexOf(node);
    if (index > -1) {
      parent.children.splice(index, 1);
    }
    if (parent.NativeControl && node.NativeControl && typeof AvaloniaNative !== 'undefined') {
      AvaloniaNative.removeChild(parent.NativeControl, node.NativeControl);
    }
  },
  getParentNode(node: any) {
    return node.parent || null;
  },
  getFirstChild(node: any) {
    return node.children && node.children.length > 0 ? node.children[0] : null;
  },
  getNextSibling(node: any) {
    if (!node.parent) return null;
    const index = node.parent.children.indexOf(node);
    return index > -1 && index + 1 < node.parent.children.length ? node.parent.children[index + 1] : null;
  }
});

export function renderAvalonia(App: any) {
  const root = { type: 'panel', props: {}, children: [], parent: null };
  solidRender(App, root);
  return root;
}
