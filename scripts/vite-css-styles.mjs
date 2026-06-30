/**
 * vite-css-styles.mjs
 * 
 * Vite plugin that transforms CSS-in-JS syntax at build time:
 *   - css`button { background: red }` → inline AST JSON
 *   - keyframes`from { opacity: 0 } to { opacity: 1 }` → inline AnimationDef
 *   - <style>{`button { background: red }`}</style> → <GlobalStyles rules={...} />
 * 
 * Hot reload: works via existing HotReloadService.cs (full re-bundle → re-render)
 */

import { readFileSync } from 'fs';

/**
 * Lightweight CSS parser.
 * Converts CSS text into an array of { selector, properties } objects.
 */
function parseCss(cssText) {
  const rules = [];
  // Remove comments
  const clean = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  // Match selector { ... } blocks
  const blockRe = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = blockRe.exec(clean)) !== null) {
    const selector = match[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const body = match[2].trim();
    if (!selector || !body) continue;
    const properties = {};
    const propRe = /([^:]+?)\s*:\s*(.+?)(?:;|$)/g;
    let pm;
    while ((pm = propRe.exec(body)) !== null) {
      const key = pm[1].trim();
      let value = pm[2].trim();
      // Remove trailing semicolons
      if (value.endsWith(';')) value = value.slice(0, -1).trim();
      const mapped = mapCssProperty(key, value);
      if (mapped !== null) {
        Object.assign(properties, mapped);
      }
    }
    if (Object.keys(properties).length > 0) {
      rules.push({ selector, properties });
    }
  }
  return rules;
}

/**
 * Parse @keyframes CSS text into an AnimationDef.
 */
function parseKeyframes(name, cssText) {
  const keyframes = [];
  const keyframeRe = /\b(from|to|\d+%)\s*\{([^}]+)\}/g;
  let match;
  while ((match = keyframeRe.exec(cssText)) !== null) {
    const key = match[1].trim();
    const body = match[2].trim();
    const offset = key === 'from' ? 0 : key === 'to' ? 1 : parseInt(key) / 100;
    const properties = {};
    const propRe = /([^:]+?)\s*:\s*(.+?)(?:;|$)/g;
    let pm;
    while ((pm = propRe.exec(body)) !== null) {
      const pk = pm[1].trim();
      let pv = pm[2].trim();
      if (pv.endsWith(';')) pv = pv.slice(0, -1).trim();
      const mapped = mapCssProperty(pk, pv);
      if (mapped !== null) {
        Object.assign(properties, mapped);
      }
    }
    keyframes.push({ offset, properties });
  }

  keyframes.sort((a, b) => a.offset - b.offset);

  return {
    name: name || `kf_${Date.now().toString(36)}`,
    keyframes,
  };
}

/**
 * Map CSS property names/values to Avalonia property names/values.
 * Returns null for container/pseudo at-rules, object for mapped properties.
 */
