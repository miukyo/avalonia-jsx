# Supported CSS in Avalonia JS

Avalonia JS utilizes a custom Vite plugin (`vite-css-styles`) to parse and compile a subset of standard CSS directly into native Avalonia UI properties at build time. This allows you to style your native desktop applications with familiar web syntax.

## How CSS is Processed

Styles can be defined using embedded `<style>` tags directly in your JSX/TSX:

```tsx
<style>{`
  .my-button { background: red; }
  .my-button:hover { background: blue; }
`}</style>
```

Behind the scenes, the Vite plugin parses the CSS, resolves the selectors, and translates the CSS properties into JSON structures that the Avalonia backend understands natively (e.g. converting `margin: 10 20` into a `Thickness(10, 20)` object, or mapping pseudo-classes to Avalonia pseudo-selectors like `:pointerover`).

---

## Selectors & Pseudo-classes

You can target elements via class names (e.g. `.card`), IDs (e.g. `#main`), element names (e.g. `Button`), or pseudo-classes.

Supported interactive pseudo-classes:
- `:hover` -> Maps to `:pointerover`
- `:active` -> Maps to `:pressed`
- `:focus` -> Maps to `:focus`
- `:disabled` -> Maps to `:disabled`

---

## Supported Properties

The following standard CSS properties map directly to Avalonia properties. Unknown properties are automatically converted to `PascalCase` and passed through to the backend natively (e.g., `corner-radius` -> `CornerRadius`).

### Layout & Sizing
- `width` / `height` / `min-width` / `min-height` / `max-width` / `max-height` (Values: numbers, e.g. `100` not `100px`)
- `margin` / `padding` (Values: single `10`, or multi `10 20 10 20`)
- `spacing` -> Maps to `Spacing` (used by `StackPanel`)
- `orientation` -> Maps to `Orientation` (used by `StackPanel`)

### Appearance & Colors
- `background` or `background-color` -> Maps to `Background`
- `color` -> Maps to `Foreground`
- `opacity` -> Maps to `Opacity`
- `visibility` -> Maps to `IsVisible` (`true`/`false`)
- `opacity-mask` -> Maps to `OpacityMask`

> **Note on Colors**: The parser automatically converts `rgb(r, g, b)` and `rgba(r, g, b, a)` into Avalonia-compatible ARGB Hex strings (`#AARRGGBB`). Standard CSS color names (e.g., `red`, `black`) and hex strings are supported natively.

### Borders
- `border` -> Shorthand parsing (e.g., `2 black`) mapped to `BorderThickness` and `BorderBrush`
- `border-brush` -> Maps to `BorderBrush`
- `border-thickness` -> Maps to `BorderThickness`
- `border-radius` -> Maps to `CornerRadius`

### Typography
- `font-size` -> Maps to `FontSize`
- `font-weight` -> Maps to `FontWeight`. Supported textual values: `thin`, `extralight`, `light`, `semilight`, `normal`, `regular`, `medium`, `semibold`, `bold`, `extrabold`, `black`.
- `font-family` -> Maps to `FontFamily`
- `text-align` -> Maps to `TextAlignment`

### Effects & Shadows
- `filter` -> Maps to `Effect`
  - `drop-shadow(offsetX offsetY blurRadius color)` -> Translated to `DropShadowEffect`.
  - `blur(radius)` -> Translated to `BlurEffect`.
- `box-shadow` -> Maps natively to `BoxShadows`.
- `clip-path` -> Maps to `Clip`. Currently supports SVG path strings (e.g., `M 0,0 L 100,100`).
- `overflow` -> Maps to `ClipToBounds`

### Stacking
- `z-index` -> Maps to `ZIndex`

---

## Transforms

The `transform` property is fully parsed into Avalonia `RenderTransform` groups.

Supported functions:
- `translate(x, y)` / `translateX(x)` / `translateY(y)` / `translate3d(x, y, ...)`
- `rotate(angle)` / `rotateZ(angle)` / `rotateX(angle)` / `rotateY(angle)`
- `scale(x, y)` / `scaleX(x)` / `scaleY(y)`
- `skew(x, y)` / `skewX(x)` / `skewY(y)`

```css
.animated-box {
  transform: translateX(50) rotate(45) scale(1.5);
}
```

---

## Gradients

You can define complex gradients using the `background` or `opacity-mask` properties.

### Linear Gradients
Supports angles (`45deg`) or directional keywords (`to right`, `to bottom right`). Stops can include explicit percentages/offsets.
```css
background: linear-gradient(135deg, red 0%, blue 50%, green 100%);
background: linear-gradient(to right, #10b981, #3b82f6);
```

### Radial Gradients
```css
background: radial-gradient(red, blue);
```

### Conic Gradients
Supports starting angle (`from 45deg`) and origin position (`at top left`, `at 0.5 0.5`).
```css
background: conic-gradient(from 45deg at center, red, yellow, green);
```

---

## Transitions & Animations

### Transitions
CSS transitions map natively to Avalonia `Transitions`. The syntax mimics standard CSS:
`transition: [property] [duration] [delay] [easing]`

```css
.btn {
  /* Duration in 's' or 'ms'. Properties are auto-converted (e.g. transform -> RenderTransform) */
  transition: transform 0.2s ease, background 500ms 0.1s ease-in-out;
}
```

#### Supported Easing Functions
You can use standard CSS easing names or custom bezier curves:
- `linear`
- `ease`, `ease-in`, `ease-out`, `ease-in-out`
- **Advanced mathematical easings**: `sine`, `quad`, `cubic`, `quart`, `quint`, `expo`, `circ`, `back`, `elastic`, `bounce`, `spring` (many of these support `-in`, `-out`, and `-inout` variants like `sineinout`).
- **Custom**: `cubic-bezier(x1, y1, x2, y2)`

### Keyframe Animations
Using tagged template literals (`keyframes`), you can define Avalonia keyframe animations.
```tsx
import { keyframes } from 'avalonia-jsx';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20); }
  to { opacity: 1; transform: translateY(0); }
`;
// Pass the returned AnimationDef to the 'Animation' property of a control.
```

