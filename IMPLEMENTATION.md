# Implementation: CSS-in-JS Styling, Animations & Transitions

This document describes the architecture and implementation plan for adding a CSS-like styling system to the Avalonia-JS bridge, using `styled()` and `styled-jsx`-style `<style>` blocks.

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| Style mechanism | Global styles via `<style>` blocks + `styled()` HOC |
| Pseudo-class handling | Native Avalonia `Style` objects created on C# side (full selector matching) |
| Animation model | Fire-once via `Animation.RunAsync()` (state-driven already covered by transitions) |
| Transform/Effect spelling | CSS property syntax in style rules only, never inline props |
| Transition syntax | CSS string `"opacity 0.3s ease, transform 0.2s"` in style rules |
| CSS parsing | Build-time via Vite plugin (inline AST JSON). Hot reload via existing `HotReloadService.cs` |

---

## Architecture

```
[Build Time - Vite Plugin]
  .tsx with css`...`              ─┤
  .tsx with <style>{`...`}</style>  ─┤→ CSS Parser → inline AST JSON → bundle.js
  .tsx with keyframes`...`        ─┘

[Runtime - Jint inside .NET]
  bundle.js executes →
    styled(Component, rules) → AvaloniaNative.applyStyles(controlId, rulesJson)
    <style> → GlobalStyles → AvaloniaNative.addGlobalStyles(rulesJson)
    animation: fadeIn → AnimationFactory → Animation.RunAsync(control)
    transform: scale(1.02) → TransformFactory → ITransform
    transition: opacity 0.3s → TransitionFactory → Transitions collection
    effect: dropShadow → EffectFactory → IEffect
    clip: M 0 0 ... → GeometryFactory → Geometry
    background: linear-gradient(...) → BrushFactory → IBrush
```

---

## C# Bridge (Avalonia.JSBridge/)

### New Files

#### 1. `StyleFactory.cs`

Parses JSON style rules and creates native `Avalonia.Styling.Style` objects.

**Input JSON:**
```json
{
  "selector": "button:hover",
  "properties": { "Background": "red", "Opacity": 0.8 }
}
```

**Selector DSL (CSS subset) parsed on C# side:**

| CSS | Avalonia Selector API |
|-----|----------------------|
| `button` | `OfType<Button>()` |
| `.myClass` | `Class(".myClass")` |
| `#myName` | `Name("myName")` |
| `:hover` | `Class(":pointerover")` |
| `:active` | `Class(":pressed")` |
| `:focus` | `Class(":focus")` |
| `:disabled` | `Class(":disabled")` |
| `:checked` | `Class(":checked")` |
| `el.class` | `OfType<El>().Class(".class")` |
| `parent > child` | `.Child()` combinator |
| `parent child` | `.Descendant()` combinator |
| `:not(.x)` | `.Not(s => s.Class(":x"))` |
| `[prop=val]` | `.PropertyEquals(prop, val)` |
| `a, b` | `Or(a, b)` |

**Key methods:**
- `Style CreateStyle(string selectorJson, Dictionary<string, object> properties)` — parses selector string, builds `Selector` chain, creates `Setter` list, returns `Style`
- `SelectorsCollection ParseSelector(string selector)` — tokenizes and builds selector chain

#### 2. `AnimationFactory.cs`

Creates native `Animation` + `KeyFrame` objects from JSON. Does NOT add to any collection — the caller calls `RunAsync()` on the target control.

**Input JSON:**
```json
{
  "duration": 400,
  "easing": "cubic-bezier(0.25,0.1,0.25,1)",
  "delay": 0,
  "iterations": 1,
  "direction": "normal",
  "fillMode": "forward",
  "keyframes": [
    { "offset": 0.0, "properties": { "Opacity": 0, "RenderTransform": { "type": "translate", "y": -20 } } },
    { "offset": 1.0, "properties": { "Opacity": 1, "RenderTransform": { "type": "translate", "y": 0 } } }
  ]
}
```

**Easing mapping:**