function mapCssProperty(cssProp, cssValue) {
  const prop = cssProp.trim().toLowerCase();
  const val = cssValue.trim();

  // Skip at-rules and containers
  if (prop.startsWith('@') || prop === '') return null;

  // Handle special split properties
  if (prop === 'border') {
    const parts = val.split(/\s+/);
    const thickness = parts.find(p => /^\d/.test(p)) || '1';
    const color = parts.find(p => /^[#a-z]/.test(p) && isNaN(Number(p))) || 'black';
    return {
      BorderBrush: color,
      BorderThickness: thickness,
    };
  }

  if (prop === 'margin' || prop === 'padding') {
    const mappedProp = prop === 'margin' ? 'Margin' : 'Padding';
    return { [mappedProp]: convertThickness(val) };
  }

  if (prop === 'border-radius') {
    return { CornerRadius: convertThickness(val) };
  }

  if (prop === 'font-weight') {
    return { FontWeight: convertFontWeight(val) };
  }

  if (prop === 'filter') {
    if (val.startsWith('drop-shadow(')) {
      return { Effect: parseDropShadow(val) };
    }
    if (val.startsWith('blur(')) {
      const radius = extractNumbers(val)[0] || 5;
      return { Effect: { type: 'blur', radius } };
    }
    return null;
  }

  if (prop === 'box-shadow') {
    return { BoxShadow: val };
  }

  if (prop === 'transform') {
    return { RenderTransform: val };
  }

  if (prop === 'transform-origin') {
    return { RenderTransformOrigin: val };
  }

  if (prop === 'transition') {
    return { Transitions: parseTransitions(val) };
  }

  if (prop === 'animation') {
    // animation: name duration easing delay iterations direction fillMode
    // We don't resolve the keyframes here; that's done at the caller level.
    return null;
  }

  if (prop === 'background' || prop === 'opacity-mask') {
    if (val.startsWith('linear-gradient(')) {
      const mappedProp = prop === 'opacity-mask' ? 'OpacityMask' : 'Background';
      return { [mappedProp]: parseLinearGradient(val) };
    }
    if (val.startsWith('radial-gradient(')) {
      const mappedProp = prop === 'opacity-mask' ? 'OpacityMask' : 'Background';
      return { [mappedProp]: parseRadialGradient(val) };
    }
    if (val.startsWith('conic-gradient(')) {
      const mappedProp = prop === 'opacity-mask' ? 'OpacityMask' : 'Background';
      return { [mappedProp]: parseConicGradient(val) };
    }
  }

  if (prop === 'clip-path') {
    // SVG path syntax or basic shape
    if (val.startsWith('M') || val.startsWith('m') || val.startsWith('L') || val.startsWith('l')) {
      // SVG path data → passed as string (Geometry.Parse on C# side)
      return { Clip: val };
    }
  }

  // Standard property name
  const avaloniaProp = CSS_TO_AVALONIA[prop];
  if (avaloniaProp !== undefined) {
    if (avaloniaProp === null) return null; // handled specially

    // Convert CSS values
    if (prop === 'color' || prop === 'background' || prop === 'background-color') {
      return { [avaloniaProp]: convertColor(val) };
    }

    return { [avaloniaProp]: convertValue(val) };
  }

  // Pass through as-is (custom or unknown props)
  return { [convertPropertyName(prop)]: convertValue(val) };
}

// Property name conversion (kebab-case → PascalCase)
function convertPropertyName(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/^[a-z]/, c => c.toUpperCase());
}

// Value conversion
function convertValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  const num = Number(val);
  if (!isNaN(num) && val !== '') return num;
  // Handle quoted strings
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

function convertColor(val) {
  // rgba(r,g,b,a) → #AARRGGBB
  const rgba = val.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (rgba) {
    const a = Math.round(parseFloat(rgba[4]) * 255);
    return `#${padHex(a)}${padHex(+rgba[1])}${padHex(+rgba[2])}${padHex(+rgba[3])}`;
  }
  const rgb = val.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgb) {
    return `#${padHex(+rgb[1])}${padHex(+rgb[2])}${padHex(+rgb[3])}`;
  }
  return val;
}

function padHex(n) {
  return Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, '0');
}

function convertThickness(val) {
  // Strip surrounding quotes (e.g. "12 24" → 12 24)
  let v = val.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim();
  }
  const parts = v.split(/\s+/).map(p => p.replace(/px$/g, ''));
  if (parts.length === 1) return parts[0];
  return parts.join(',');
}

function convertFontWeight(val) {
  const map = {
    'thin': 'Thin', 'extralight': 'ExtraLight', 'light': 'Light',
    'semilight': 'SemiLight', 'normal': 'Normal', 'regular': 'Regular',
    'medium': 'Medium', 'semibold': 'SemiBold', 'bold': 'Bold',
    'extrabold': 'ExtraBold', 'black': 'Black',
  };
  return map[val.toLowerCase()] || val;
}

function extractNumbers(str) {
  return str.match(/[\d.]+/g)?.map(Number) || [];
}

