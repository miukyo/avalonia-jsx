#!/usr/bin/env node
/**
 * generate-components.mjs
 * 
 * Generates avalonia-jsx/src/components.tsx by parsing Avalonia C# source files.
 * Reads all .cs files under the Avalonia.Controls source directory tree,
 * extracts public class declarations, their inheritance, AvaloniaProperty
 * registrations, and event declarations, then emits:
 *   - An intrinsic JSX element module augmentation
 *   - Native CLR interface types (for the types listed in NATIVE_TYPE_MAP)
 *   - AvaloniaRef<T> helper
 *   - Props interfaces with typed ref overrides where applicable
 *   - Component factory functions
 *
 * Usage:
 *   node scripts/generate-components.mjs
 *
 * Outputs to: avalonia-jsx/src/components.tsx
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Source directories to scan
// ---------------------------------------------------------------------------
const SCAN_DIRS = [
  join(ROOT, 'Avalonia/src/Avalonia.Base'),
  join(ROOT, 'Avalonia/src/Avalonia.Controls'),
  join(ROOT, 'Avalonia/src/Avalonia.Controls.ColorPicker'),
];

// ---------------------------------------------------------------------------
// Base classes whose properties we flatten into ControlProps.
// These are NOT emitted as separate components but their properties ARE
// collected and injected via the EXTRA_PROPS mechanism.
// ---------------------------------------------------------------------------
const BASE_HIERARCHY = [
  // Order matters: properties are picked up from deepest ancestor first
  'StyledElement',    // DataContext, Name, Theme, Resources
  'Visual',           // Opacity, IsVisible, RenderTransform, ZIndex, ClipToBounds, Clip
  'Layoutable',       // Width, Height, Margin, HorizontalAlignment, VerticalAlignment, etc.
  'InputElement',     // IsEnabled, IsHitTestVisible, Cursor, Focusable, etc.
  'Interactive',      // pointer / keyboard / focus events
];

// ---------------------------------------------------------------------------
// C# → TypeScript type mapping
// ---------------------------------------------------------------------------
const TYPE_MAP = {
  // Primitives
  'bool': 'boolean',
  'bool?': 'boolean',
  'int': 'number',
  'int?': 'number',
  'uint': 'number',
  'double': 'number',
  'double?': 'number',
  'float': 'number',
  'long': 'number',
  'string': 'string',
  'string?': 'string',
  'object': 'any',
  'object?': 'any',
  'char': 'any',
  'TimeSpan': 'any',
  'TimeSpan?': 'any',
  'DateTime': 'any',
  'DateTime?': 'any',

  // Avalonia-specific complex types → TS string (parsed by ControlFactory)
  'Thickness': 'string | number',
  'Thickness?': 'string | number',
  'CornerRadius': 'string | number',
  'CornerRadius?': 'string | number',
  'GridLength': 'string | number',
  'GridLength?': 'string | number',
  'IBrush': 'string',
  'IBrush?': 'string',
  'Color': 'string',
  'Color?': 'string',
  'ICommand': 'any',
  'ICommand?': 'any',
  'KeyGesture': 'any',
  'KeyGesture?': 'any',
  'FontFamily': 'any',
  'FontFamily?': 'any',
  'HsvColor': 'any',
  'HsvColor?': 'any',
  'FontWeight': fontWeightUnion(),
  'FontStyle': "'Normal' | 'Italic' | 'Oblique'",
  'FontStretch': fontStretchUnion(),
  'FontFeatureCollection': 'JSX.Element | JSX.Element[]',
  'FontFeatureCollection?': 'JSX.Element | JSX.Element[]',
  'ITransition': 'JSX.Element | JSX.Element[]',
  'Transitions': 'JSX.Element | JSX.Element[]',
  'Rect': 'any',
  'Rect?': 'any',
  'Point': 'any',
  'Point?': 'any',
  'Vector': 'any',
  'Size': 'any',
  'Size?': 'any',
  'RelativePoint': 'any',
  'Uri': 'any',
  'Uri?': 'any',
  'Cursor': 'any',
  'Cursor?': 'any',
  'BoxShadow': 'string',
  'BoxShadows': 'any',
  'IImage': 'any',
  'IImage?': 'any',
  'IEffect': 'any',
  'IEffect?': 'any',
  'ExperimentalAcrylicMaterial': 'any',
  'ExperimentalAcrylicMaterial?': 'any',
  'ITransform': 'any',
  'ITransform?': 'any',
  'FlowDirection': "'LeftToRight' | 'RightToLeft'",
  'HorizontalAlignment': "'Stretch' | 'Left' | 'Center' | 'Right'",
  'VerticalAlignment': "'Stretch' | 'Top' | 'Center' | 'Bottom'",
  'TextAlignment': "'Left' | 'Center' | 'Right' | 'Start' | 'End' | 'DetectFromContent' | 'Justify'",
  'TextWrapping': "'NoWrap' | 'Wrap' | 'WrapWithOverflow'",
  'TextTrimming': 'any',
  'TextTrimming?': 'any',
  'Stretch': "'None' | 'Fill' | 'Uniform' | 'UniformToFill'",
  'StretchDirection': "'UpOnly' | 'DownOnly' | 'Both'",
  'Orientation': "'Horizontal' | 'Vertical'",
  'ScrollBarVisibility': "'Disabled' | 'Auto' | 'Hidden' | 'Visible'",
  'Geometry': 'string',
  'Geometry?': 'string',
  'Bitmap': 'any',
  'IDataTemplate': 'any',
  'IDataTemplate?': 'any',
  'IPageTransition': 'any',
  'IPageTransition?': 'any',
  'IControlTemplate': 'any',
  'IColorPalette': 'any',
  'IColorPalette?': 'any',
  'IControlTemplate': 'any',
  'IControlTemplate?': 'any',
  'InlineCollection': 'JSX.Element | JSX.Element[]',
  'InlineCollection?': 'JSX.Element | JSX.Element[]',
  'IEnumerable<Color>': 'JSX.Element | JSX.Element[]',
  'IEnumerable<Color>?': 'JSX.Element | JSX.Element[]',
  'IItemContainerGenerator': 'any',
  'IItemsPanel': 'any',
  'IPanel': 'any',
  'ItemsLayoutType': 'any',
  'FlyoutBase': 'any',
  'FlyoutBase?': 'any',
  'ContextMenu': 'any',
  'ContextMenu?': 'any',
  'ControlTheme': 'any',
  'ControlTheme?': 'any',
  'FlyoutShowMode': 'any',
  'FlyoutShowMode?': 'any',
  'BackgroundSizing': "'InnerBorderEdge' | 'OuterBorderEdge' | 'CenterBorder'",
  'SnapPointsType': "'None' | 'Mandatory' | 'MandatorySingle'",
  'SnapPointsAlignment': "'Near' | 'Center' | 'Far'",
  'NumberStyles': 'any',
  'CultureInfo': 'any',
  'CultureInfo?': 'any',
  'INumberFormatter': 'any',
  'INumberFormatter?': 'any',
  'NumberFormat': 'any',
  'DataValidationMode': 'any',
  'WindowIcon': 'any',
  'WindowIcon?': 'any',
  'PixelPoint': 'any',
  'PixelPoint?': 'any',
  'PixelSize': 'any',
  'PixelSize?': 'any',
  'IThemeVariant': 'any',
  'ThemeVariant': 'any',
  'ThemeVariant?': 'any',
  'ResourceDictionary': 'JSX.Element | JSX.Element[]',
  'IResourceDictionary': 'JSX.Element | JSX.Element[]',
  'Transitions?': 'JSX.Element | JSX.Element[]',
  'ColumnDefinitions': 'JSX.Element | JSX.Element[]',
  'RowDefinitions': 'JSX.Element | JSX.Element[]',
  'IReadOnlyList<WindowTransparencyLevel>': 'string | string[] | any',
  'WindowTransparencyLevel': 'string | any',
};

function fontWeightUnion() {
  return "'Thin' | 'ExtraLight' | 'UltraLight' | 'Light' | 'SemiLight' | 'Normal' | 'Regular' | 'Medium' | 'DemiBold' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'UltraBold' | 'Black' | 'Heavy' | 'Solid' | 'ExtraBlack' | 'UltraBlack'";
}
function fontStretchUnion() {
  return "'UltraCondensed' | 'ExtraCondensed' | 'Condensed' | 'SemiCondensed' | 'Normal' | 'SemiExpanded' | 'Expanded' | 'ExtraExpanded' | 'UltraExpanded'";
}

// ---------------------------------------------------------------------------
// Classes that should get a native interface for ref support
// Maps ClassName → NativeTypeName
// ---------------------------------------------------------------------------
const NATIVE_TYPE_MAP = {
  'Control': 'NativeControl',
  'TemplatedControl': 'NativeTemplatedControl',
  'ContentControl': 'NativeContentControl',
  'Button': 'NativeButton',
  'ToggleButton': 'NativeToggleButton',
  'CheckBox': 'NativeCheckBox',
  'ColumnDefinition': 'NativeColumnDefinition',
  'TextBlock': 'NativeTextBlock',
  'TextBox': 'NativeTextBox',
  'StackPanel': 'NativeStackPanel',
  'Border': 'NativeBorder',
  'ColorPicker': 'NativeColorPicker',
  'ColorSlider': 'NativeColorSlider',
  'ColorSpectrum': 'NativeColorSpectrum',
  'ColorView': 'NativeColorView',
  'CommandBar': 'NativeCommandBar',
  'Slider': 'NativeSlider',
  'ProgressBar': 'NativeProgressBar',
  'ComboBox': 'NativeComboBox',
  'ListBox': 'NativeListBox',
  'NumericUpDown': 'NativeNumericUpDown',
  'PipsPager': 'NativePipsPager',
  'RowDefinition': 'NativeRowDefinition',
  'ScrollViewer': 'NativeScrollViewer',
  'Spinner': 'NativeSpinner',
  'TabControl': 'NativeTabControl',
  'Window': 'NativeWindow',
  'WindowBase': 'NativeWindowBase',
};

// ---------------------------------------------------------------------------
// Helpers to dynamically generate native interfaces for ref support
// ---------------------------------------------------------------------------
function collectAllPropertiesAndMethods(className, classMap) {
  const properties = [];
  const methods = [];
  const seenProps = new Set();
  const seenMethods = new Set();

  let current = className;
  while (current) {
    const info = classMap.get(current);
    if (info) {
      for (const p of info.properties) {
        if (!seenProps.has(p.name)) {
          seenProps.add(p.name);
          properties.push(p);
        }
      }
      for (const m of info.methods) {
        if (!seenMethods.has(m.name)) {
          seenMethods.add(m.name);
          methods.push(m);
        }
      }
    }

    // Stop if the base class has its own native interface in NATIVE_TYPE_MAP
    if (info && info.base && NATIVE_TYPE_MAP[info.base]) {
      break;
    }
    current = info?.base;
  }

  return { properties, methods };
}

function generateNativeInterfaces(classMap) {
  const lines = [];

  for (const [className, nativeName] of Object.entries(NATIVE_TYPE_MAP)) {
    const info = classMap.get(className);

    let baseNativeName = null;
    if (info && info.base) {
      let currentBase = info.base;
      while (currentBase) {
        if (NATIVE_TYPE_MAP[currentBase]) {
          baseNativeName = NATIVE_TYPE_MAP[currentBase];
          break;
        }
        const baseInfo = classMap.get(currentBase);
        currentBase = baseInfo?.base;
      }
    }

    if (baseNativeName) {
      lines.push(`export interface ${nativeName} extends ${baseNativeName} {`);
    } else {
      lines.push(`export interface ${nativeName} {`);
    }

    const { properties, methods } = collectAllPropertiesAndMethods(className, classMap);

    // Output properties
    for (const prop of properties) {
      if (prop.name === 'ref' || prop.name === 'Template') continue;
      lines.push(`  ${prop.name}?: ${prop.tsType};`);
    }

    // Output methods
    for (const method of methods) {
      lines.push(`  ${method.name}(${method.params}): ${method.returnType};`);
    }

    lines.push(`}`);
    lines.push(``);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Known enum values — used to produce union types
// ---------------------------------------------------------------------------
const ENUM_VALUES = {
  'ClickMode': "'Release' | 'Press'",
  'CommandBarDefaultLabelPosition': "'Bottom' | 'Right' | 'Collapsed'",
  'CommandBarOverflowButtonVisibility': "'Auto' | 'Visible' | 'Collapsed'",
  'SelectionMode': "'Single' | 'Multiple' | 'Toggle' | 'AlwaysSelected'",
  'PlacementMode': "'Pointer' | 'Bottom' | 'Right' | 'Left' | 'Top' | 'Center' | 'AnchorAndGravity' | 'TopEdgeAlignedLeft' | 'TopEdgeAlignedRight' | 'BottomEdgeAlignedLeft' | 'BottomEdgeAlignedRight' | 'LeftEdgeAlignedTop' | 'LeftEdgeAlignedBottom' | 'RightEdgeAlignedTop' | 'RightEdgeAlignedBottom' | 'Custom'",
  'PopupAnchor': "'None' | 'Top' | 'Bottom' | 'VerticalMask' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight' | 'HorizontalMask' | 'AllMask'",
  'PopupGravity': "'None' | 'Top' | 'Bottom' | 'Left' | 'TopLeft' | 'BottomLeft' | 'Right' | 'TopRight' | 'BottomRight'",
  'PopupPositionerConstraintAdjustment': "'None' | 'SlideX' | 'SlideY' | 'FlipX' | 'FlipY' | 'ResizeX' | 'ResizeY' | 'All'",
  'ExpandDirection': "'Down' | 'Up' | 'Left' | 'Right'",
  'FillRule': "'EvenOdd' | 'NonZero'",
  'SplitViewDisplayMode': "'Inline' | 'CompactInline' | 'Overlay' | 'CompactOverlay'",
  'SplitViewPanePlacement': "'Left' | 'Right'",
  'TabPlacement': "'Left' | 'Bottom' | 'Right' | 'Top'",
  'ValidSpinDirections': "'None' | 'Increase' | 'Decrease'",
  'CalendarSelectionMode': "'SingleDate' | 'SingleRange' | 'MultipleRange' | 'None'",
  'ColorComponent': "'Alpha' | 'Component1' | 'Component2' | 'Component3'",
  'ColorModel': "'Hsva' | 'Rgba'",
  'ColorSpectrumComponents': "'HueValue' | 'ValueHue' | 'HueSaturation' | 'SaturationHue' | 'SaturationValue' | 'ValueSaturation'",
  'ColorSpectrumShape': "'Box' | 'Ring'",
  'ColorViewTab': "'Spectrum' | 'Palette' | 'Components'",
  'CalendarMode': "'Month' | 'Year' | 'Decade'",
  'DayOfWeek': "'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'",
  'Dock': "'Left' | 'Bottom' | 'Right' | 'Top'",
  'SelectedDateFormat': "'Long' | 'Short' | 'Custom'",
  'SpinnerValidSpinDirection': "'None' | 'Increase' | 'Decrease'",
  'ButtonSpinnerLocation': "'Left' | 'Right'",
  'ResizeDirection': "'Auto' | 'Columns' | 'Rows'",
  'GridResizeBehavior': "'BasedOnAlignment' | 'CurrentAndNext' | 'PreviousAndCurrent' | 'PreviousAndNext'",
  'TabStripPlacement': "'Left' | 'Bottom' | 'Right' | 'Top'",
  'WindowState': "'Normal' | 'Minimized' | 'Maximized' | 'FullScreen'",
  'SystemDecorations': "'None' | 'BorderOnly' | 'Full'",
  'SizeToContent': "'Manual' | 'Width' | 'Height' | 'WidthAndHeight'",
  'WindowStartupLocation': "'Manual' | 'CenterScreen' | 'CenterOwner'",
  'WindowClosingBehavior': "'OwnerAndChildWindows' | 'OwnerWindowOnly'",
  'ExtendClientAreaChromeHints': "'NoChrome' | 'SystemChrome' | 'Default' | 'PreferSystemChrome' | 'OSXThickTitleBar'",
  'TickBarPlacement': "'Left' | 'Top' | 'Right' | 'Bottom'",
  'TickPlacement': "'None' | 'TopLeft' | 'BottomRight' | 'Outside'",
  'RefreshVisualizerOrientation': "'Auto' | 'Normal' | 'Rotate90DegreesCounterclockwise' | 'Rotate270DegreesCounterclockwise'",
  'PullDirection': "'TopToBottom' | 'BottomToTop' | 'LeftToRight' | 'RightToLeft'",
  'NotificationType': "'Information' | 'Success' | 'Warning' | 'Error'",
  'PenLineCap': "'Flat' | 'Round' | 'Square'",
  'PenLineJoin': "'Bevel' | 'Miter' | 'Round'",
  'NotificationPosition': "'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight' | 'TopCenter' | 'BottomCenter'",
  'MenuItemToggleType': "'None' | 'CheckBox' | 'Radio'",
  'AlphaComponentPosition': "'Leading' | 'Trailing'",
  'AcrylicBackgroundSource': "'None' | 'Digger'",
  'AlignmentX': "'Left' | 'Center' | 'Right'",
  'AlignmentY': "'Top' | 'Center' | 'Bottom'",
  'AutoCompleteFilterMode': "'None' | 'StartsWith' | 'StartsWithCaseSensitive' | 'StartsWithOrdinal' | 'StartsWithOrdinalCaseSensitive' | 'Contains' | 'ContainsCaseSensitive' | 'ContainsOrdinal' | 'ContainsOrdinalCaseSensitive' | 'Equals' | 'EqualsCaseSensitive' | 'EqualsOrdinal' | 'EqualsOrdinalCaseSensitive' | 'Custom'",
  'NumberStyles': "'None' | 'AllowLeadingWhite' | 'AllowTrailingWhite' | 'AllowLeadingSign' | 'Integer' | 'AllowTrailingSign' | 'AllowParentheses' | 'AllowDecimalPoint' | 'AllowThousands' | 'Number' | 'AllowExponent' | 'Float' | 'AllowCurrencySymbol' | 'Currency' | 'Any' | 'AllowHexSpecifier' | 'HexNumber' | 'AllowBinarySpecifier' | 'BinaryNumber'",
  'PanelType': "'Year' | 'Month' | 'Day' | 'Hour' | 'Minute' | 'TimePeriod' | 'Second'",
  'WindowManagerMode': 'any',
  'ScrollEventType': 'any',
  'RemoteWidgetMode': "'Local' | 'Remote'",
};

// ---------------------------------------------------------------------------
// Enum types that we know resolve to these — used when we see the type name
// in a StyledProperty<T> or DirectProperty<T>
// ---------------------------------------------------------------------------
function mapCsType(rawType) {
  if (!rawType) return 'any';
  const t = rawType.trim().replace(/\?$/, '');
  const nullable = rawType.trim().endsWith('?');
  const key = rawType.trim();

  // Check direct map first
  if (TYPE_MAP[key]) return TYPE_MAP[key];
  if (TYPE_MAP[t]) return TYPE_MAP[t];

  // IList<X>, IReadOnlyList<X>, ObservableCollection<X> → JSX.Element[]
  if (/^(?:IList|IReadOnlyList|IReadOnlyCollection|ObservableCollection|AvaloniaList|IAvaloniaList|IEnumerable)</.test(t)) {
    return 'JSX.Element | JSX.Element[]';
  }

  // T? where T is a known enum
  if (ENUM_VALUES[t]) return ENUM_VALUES[t];

  // Nullable pattern already stripped, check base name
  const base = t.replace(/\?$/, '');
  if (ENUM_VALUES[base]) return ENUM_VALUES[base];

  return 'any';
}

// ---------------------------------------------------------------------------
// Collect all .cs files recursively
// ---------------------------------------------------------------------------
function collectCsFiles(dir) {
  const results = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return results; }
  for (const name of entries) {
    if (name === 'bin' || name === 'obj') continue;
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectCsFiles(full));
    } else if (name.endsWith('.cs')) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Parse a single C# file and extract class/property/event info
// ---------------------------------------------------------------------------
function parseParameters(paramStr) {
  if (!paramStr || !paramStr.trim()) return '';
  const params = paramStr.split(',').map(p => p.trim()).filter(Boolean);
  return params.map(p => {
    let clean = p.replace(/^(?:ref|out|params|this)\s+/, '');
    const parts = clean.split('=');
    const decl = parts[0].trim();
    const isOptional = parts.length > 1 || decl.includes('?');

    const spaceIdx = decl.lastIndexOf(' ');
    if (spaceIdx === -1) return `${decl}?: any`;

    const csType = decl.slice(0, spaceIdx).trim();
    const name = decl.slice(spaceIdx + 1).trim().replace(/\?$/, '');
    const tsType = mapCsType(csType);

    return `${name}${isOptional ? '?' : ''}: ${tsType}`;
  }).join(', ');
}

// ---------------------------------------------------------------------------
// Parse a single C# file and extract class/property/event info
// ---------------------------------------------------------------------------
function parseFile(src) {
  const classes = [];
  // Match public class declarations
  const classRe = /public\s+(?:abstract\s+|sealed\s+|partial\s+)*class\s+(\w+)(?:\s*:\s*([^\r\n{,]+))?/g;
  let m;
  while ((m = classRe.exec(src)) !== null) {
    const name = m[1];
    // Parse base — take first non-interface token (capital first letter, no I prefix rule)
    const baseRaw = m[2] ? m[2].split(',').map(s => s.trim()).filter(Boolean) : [];
    // Find the first concrete class (skip interfaces starting with I + uppercase)
    const base = baseRaw.find(b => {
      const id = b.split('<')[0].trim();
      return id.length > 0 && !/^I[A-Z]/.test(id) && id !== 'object';
    })?.split('<')[0].trim() || null;

    // Find the class body: scan forward to find matching braces
    const classStart = m.index;
    let braceDepth = 0;
    let bodyStart = src.indexOf('{', classStart);
    if (bodyStart === -1) continue;
    let bodyEnd = bodyStart;
    for (let i = bodyStart; i < src.length; i++) {
      if (src[i] === '{') braceDepth++;
      else if (src[i] === '}') {
        braceDepth--;
        if (braceDepth === 0) { bodyEnd = i; break; }
      }
    }
    const body = src.slice(bodyStart, bodyEnd + 1);

    const properties = [];
    const events = [];
    const methods = [];

    // Extract property declarations (StyledProperty<T>, DirectProperty<TOwner, TValue>, AttachedProperty<T>)
    const propDeclRe = /public\s+static\s+readonly\s+(?:Styled|Direct|Attached)Property<((?:[^<>]+|<[^<>]*>)+)>\s+(\w+)Property\s*=/g;
    let pm;
    while ((pm = propDeclRe.exec(body)) !== null) {
      let csType = pm[1].trim();
      // DirectProperty<TOwner, TValue> has two type params; take the last one (the value type)
      if (csType.includes(',')) {
        csType = csType.split(',').pop().trim();
      }
      const propName = pm[2];
      if (propName === 'Template') continue; // skip IControlTemplate
      properties.push({ name: propName, tsType: mapCsType(csType), csType });
    }

    // Extract standard public properties: public [modifiers] Type PropertyName { get; ... }
    const stdPropRe = /public\s+(?!static|class|event|interface|delegate|enum|struct)(?:(?:virtual|abstract|async|sealed|override)\s+)*([\w\d?<>\[\]]+)\s+(\w+)\s*\{\s*get;/g;
    let sp;
    while ((sp = stdPropRe.exec(body)) !== null) {
      const propType = sp[1];
      const propName = sp[2];
      if (propName === 'Template') continue;
      if (!properties.find(p => p.name === propName)) {
        properties.push({ name: propName, tsType: mapCsType(propType), csType: propType });
      }
    }

    // Extract expression-bodied public properties: public Type PropertyName => ...
    const exprPropRe = /public\s+(?!static|class|event|interface|delegate|enum|struct)(?:(?:virtual|abstract|async|sealed|override)\s+)*([\w\d?<>\[\]]+)\s+(\w+)\s*=>/g;
    let epb;
    while ((epb = exprPropRe.exec(body)) !== null) {
      const propType = epb[1];
      const propName = epb[2];
      if (propName === 'Template') continue;
      if (!properties.find(p => p.name === propName)) {
        properties.push({ name: propName, tsType: mapCsType(propType), csType: propType });
      }
    }

    // Extract public methods
    const methodRe = /public\s+(?!static|class|event|interface|delegate|enum|struct)(?:(?:virtual|abstract|async|sealed|override)\s+)*([\w\d?<>\[\]]+)\s+(\w+)\s*\(([^)]*)\)/g;
    let mm;
    while ((mm = methodRe.exec(body)) !== null) {
      const returnType = mm[1];
      const methodName = mm[2];
      const paramsStr = mm[3];

      if (methodName === name) continue;
      if (['get', 'set', 'add', 'remove'].includes(methodName.toLowerCase())) continue;

      const tsReturnType = mapCsType(returnType);
      const tsParams = parseParameters(paramsStr);

      methods.push({ name: methodName, params: tsParams, returnType: tsReturnType });
    }

    // Extract RoutedEvent declarations to find event names
    const evtRe = /public\s+static\s+readonly\s+RoutedEvent<[^>]*>\s+(\w+)Event\s*=/g;
    let em;
    while ((em = evtRe.exec(body)) !== null) {
      events.push(em[1]);
    }

    // Also extract public event declarations (EventHandler<T> or EventHandler)
    const evtDeclRe = /public\s+event\s+EventHandler(?:<[^>]*>)?\??\s+(\w+)\s*\{/g;
    let ed;
    while ((ed = evtDeclRe.exec(body)) !== null) {
      if (!events.includes(ed[1])) events.push(ed[1]);
    }

    classes.push({ name, base, properties, events, methods });
  }
  return classes;
}

// ---------------------------------------------------------------------------
// Build a map of className → classInfo
// ---------------------------------------------------------------------------
function buildClassMap(files) {
  const map = new Map(); // name → {name, base, properties, events, methods}
  for (const file of files) {
    let src;
    try { src = readFileSync(file, 'utf8'); } catch { continue; }
    const classes = parseFile(src);
    for (const cls of classes) {
      if (!map.has(cls.name)) {
        map.set(cls.name, cls);
      } else {
        // Merge properties, events and methods (multiple partial files)
        const existing = map.get(cls.name);
        for (const p of cls.properties) {
          if (!existing.properties.find(ep => ep.name === p.name)) {
            existing.properties.push(p);
          }
        }
        for (const e of cls.events) {
          if (!existing.events.includes(e)) existing.events.push(e);
        }
        for (const m of cls.methods) {
          if (!existing.methods.find(em => em.name === m.name)) {
            existing.methods.push(m);
          }
        }
        if (!existing.base && cls.base) existing.base = cls.base;
      }
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Convert PascalCase class name to camelCase intrinsic tag name
// ---------------------------------------------------------------------------
function toCamelCase(name) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

// ---------------------------------------------------------------------------
// The set of classes we actually emit components for — ordered
// to match the existing components.tsx structure
// ---------------------------------------------------------------------------
const COMPONENT_ORDER = [
  'AccessText', 'AdornerLayer', 'Arc', 'AutoCompleteBox',
  'Border', 'Button', 'ButtonSpinner',
  'Calendar', 'CalendarButton', 'CalendarDatePicker', 'CalendarDayButton', 'CalendarItem',
  'Canvas', 'CaptionButtons', 'Carousel', 'CarouselPage',
  'CheckBox', 'ChromeOverlayLayer',
  'ColumnDefinition',
  'ColorPicker', 'ColorPreviewer', 'ColorSlider', 'ColorSpectrum', 'ColorView',
  'CommandBar', 'CommandBarButton', 'CommandBarSeparator', 'CommandBarToggleButton',
  'ComboBox', 'ComboBoxItem',
  'ContentControl', 'ContentPage', 'ContentPresenter',
  'ContextMenu', 'Control',
  'DataValidationErrors', 'DatePicker', 'DatePickerPresenter', 'DateTimePickerPanel',
  'Decorator', 'DockPanel', 'DropDownButton',
  'Ellipse', 'EmbeddableControlRoot', 'Expander', 'ExperimentalAcrylicBorder',
  'Flyout', 'FlyoutPresenter', 'Grid', 'GridSplitter',
  'HeaderedContentControl', 'HeaderedItemsControl', 'HeaderedSelectingItemsControl',
  'HyperlinkButton', 'Image', 'ItemsControl', 'ItemsPresenter',
  'Label', 'LayoutTransformControl', 'LightDismissOverlayLayer', 'Line',
  'ListBox', 'ListBoxItem', 'MaskedTextBox',
  'Menu', 'MenuFlyout', 'MenuFlyoutPresenter', 'MenuItem',
  'NativeControlHost', 'NativeMenu', 'NativeMenuBar', 'NativeMenuItem',
  'NavigationPage',
  'NotificationCard', 'NumericUpDown',
  'OverlayLayer', 'OverlayPopupHost',
  'Page', 'Panel', 'Path', 'PathIcon', 'PipsPager', 'Polygon', 'Polyline', 'Popup', 'PopupRoot',
  'ProgressBar', 'RadioButton', 'RangeBase', 'Rectangle', 'RowDefinition',
  'RefreshContainer', 'RefreshVisualizer', 'RelativePanel', 'RemoteWidget', 'RepeatButton',
  'ReversibleStackPanel', 'Run', 'ScrollBar', 'ScrollContentPresenter', 'ScrollViewer',
  'Sector', 'Shape', 'SelectableTextBlock', 'SelectingItemsControl', 'Separator', 'Slider',
  'Span', 'Spinner', 'SplitButton', 'SplitView', 'StackPanel',
  'TabControl', 'TabItem', 'TabStrip', 'TabStripItem', 'TabbedPage', 'TemplatedControl',
  'TextBlock', 'TextBox', 'TextElement', 'TextPresenter', 'TextSelectionHandle', 'TextSelectorLayer',
  'ThemeVariantScope', 'Thumb', 'TickBar', 'TimePicker', 'TimePickerPresenter',
  'TitleBar', 'ToggleButton', 'ToggleSplitButton', 'ToggleSwitch', 'ToolTip',
  'Track', 'TransitioningContentControl', 'TreeView', 'TreeViewItem',
  'UniformGrid', 'UserControl', 'Viewbox',
  'VirtualizingCarouselPanel', 'VirtualizingStackPanel', 'VisualLayerManager',
  'Window', 'WindowBase', 'WindowNotificationManager', 'WrapPanel',
];

// Manual extra props for controls that the parser won't pick up cleanly
// The set of names we add manually to Control (they don't parse as StyledProperty)
const EXTRA_PROPS = {};

// Property names from base classes that should NOT be re-emitted on every
// derived class because they're already in ControlProps
const BASE_PROP_NAMES = new Set();

// Collect all property/event names from the base hierarchy into ControlProps.
// Called after the classMap is built.
function collectBaseProps(classMap) {
  const props = [];
  const events = [];
  const seen = new Set();
  for (const baseName of BASE_HIERARCHY) {
    const info = classMap.get(baseName);
    if (!info) continue;
    for (const p of info.properties) {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        BASE_PROP_NAMES.add(p.name);
        props.push(p);
      }
    }
    for (const e of info.events) {
      const key = 'on' + e;
      if (!seen.has(key)) {
        seen.add(key);
        BASE_PROP_NAMES.add(key);
        events.push(e);
      }
    }
  }
  return { props, events };
}

// Manual extra events for controls
const EXTRA_EVENTS = {
  'Button': ['Click'],
  'MenuItem': ['Click'],
  'SplitButton': ['Click'],
};

// Mapping C# event name → JS prop name (e.g. Click → onClick)
function eventToProp(eventName) {
  return 'on' + eventName;
}

// Get the Props interface name for a given class
function propsName(cls) { return cls + 'Props'; }

// Get the base Props interface name for a given class
function baseProps_gen(className, classInfo, classMap) {
  // Control is the root — it extends nothing
  if (className === 'Control') return null;
  if (!classInfo || !classInfo.base) return null;
  const baseClass = classInfo.base;
  if (COMPONENT_ORDER.includes(baseClass)) return propsName(baseClass);
  // Walk up the inheritance chain to find if we eventually reach a class in COMPONENT_ORDER
  let current = classMap.get(baseClass);
  while (current) {
    if (COMPONENT_ORDER.includes(current.name)) return propsName(current.name);
    if (current.name === 'Control') return 'ControlProps';
    if (!current.base) break;
    current = classMap.get(current.base);
  }
  return null;
}

// Resolve the native type for a class by walking up its hierarchy
function resolveNativeType(className, classMap) {
  if (NATIVE_TYPE_MAP[className]) return NATIVE_TYPE_MAP[className];
  const info = classMap.get(className);
  if (!info || !info.base) return 'NativeControl';
  return resolveNativeType(info.base, classMap);
}

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------
function generate(classMap, baseProps_, baseEvents_) {
  const lines = [];

  // Identify all classes that serve as a base class for other components
  const baseClasses = new Set();
  for (const cls of COMPONENT_ORDER) {
    const info = classMap.get(cls);
    const base = baseProps_gen(cls, info, classMap);
    if (base) {
      baseClasses.add(base.replace(/Props$/, ''));
    }
  }

  // Header
  lines.push(`import { JSX } from 'solid-js';`);
  lines.push(`import type { AvaloniaNode } from './renderer';`);
  lines.push(``);

  // Native type interfaces
  lines.push(`// ---------------------------------------------------------------------------`);
  lines.push(`// Native Avalonia CLR type interfaces`);
  lines.push(`// These describe the runtime properties accessible on node.NativeControl.`);
  lines.push(`// ---------------------------------------------------------------------------`);
  lines.push(generateNativeInterfaces(classMap).trim());
  lines.push(``);

  // AvaloniaRef helper
  lines.push(`// ---------------------------------------------------------------------------`);
  lines.push(`// Ref helper type`);
  lines.push(`// ---------------------------------------------------------------------------`);
  lines.push(``);
  lines.push(`/**`);
  lines.push(` * The type of a ref for an Avalonia component.`);
  lines.push(` *`);
  lines.push(` * Usage:`);
  lines.push(` * \`\`\`tsx`);
  lines.push(` * let ref: AvaloniaRef<NativeTextBox>;`);
  lines.push(` * <TextBox ref={ref!} />`);
  lines.push(` * // After mount: ref.NativeControl?.Text`);
  lines.push(` * \`\`\``);
  lines.push(` */`);
  lines.push(`export type AvaloniaRef<TNative = unknown> = AvaloniaNode<TNative>;`);
  lines.push(``);

  // Intrinsic JSX module augmentation
  lines.push(`declare module 'solid-js' {`);
  lines.push(`  namespace JSX {`);
  lines.push(`    interface IntrinsicElements {`);
  for (const cls of COMPONENT_ORDER) {
    if (classMap.has(cls) || EXTRA_PROPS[cls]) {
      lines.push(`      ${toCamelCase(cls)}: any;`);
    }
  }
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);

  // Props interfaces
  for (const cls of COMPONENT_ORDER) {
    const info = classMap.get(cls);
    if (!info && cls !== 'Control') continue;

    const base = baseProps_gen(cls, info, classMap);
    const nativeType = resolveNativeType(cls, classMap);
    const hasNativeOverride = NATIVE_TYPE_MAP[cls] !== undefined && cls !== 'Control';

    // Collect prop names to deduplicate
    const emittedProps = new Set();
    // Seed with base class prop names so derived classes don't re-emit them.
    // Only for classes that inherit from ControlProps (i.e., have a base props interface).
    if (base && cls !== 'Control') {
      for (const n of BASE_PROP_NAMES) emittedProps.add(n);
    }

    if (base) {
      lines.push(`export interface ${propsName(cls)} extends ${base} {`);
    } else {
      lines.push(`export interface ${propsName(cls)} {`);
    }

    // Ref override for classes with specific native types (not the base Control)
    if (hasNativeOverride) {
      const isBaseClass = baseClasses.has(cls);
      const refType = isBaseClass ? 'any' : nativeType;
      lines.push(`  ref?: AvaloniaRef<${refType}> | ((el: AvaloniaRef<${refType}>) => void);`);
      emittedProps.add('ref');
    }

    // For ControlProps, inject: children, ref (base), and all base hierarchy props
    if (cls === 'Control') {
      lines.push(`  children?: JSX.Element | JSX.Element[];`);
      emittedProps.add('children');
      lines.push(`  /** Ref to the virtual Avalonia node. Use AvaloniaRef<NativeXxx> for a typed native control. */`);
      lines.push(`  ref?: AvaloniaRef<any> | ((el: AvaloniaRef<any>) => void);`);
      emittedProps.add('ref');
      // Emit base hierarchy props (Layoutable, Visual, InputElement, etc.)
      for (const p of baseProps_) {
        lines.push(`  ${p.name}?: ${p.tsType};`);
        emittedProps.add(p.name);
      }
      for (const e of baseEvents_) {
        const propName = eventToProp(e);
        lines.push(`  ${propName}?: () => void;`);
        emittedProps.add(propName);
      }
    }

    // Properties from parsed C# (only those not already emitted by base hierarchy)
    const props = info ? [...info.properties] : [];
    if (info && info.base) {
      let currentBase = info.base;
      while (currentBase && currentBase !== 'Control' && !COMPONENT_ORDER.includes(currentBase)) {
        const baseInfo = classMap.get(currentBase);
        if (baseInfo) {
          props.push(...baseInfo.properties);
        }
        currentBase = baseInfo?.base;
      }
    }
    for (const prop of props) {
      if (emittedProps.has(prop.name)) continue;
      emittedProps.add(prop.name);
      lines.push(`  ${prop.name}?: ${prop.tsType};`);
    }

    // Events from parsed C#
    const evts = info ? [...info.events] : [];
    if (EXTRA_EVENTS[cls]) {
      for (const e of EXTRA_EVENTS[cls]) {
        if (!evts.includes(e)) evts.push(e);
      }
    }
    for (const evt of evts) {
      const propName = eventToProp(evt);
      if (emittedProps.has(propName)) continue;
      emittedProps.add(propName);
      lines.push(`  ${propName}?: () => void;`);
    }

    lines.push(`}`);
    lines.push(``);
  }

  // Component functions
  for (const cls of COMPONENT_ORDER) {
    if (!classMap.has(cls) && !EXTRA_PROPS[cls]) continue;
    const tag = toCamelCase(cls);
    lines.push(`export function ${cls}(props: ${propsName(cls)}) {`);
    lines.push(`  return <${tag} {...props} />;`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
const files = SCAN_DIRS.flatMap(d => collectCsFiles(d));
console.log(`Scanning ${files.length} C# files...`);

const classMap = buildClassMap(files);
console.log(`Found ${classMap.size} classes`);

// Collect base class props first (Layoutable, Visual, InputElement, etc.)
const { props: baseProps_, events: baseEvents_ } = collectBaseProps(classMap);

const output = generate(classMap, baseProps_, baseEvents_);

const outPath = join(ROOT, 'avalonia-jsx/src/components.tsx');
writeFileSync(outPath, output, 'utf8');
console.log(`Written to ${outPath} (${output.length} bytes)`);