| JSON string | Avalonia class |
|-------------|---------------|
| `"linear"` | `LinearEasing` |
| `"ease"` | `CubicEaseInOut` |
| `"ease-in"` | `CubicEaseIn` |
| `"ease-out"` | `CubicEaseOut` |
| `"ease-in-out"` | `CubicEaseInOut` |
| `"cubic-bezier(a,b,c,d)"` | `SplineEasing(a,b,c,d)` |
| `"spring(...)"` | `SpringEasing(...)` |
| `"bounce"` / `"bounce-in"` / etc. | `BounceEaseIn` / etc. |

**Key methods:**
- `Animation CreateAnimation(JObject json)` — deserializes into `Animation` with `KeyFrame` children and `Setter` values
- `Task RunAnimation(Animatable target, JObject json)` — creates + runs

#### 3. `TransformFactory.cs`

Creates native `ITransform` objects from JSON (used when CSS `transform` property appears in a style rule).

**Input JSON** (TS-side resolved from CSS string):
```json
{ "type": "rotate", "angle": 45 }
{ "type": "scale", "x": 2, "y": 2 }
{ "type": "translate", "x": 10, "y": 20 }
{ "type": "skew", "x": 10, "y": 5 }
{ "type": "group", "children": [
  { "type": "translate", "x": 10, "y": 10 },
  { "type": "rotate", "angle": 45 }
]}
```

**Key methods:**
- `ITransform CreateFromJson(JObject json)` — switch on `type` field, returns `RotateTransform`, `ScaleTransform`, `TranslateTransform`, `SkewTransform`, or `TransformGroup`
- `ITransform CreateGroup(JArray children)` — creates `TransformGroup` with ordered children

#### 4. `EffectFactory.cs`

Creates native `IEffect` objects from JSON. Maps CSS `filter` and `box-shadow` values to Avalonia effects.

**Input JSON:**
```json
{ "type": "dropShadow", "blurRadius": 5, "offsetX": 2, "offsetY": 2, "color": "#000", "opacity": 0.5 }
{ "type": "dropShadowDirection", "blurRadius": 5, "shadowDepth": 5, "direction": 315, "color": "#000" }
{ "type": "blur", "radius": 3 }
```

| JSON | Avalonia class |
|------|---------------|
| `{ "type": "dropShadow", ... }` | `DropShadowEffect` |
| `{ "type": "dropShadowDirection", ... }` | `DropShadowDirectionEffect` |
| `{ "type": "blur", ... }` | `BlurEffect` |

**`box-shadow` CSS value handling:**
The CSS `box-shadow` property is parsed at build time and converted to either:
- A `DropShadowEffect` JSON if the control has no `BoxShadow` property
- A `BoxShadow` struct JSON for controls that support `BoxShadow` natively (e.g., `Border`)

**Key methods:**
- `IEffect CreateFromJson(JObject json)` — switch on `type` field

#### 5. `GeometryFactory.cs`

Creates native `Geometry` objects from JSON/SVG path data (used when CSS `clip-path` property appears in a style rule).

**Input forms:**

```json
// SVG path string (delegates to StreamGeometry.Parse)
"clip-path": "M 0 0 L 100 0 L 50 100 Z"

// Rectangle
{ "type": "rectangle", "rect": { "x": 0, "y": 0, "width": 100, "height": 100 }, "radiusX": 5, "radiusY": 5 }

// Ellipse
{ "type": "ellipse", "rect": { "x": 0, "y": 0, "width": 100, "height": 100 } }

// Combined
{ "type": "combine", "mode": "union", "geometry1": {...}, "geometry2": {...} }
```

| CSS / JS form | Avalonia class |
|---------------|---------------|
| SVG path string `"M 0 0 L 100 0 Z"` | `StreamGeometry` (via `StreamGeometry.Parse()`) |
| `{ "type": "rectangle", ... }` | `RectangleGeometry` |
| `{ "type": "ellipse", ... }` | `EllipseGeometry` |
| `{ "type": "path", "data": "..." }` | `PathGeometry` (via `PathGeometry.Parse()`) |
| `{ "type": "combine", ... }` | `CombinedGeometry` |

**SVG path syntax** (accepted by `StreamGeometry.Parse`): `M` move, `L` line, `H` horizontal line, `V` vertical line, `C` cubic bezier, `S` smooth cubic, `Q` quadratic, `T` smooth quadratic, `A` arc, `Z` close, `F` fill rule.

**Key methods:**
- `Geometry CreateFromJson(object value)` — accepts string (SVG path) or JObject

#### 6. `BrushFactory.cs`

