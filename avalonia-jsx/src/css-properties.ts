// Build-time CSS property mapping tables
// Used by the Vite plugin to convert CSS declarations to Avalonia property JSON

export const CSS_TO_AVALONIA_PROP: Record<string, string | null> = {
  'background': 'Background',
  'color': 'Foreground',
  'margin': 'Margin',
  'padding': 'Padding',
  'border-radius': 'CornerRadius',
  'border': null, // split into BorderBrush + BorderThickness
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
  'animation': null, // special: handled as animation reference
  'overflow': 'ClipToBounds',
  'z-index': 'ZIndex',
  'cursor': 'Cursor',
  'visibility': 'IsVisible',
  'spacing': 'Spacing',
  'orientation': 'Orientation',
  'horizontal-alignment': 'HorizontalAlignment',
  'vertical-alignment': 'VerticalAlignment',
  'filter': 'Effect',
  'clip-path': 'Clip',
  'opacity-mask': 'OpacityMask',
};

export const CSS_TO_AVALONIA_FONT_WEIGHT: Record<string, string> = {
  'thin': 'Thin',
  'extralight': 'ExtraLight',
  'ultralight': 'UltraLight',
  'light': 'Light',
  'semilight': 'SemiLight',
  'normal': 'Normal',
  'regular': 'Regular',
  'medium': 'Medium',
  'demibold': 'DemiBold',
  'semibold': 'SemiBold',
  'bold': 'Bold',
  'extrabold': 'ExtraBold',
  'ultrabold': 'UltraBold',
  'black': 'Black',
  'heavy': 'Heavy',
};

export function cssColorToAvalonia(color: string): string {
  // Most CSS color formats are already compatible with Avalonia
  // Handle rgba() → #AARRGGBB conversion
  const rgbaMatch = color.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = Math.round(parseFloat(rgbaMatch[4]) * 255);
    return `#${a.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  // Handle rgb()
  const rgbMatch = color.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  // Named colors and hex are passed as-is (Avalonia understands them)
  return color;
}

export function cssThicknessToAvalonia(value: string): string {
  const parts = value.trim().split(/\s+/).map(p => p.replace(/px$/, ''));
  if (parts.length === 1) return parts[0];
  return parts.join(',');
}