function parseDropShadow(val) {
  // drop-shadow(offsetX offsetY blurRadius color)
  const inner = val.slice('drop-shadow('.length, -1);
  const parts = inner.trim().split(/\s+/);
  const color = parts.find(p => /^[#a-z]/i.test(p)) || 'black';
  const nums = parts.filter(p => /^[\d.]/.test(p));
  return {
    type: 'dropShadow',
    offsetX: parseFloat(nums[0]) || 0,
    offsetY: parseFloat(nums[1]) || 0,
    blurRadius: parseFloat(nums[2]) || 5,
    color,
  };
}

function parseTransform(val) {
  // Preserve as string - the C# side will parse or we use the JSON approach
  // Actually, we parse into the JSON structure here
  const transforms = [];
  const funcRe = /(\w+)\(([^)]+)\)/g;
  let match;
  while ((match = funcRe.exec(val)) !== null) {
    const name = match[1];
    const args = match[2].split(',').map(s => parseFloat(s.trim()));
    switch (name) {
      case 'rotate':
      case 'rotateZ':
        transforms.push({ type: 'rotate', angle: args[0] || 0 });
        break;
      case 'rotateX':
        transforms.push({ type: 'rotate', angle: args[0] || 0, centerY: 0.5 });
        break;
      case 'rotateY':
        transforms.push({ type: 'rotate', angle: args[0] || 0, centerX: 0.5 });
        break;
      case 'scale':
        transforms.push({ type: 'scale', x: args[0] || 1, y: args[1] || args[0] || 1 });
        break;
      case 'scaleX':
        transforms.push({ type: 'scale', x: args[0] || 1, y: 1 });
        break;
      case 'scaleY':
        transforms.push({ type: 'scale', x: 1, y: args[0] || 1 });
        break;
      case 'translate':
      case 'translate3d':
        transforms.push({ type: 'translate', x: args[0] || 0, y: args[1] || 0 });
        break;
      case 'translateX':
        transforms.push({ type: 'translate', x: args[0] || 0, y: 0 });
        break;
      case 'translateY':
        transforms.push({ type: 'translate', x: 0, y: args[0] || 0 });
        break;
      case 'skew':
        transforms.push({ type: 'skew', x: args[0] || 0, y: args[1] || 0 });
        break;
      case 'skewX':
        transforms.push({ type: 'skew', x: args[0] || 0, y: 0 });
        break;
      case 'skewY':
        transforms.push({ type: 'skew', x: 0, y: args[0] || 0 });
        break;
    }
  }

  if (transforms.length === 1) return transforms[0];
  if (transforms.length > 1) return { type: 'group', children: transforms };
  return null;
}

function parseTransitions(val) {
  // transition: property duration easing, property duration easing
  const items = [];
  const parts = val.split(',');

  for (const part of parts) {
    const tokens = part.trim().split(/\s+/);
    if (tokens.length === 0) continue;

    const cssProp = tokens[0];
    const avaloniaProp = CSS_TO_AVALONIA[cssProp];
    const property = avaloniaProp !== undefined ? avaloniaProp : convertPropertyName(cssProp);
    const item = { property };

    let hasDuration = false;
    for (let i = 1; i < tokens.length; i++) {
      const t = tokens[i].toLowerCase();
      if (/^[\d.]/.test(t)) {
        let val = parseFloat(t);
        if (t.endsWith('ms')) {
          // keep as ms
        } else if (t.endsWith('s')) {
          val *= 1000;
        }
        
        if (!hasDuration) {
          item.duration = val;
          hasDuration = true;
        } else {
          item.delay = val;
        }
      } else {
        item.easing = t;
      }
    }

    items.push(item);
  }

  return items;
}

function parseGradientStops(stopsStr) {
  const rawStops = [];
  // Parse "red 0%, blue 50%, green 100%" or "red, blue"
  const parts = stopsStr.split(',');
  for (const part of parts) {
    const trimmed = part.trim();
    const colorMatch = trimmed.match(/^([^ ]+)(?:\s+([\d.]+%?))?/);
    if (colorMatch) {
      const color = convertColor(colorMatch[1]);
      let offset = null;
      if (colorMatch[2]) {
        offset = parseFloat(colorMatch[2]) / 100;
      }
      rawStops.push({ offset, color });
    }
  }

  // Auto-distribute offsets if any are missing
  const hasExplicitOffset = rawStops.some(s => s.offset !== null);

  if (!hasExplicitOffset && rawStops.length > 0) {
    // Distribute evenly from 0 to 1
    return rawStops.map((s, i, arr) => ({
      color: s.color,
      offset: arr.length === 1 ? 0 : i / (arr.length - 1),
    }));
  }

  if (hasExplicitOffset) {
    // Fill in missing offsets by linear interpolation
    let lastKnownIdx = -1;
    for (let i = 0; i < rawStops.length; i++) {
      if (rawStops[i].offset !== null) {
        if (lastKnownIdx >= 0 && i - lastKnownIdx > 1) {
          // Interpolate between lastKnownIdx and i
          const startOffset = rawStops[lastKnownIdx].offset;
          const endOffset = rawStops[i].offset;
          const gap = i - lastKnownIdx;
          for (let j = lastKnownIdx + 1; j < i; j++) {
            rawStops[j].offset = startOffset + (endOffset - startOffset) * (j - lastKnownIdx) / gap;
          }
        }
        lastKnownIdx = i;
      }
    }
    // Fill leading nulls with 0
    for (let i = 0; i < rawStops.length && rawStops[i].offset === null; i++) {
      rawStops[i].offset = 0;
    }
    // Fill trailing nulls with 1
    for (let i = rawStops.length - 1; i >= 0 && rawStops[i].offset === null; i--) {
      rawStops[i].offset = 1;
    }
  }

  return rawStops.map(s => ({ color: s.color, offset: s.offset ?? 0 }));
}

function parseRelativePoint(val) {
  if (!val || val === 'center') return '0.5,0.5';
  if (val === 'top left' || val === 'left top') return '0,0';
  if (val === 'top right' || val === 'right top') return '1,0';
  if (val === 'bottom left' || val === 'left bottom') return '0,1';
  if (val === 'bottom right' || val === 'right bottom') return '1,1';
  if (val === 'top') return '0.5,0';
  if (val === 'bottom') return '0.5,1';
  if (val === 'left') return '0,0.5';
  if (val === 'right') return '1,0.5';
  const parts = val.trim().split(/\s+/);
  if (parts.length === 2) {
    const x = parts[0].replace('px', '');
    const y = parts[1].replace('px', '');
    return `${x},${y}`;
  }
  return '0.5,0.5';
}

function parseLinearGradient(val) {
  const inner = val.slice('linear-gradient('.length, -1);
  // Parse direction: to left/right/top/bottom or angle
  let startPoint = '0,0.5';
  let endPoint = '1,0.5';
  let rest = inner;

  const firstToken = rest.trim().split(',')[0].trim();
  if (firstToken.startsWith('to ')) {
    const dir = firstToken.slice(3);
    if (dir.includes('left')) { startPoint = '1,0.5'; endPoint = '0,0.5'; }
    else if (dir.includes('right')) { /* default */ }
    else if (dir.includes('top')) { startPoint = '0.5,1'; endPoint = '0.5,0'; }
    else if (dir.includes('bottom')) { startPoint = '0.5,0'; endPoint = '0.5,1'; }
    rest = rest.slice(firstToken.length + 1);
  } else if (/^[\d.]+deg/.test(firstToken)) {
    const angle = parseFloat(firstToken) * Math.PI / 180;
    startPoint = `${0.5 - 0.5 * Math.cos(angle)},${0.5 - 0.5 * Math.sin(angle)}`;
    endPoint = `${0.5 + 0.5 * Math.cos(angle)},${0.5 + 0.5 * Math.sin(angle)}`;
    rest = rest.slice(firstToken.length + 1);
  }

  const stops = parseGradientStops(rest);
  return { type: 'linearGradient', startPoint, endPoint, stops };
}

function parseRadialGradient(val) {
  const inner = val.slice('radial-gradient('.length, -1);
  return {
    type: 'radialGradient',
    center: '0.5,0.5',
    gradientOrigin: '0.5,0.5',
    radiusX: '0.5',
    radiusY: '0.5',
    stops: parseGradientStops(inner),
  };
}

function parseConicGradient(val) {
  const inner = val.slice('conic-gradient('.length, -1);
  let angle = 0;
  let center = '0.5,0.5';
  let rest = inner.trim();

  const fromMatch = rest.match(/^from\s+([\d.]+deg)/);
  if (fromMatch) {
    angle = parseFloat(fromMatch[1]);
    rest = rest.slice(fromMatch[0].length + 1);
  }

  const atMatch = rest.match(/^at\s+(.+?)\s*,/);
  if (atMatch) {
    center = parseRelativePoint(atMatch[1]);
    rest = rest.slice(atMatch[0].length);
  }

  return {
    type: 'conicGradient',
    center,
    angle,
    stops: parseGradientStops(rest),
  };
}

// CSS property → Avalonia property name mapping
const CSS_TO_AVALONIA = {
  'background': 'Background',
  'color': 'Foreground',
  'margin': 'Margin',
  'padding': 'Padding',
  'border-radius': 'CornerRadius',
  'border': null,
  'border-brush': 'BorderBrush',
  'border-thickness': 'BorderThickness',
  'font-size': 'FontSize',
  'font-weight': 'FontWeight',
  'font-family': 'FontFamily',
  'text-align': 'TextAlignment',
  'opacity': 'Opacity',
  'width': 'Width',
  'height': 'Height',
  'min-width': 'MinWidth',
  'max-width': 'MaxWidth',
  'min-height': 'MinHeight',
  'max-height': 'MaxHeight',
  'box-shadow': 'BoxShadow',
  'transform': 'RenderTransform',
  'transform-origin': 'RenderTransformOrigin',
  'transition': 'Transitions',
  'animation': null,
  'overflow': 'ClipToBounds',
  'z-index': 'ZIndex',
  'cursor': 'Cursor',
  'visibility': 'IsVisible',
  'spacing': 'Spacing',
  'orientation': 'Orientation',
  'filter': 'Effect',
  'clip-path': 'Clip',
  'opacity-mask': 'OpacityMask',
};

/**
 * Extract style objects from a tagged template call.
 */
function extractStylesFromTaggedTemplate(node, importName) {
  // node is a TaggedTemplateExpression
  // Quasis[].value.raw contains the template string values
  // Expressions[] contains interpolated values
  const quasis = node.quasi.quasis;
  const expressions = node.quasi.expressions;

  let cssText = '';
  for (let i = 0; i < quasis.length; i++) {
    cssText += quasis[i].value.raw || quasis[i].value.cooked;
    if (i < expressions.length) {
      // For interpolated values like ${fadeIn}, we need to reference them
      // For static values, this works fine; for dynamic, we fall through to runtime
      // We use a placeholder that will be replaced at runtime
      cssText += `__INTERP_${i}__`;
    }
  }

  return parseCss(cssText);
}

/**
 * Extract keyframes from a keyframes tagged template call.
 */
function extractKeyframesFromTaggedTemplate(node) {
  const quasis = node.quasi.quasis;
  const expressions = node.quasi.expressions;

  let cssText = '';
  for (let i = 0; i < quasis.length; i++) {
    cssText += quasis[i].value.raw || quasis[i].value.cooked;
    if (i < expressions.length) {
      cssText += `__INTERP_${i}__`;
    }
  }

  return parseKeyframes(`kf_${Date.now().toString(36)}`, cssText);
}

/**
 * Generate the replacement AST for a css`...` call.
 */
function replaceCssTag(node, importName) {
  const rules = extractStylesFromTaggedTemplate(node, importName);
  const obj = JSON.stringify({ rules });

  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'Object' },
    arguments: [],
    // We replace the entire expression with a JSON literal
    replacement: `(${obj})`,
  };
}