Creates native `IBrush` objects from JSON (used when CSS `background`, `opacity-mask`, or similar brush-valued properties use gradient syntax).

**Input JSON:**
```json
// Linear gradient
{ "type": "linearGradient", "startPoint": "0,0", "endPoint": "1,0", "stops": [
  { "offset": 0, "color": "#ff0000" },
  { "offset": 1, "color": "#0000ff" }
]}

// Radial gradient
{ "type": "radialGradient", "center": "0.5,0.5", "gradientOrigin": "0.5,0.5", "radiusX": "0.5", "radiusY": "0.5", "stops": [
  { "offset": 0, "color": "white" },
  { "offset": 1, "color": "black" }
]}

// Conic gradient
{ "type": "conicGradient", "center": "0.5,0.5", "angle": 0, "stops": [
  { "offset": 0, "color": "red" },
  { "offset": 0.25, "color": "yellow" },
  { "offset": 0.5, "color": "green" },
  { "offset": 0.75, "color": "blue" },
  { "offset": 1, "color": "red" }
]}

// Solid color (simple string - already handled)
"#ff0000"
```

| JSON | Avalonia class |
|------|---------------|
| `{ "type": "linearGradient", ... }` | `LinearGradientBrush` |
| `{ "type": "radialGradient", ... }` | `RadialGradientBrush` |
| `{ "type": "conicGradient", ... }` | `ConicGradientBrush` |
| Plain string `"red"` / `"#ff0000"` | Already handled by `Brush.Parse()` in `ControlFactory.cs` |

**All gradient brushes share:**
- `GradientStops` — list of `{ offset: number, color: string }`
- `SpreadMethod` — `"pad"`, `"reflect"`, or `"repeat"`
- `Opacity` — number (0-1)

**Key methods:**
- `IBrush CreateFromJson(JObject json)` — switch on `type` field
- `IList<GradientStop> ParseGradientStops(JArray stops)` — parses offset/color pairs

### Modified Files

#### `ControlFactory.cs`

**New conversions in `ConvertValue`:**
- `BoxShadow` string parsing (CSS `box-shadow` value → `BoxShadow` struct or `DropShadowEffect`)
- `Classes` from space-separated string (e.g., `class="btn primary"` → `IClasses`)
- `Geometry` from string or JObject (delegates to `GeometryFactory`)
- `IBrush` from JObject (delegates to `BrushFactory` for gradients, falls back to `Brush.Parse()` for strings)
- `IEffect` from JObject (delegates to `EffectFactory`)

**Updated property type mappings:**
- `Clip` → try `GeometryFactory.CreateFromJson(value)` (currently just passes string, which Geometry.Parse handles)
- `OpacityMask` → try `BrushFactory.CreateFromJson(value)` for gradients, or `Brush.Parse()` for color strings

#### `Bridge.cs`

New `AvaloniaNative` methods exposed to JavaScript:

```csharp
// Add styles to a specific control's Styles collection
AvaloniaNative.applyStyles = (nativeControl, rulesJson) => {
    var rules = JsonConvert.DeserializeObject<StyleRule[]>(rulesJson);
    foreach (var rule in rules)
    {
        var style = StyleFactory.CreateStyle(rule.Selector, rule.Properties);
        ((IStyleHost)control).Styles.Add(style);
    }
};

// Add global styles to the root Window's Styles collection
AvaloniaNative.addGlobalStyles = (rulesJson) => {
    var id = Guid.NewGuid().ToString();
    // store rules by id for removal
    GlobalStyles.Add(id, rules);
    return id;
};

AvaloniaNative.removeGlobalStyles = (id) => {
    GlobalStyles.Remove(id);
};

// Fire-and-forget animation
AvaloniaNative.runAnimation = (nativeControl, animJson) => {
    var anim = AnimationFactory.CreateAnimation(animJson);
    _ = anim.RunAsync((Animatable)control);
};
```

---

## TypeScript (avalonia-jsx/src/)

### Build-time

#### `plugins/vite-css-styles.mjs`

Vite plugin (runs in Node). Walks the JS/TS AST and replaces:

| Pattern | Replaced with |
|---------|---------------|
| `` css`button { background: red }` `` | `{ rules: [{ selector: "button", properties: { Background: "red" } }] }` |
| `` keyframes`from { opacity: 0 } to { opacity: 1 }` `` | `{ name: "kf_abc123", keyframes: [{ offset: 0, properties: { Opacity: 0 } }, ...] }` |
| `<style>{`...`}</style>` | `<GlobalStyles rules={[...]} />` |

**Implementation:**
- Uses a lightweight CSS parser (custom or a small library like `csstree`)
- For `css` tagged templates: parses selectors + declarations, maps property names via `css-properties.ts`
- For `keyframes`: extracts `from`/`to` (maps to 0.0/1.0) or percentage offsets
- For `<style>` JSX elements: extracts text content child, parses identically to `css` tag
- Scoping: no scoping (global by design)
- Hot reload: Vite rebuilds on change → bundle replaced on disk → `HotReloadService.cs` detects change → re-runs entire UI

#### `css-properties.ts`

Mapping tables for the build plugin:

```ts
export const CSS_TO_AVALONIA_PROP: Record<string, string> = {
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

  // New: Effects, Clip, OpacityMask
  'filter': 'Effect',           // CSS filter → IEffect
  'clip-path': 'Clip',          // CSS clip-path → Geometry
  'opacity-mask': 'OpacityMask', // Non-standard: custom Avalonia property → IBrush
};
```

```ts
export const CSS_VALUE_CONVERTERS: Record<string, (val: string) => any> = {
  // Colors: "#ff0000", "red", "rgb(255,0,0)", "rgba(255,0,0,0.5)"
  // Thickness: "10" → 10, "10 20" → "10,20", "10 20 10 20" → "10,20,10,20"
  // FontWeight: "bold" → "Bold", "normal" → "Normal"
  // etc.
};
```

### Runtime

#### `styled.ts`

```ts
function styled<TProps>(
  Component: (props: TProps) => JSX.Element,
  styleRules: StyleRule[]
): (props: TProps) => JSX.Element
```

Returns a SolidJS component that:
1. On mount, calls `AvaloniaNative.applyStyles(nativeControl, styleRules)`
2. Merges `className` prop → `class` prop (if provided)
3. Forwards all other props to the wrapped component

#### `global-styles.ts`

```tsx
function GlobalStyles(props: { rules: StyleRule[] }): null
```

A SolidJS component that:
1. On mount, calls `AvaloniaNative.addGlobalStyles(rules)` → stores returned ID in a ref
2. On unmount, calls `AvaloniaNative.removeGlobalStyles(id)`
3. Renders nothing (returns `null`)

Used internally by the build plugin to replace `<style>` elements.

#### `css.ts` / `keyframes.ts`

Exported type definitions only. The tagged template functions are compile-time constructs — at runtime they're replaced by the Vite plugin. Runtime fallbacks exist for `keyframes` to support dynamic animations:

```ts
function keyframes(literals: TemplateStringsArray, ...values: any[]): AnimationDef
// Runtime fallback: concatenates and parses CSS text on the fly
```

---

## Type System Changes

### `components.tsx` changes

- `ControlProps.classes` → keep as-is (used for pseudo-classes)
- Add `ControlProps.class` → typed as `string`, forwarded as `Classes` via bridge
- `RenderTransform` → typed as `string` (CSS transform string, resolved at build time)
- `Effect` → typed as `object` (JSON effect, resolved at build time)
- `Transitions` → typed as `string` (CSS transition string, resolved at build time)
- `BoxShadow` → typed as `string` (CSS box-shadow value)
- `Clip` → typed as `string` (SVG path data, resolved at build time)
- `OpacityMask` → typed as `string | object` (color or gradient JSON)

### `generate-components.mjs` changes

Update `TYPE_MAP` entries:
- `'ITransform': 'string'` (was `'any'`)
- `'IEffect': 'object'` (was `'any'`)
- `'Transitions': 'string'` (was `'JSX.Element | JSX.Element[]'`)
- `'Geometry': 'string'` (was `'any'`) — for Clip
- `'OpacityMask': 'string | object'` (was existing `IBrush` mapping)

Add `class` to `EXTRA_PROPS`:

```js
EXTRA_PROPS['Control'] = EXTRA_PROPS['Control'] || [];
EXTRA_PROPS['Control'].push({ name: 'class', tsType: 'string' });
```

---