/**
 * Generate the replacement AST for a keyframes`...` call.
 */
function replaceKeyframesTag(node) {
  const anim = extractKeyframesFromTaggedTemplate(node);
  const obj = JSON.stringify(anim);
  return `(${obj})`;
}

/**
 * Find and replace `<style>{"..."}</style>` with `<GlobalStyles rules={...} />`.
 */
function transformStyleJsxElements(ast) {
  // This operates on the AST during the transform phase
  return ast;
}

/**
 * Vite plugin.
 * Transforms CSS tagged templates and <style> elements at build time.
 * @returns {import('vite').Plugin}
 */
export default function viteCssStyles() {
  return {
    name: 'vite-css-styles',
    enforce: 'pre',
    transform(code, id) {
      // Only process JS/TS files
      if (!/\.(tsx|ts|jsx|js)$/.test(id)) return null;
      // Skip node_modules
      if (id.includes('node_modules')) return null;

      let transformed = code;

      // Replace css`...` tagged templates
      const cssTagRe = /(\w+)`([^`]*)`/g;
      transformed = transformed.replace(cssTagRe, (match, tag, cssContent) => {
        if (tag === 'css') {
          const rules = parseCss(cssContent);
          return JSON.stringify({ rules });
        }
        return match;
      });

      // Replace keyframes`...` tagged templates
      const kfTagRe = /keyframes`([^`]*)`/g;
      transformed = transformed.replace(kfTagRe, (match, cssContent) => {
        const anim = parseKeyframes(`kf_${Date.now().toString(36)}`, cssContent);
        return JSON.stringify(anim);
      });

      // Replace <style>{`...`}</style> with <GlobalStyles rules={...} />
      let needsGlobalStylesImport = false;
      const styleRe = /<style>\{`([^`]*)`\}<\/style>/g;
      transformed = transformed.replace(styleRe, (match, cssContent) => {
        const rules = parseCss(cssContent);
        needsGlobalStylesImport = true;
        return `<GlobalStyles rules={${JSON.stringify(rules)}} />`;
      });

      if (needsGlobalStylesImport) {
        // Ensure GlobalStyles is imported from avalonia-jsx
        const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]avalonia-jsx['"]/;
        const importMatch = transformed.match(importRe);
        if (importMatch) {
          const existing = importMatch[1];
          if (!existing.includes('GlobalStyles')) {
            const newImport = existing.trim().replace(/,?\s*$/, ', GlobalStyles');
            transformed = transformed.replace(importRe, `import { ${newImport} } from 'avalonia-jsx'`);
          }
        } else {
          // No existing import from avalonia-jsx — add one
          transformed = `import { GlobalStyles } from 'avalonia-jsx';\n${transformed}`;
        }
      }

      if (transformed !== code) {
        return { code: transformed, map: null };
      }

      return null;
    },
  };
}