## CSS Property → Value Handling

### Colors

All CSS color formats are converted to Avalonia-compatible strings:

| CSS | Avalonia string |
|-----|----------------|
| `#ff0000` | `#ff0000` |
| `red` | `red` |
| `rgb(255, 0, 0)` | `#ff0000` |
| `rgba(255, 0, 0, 0.5)` | `#80ff0000` (ARGB hex) |

### Thickness Shorthand

| CSS | Avalonia string |
|-----|----------------|
| `margin: 10` | `"10"` |
| `margin: 10 20` | `"10,20"` |
| `margin: 10 20 10 20` | `"10,20,10,20"` |

### Border Shorthand

`border: "1 solid red"` is split at build time into:
- `BorderBrush: "red"`
- `BorderThickness: "1"`

### Transform CSS → JSON

CSS `transform: translateY(-20px) rotate(45deg)` is parsed at build time into:
```json
{ "type": "group", "children": [
  { "type": "translate", "y": -20 },
  { "type": "rotate", "angle": 45 }
]}
```

### Transition CSS → Array

`transition: opacity 0.3s ease, transform 0.2s` is parsed at build time into:
```json
[
  { "property": "Opacity", "duration": 300, "easing": "ease" },
  { "property": "RenderTransform", "duration": 200, "easing": "ease" }
]
```

### Filter CSS → Effect JSON

`filter: drop-shadow(2px 2px 5px rgba(0,0,0,0.5))` → parsed at build time:
```json
{ "type": "dropShadow", "offsetX": 2, "offsetY": 2, "blurRadius": 5, "color": "#00000080", "opacity": 1 }
```

`filter: blur(3px)` → parsed at build time:
```json
{ "type": "blur", "radius": 3 }
```

**`filter` CSS syntax support:**
- `drop-shadow(<offsetX> <offsetY> <blurRadius> <color>)`
- `blur(<radius>)`

Multiple filters are not supported by Avalonia (single effect per control). If multiple are specified, only the first is used and a warning is emitted.

### `box-shadow` CSS → BoxShadow JSON or Effect

`box-shadow: 2px 2px 5px rgba(0,0,0,0.5)` → at build time, checks target property:
- If mapping to `BoxShadow`: → `"2 2 5 0 rgba(0,0,0,0.5)"` (BoxShadow.Parse string)
- If mapping to `Effect` (controls without native BoxShadow): → `{ "type": "dropShadow", ... }` JSON

### `clip-path` CSS → Geometry

**SVG path syntax** — parsed at build time, passed as string to C#:
```
clip-path: M 0 0 L 100 0 L 50 100 Z
```
→ At runtime, `GeometryFactory` calls `StreamGeometry.Parse(pathString)`.

**Rectangle / Ellipse syntax** — parsed at build time into JSON:
```
clip-path: rect(0, 0, 100, 100, 5)
```
```json
{ "type": "rectangle", "rect": { "x": 0, "y": 0, "width": 100, "height": 100 }, "radiusX": 5, "radiusY": 5 }
```

CSS syntax for clip-path:
- SVG path: `clip-path: M 10 10 L ... Z` (no `url()`, just raw path data)
- Basic shapes: `clip-path: rect(x y w h r)` → rectangle geometry shorthand
- `clip-path: circle(cx cy r)` → ellipse geometry shorthand (equal radii)

### Gradient CSS → Gradient Brush JSON

`background: linear-gradient(to right, red, blue)` → parsed at build time:

```json
{ "type": "linearGradient", "startPoint": "0,0.5", "endPoint": "1,0.5", "spreadMethod": "pad", "stops": [
  { "offset": 0, "color": "#ff0000" },
  { "offset": 1, "color": "#0000ff" }
]}
```

`background: radial-gradient(circle, white, black)` → parsed at build time:

```json
{ "type": "radialGradient", "center": "0.5,0.5", "gradientOrigin": "0.5,0.5", "radiusX": "0.5", "radiusY": "0.5", "stops": [
  { "offset": 0, "color": "#ffffff" },
  { "offset": 1, "color": "#000000" }
]}
```

`background: conic-gradient(from 0deg, red, yellow, green, blue, red)` → parsed at build time:

```json
{ "type": "conicGradient", "center": "0.5,0.5", "angle": 0, "stops": [
  { "offset": 0, "color": "#ff0000" },
  { "offset": 0.25, "color": "#ffff00" },
  { "offset": 0.5, "color": "#008000" },
  { "offset": 0.75, "color": "#0000ff" },
  { "offset": 1, "color": "#ff0000" }
]}
```

**Gradient CSS syntax support:**
- `linear-gradient(<angle> | <side-or-corner>, <color-stop-list>)`
  - `to left`, `to right`, `to top`, `to bottom`
  - `to top left`, `to bottom right`, etc.
  - Angle in deg: `45deg`
- `radial-gradient([<shape> || <size>] [at <position>]?, <color-stop-list>)`
  - `circle` (equal radii), `ellipse` (default)
  - `closest-side`, `farthest-side`, `closest-corner`, `farthest-corner`
- `conic-gradient([from <angle>]? [at <position>]?, <color-stop-list>)`
- Color stops: `<color> <offset?>?` where offset is a percentage

**Gradient can also be used for:**
- `background` → `Background`
- `opacity-mask` → `OpacityMask`
- `foreground` / `color` → `Foreground`
- `border-brush` → `BorderBrush`

### OpacityMask CSS

`opacity-mask: linear-gradient(to right, black, transparent)` → parsed identically to gradient above, applied to `OpacityMask` property.

---

## Usage Examples

```tsx
// === Global styles with full effect/geometry/gradient support ===
function App() {
  return (
    <Window Title="Demo" Width={800} Height={600}>
      <style>{`
        .card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12;
          padding: 24;
          box-shadow: 0 8 24 rgba(0,0,0,0.2);
          filter: drop-shadow(0 4 8 rgba(0,0,0,0.3));
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: scale(1.03);
          box-shadow: 0 12 32 rgba(0,0,0,0.3);
        }
        .avatar {
          width: 80;
          height: 80;
          border-radius: 40;
          clip-path: M 0 0 L 80 0 L 80 80 L 0 80 Z;
          opacity-mask: linear-gradient(to bottom, black, transparent);
        }
        .hero-text {
          font-size: 28;
          font-weight: bold;
          color: white;
          background: linear-gradient(to right, #f093fb, #f5576c);
        }
      `}</style>

      <Border class="card">
        <StackPanel spacing={12}>
          <Border class="avatar" background="#eee" />
          <TextBlock class="hero-text">Welcome!</TextBlock>
        </StackPanel>
      </Border>
    </Window>
  );
}

// === Styled components with gradients ===
const GlassCard = styled(Border, css`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16;
  backdrop-filter: blur(10);
  border-brush: rgba(255, 255, 255, 0.2);
  border-thickness: 1;
  box-shadow: 0 8 32 rgba(0,0,0,0.1);
`);
```

---

## Implementation Order

| Step | Files | Area |
|------|-------|------|
| 1 | `StyleFactory.cs` | C# |
| 2 | `AnimationFactory.cs`, `EffectFactory.cs`, `TransformFactory.cs` | C# |
| 3 | `GeometryFactory.cs`, `BrushFactory.cs` | C# |
| 4 | Modify `ControlFactory.cs` (BoxShadow, Classes, Geometry, IBrush/IEffect from JSON), `Bridge.cs` (new JS methods) | C# |
| 5 | `css-properties.ts`, `transform-parser.ts`, `transition-parser.ts` | TS (build) |
| 6 | `styled.ts`, `global-styles.ts`, `css.ts`, `keyframes.ts` | TS (runtime) |
| 7 | `vite-css-styles.mjs` | Vite plugin |
| 8 | Update `renderer.ts`, `generate-components.mjs`, `index.ts`, regenerate `components.tsx` | Integration |
| 9 | Test with example app: gradients, clip-path, effects, opacity-mask, global styles, styled component, transitions, animation, hot reload | QA |

---

## Hot Reload Flow

CSS changes are handled by the existing `HotReloadService.cs`:

1. Vite rebuilds the bundle on file change
2. `HotReloadService` detects the new bundle on disk
3. Re-runs `LoadUi()` — re-initializes bridge, re-executes bundle, replaces window content
4. CSS is re-parsed at build time in the new bundle, styles are re-applied

No special HMR wiring needed — full re-render is the simplest and most reliable approach for a desktop UI framework.
