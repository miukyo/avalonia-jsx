# Progress

## Runtime Bugs Fixed (in order)

| # | Bug | Root Cause | Fix |
|---|-----|------------|-----|
| 1 | `Syntax error "!"` on build | `#!/usr/bin/env node` shebang in `.mjs` causes esbuild parse error | Removed shebang line |
| 2 | `GlobalStyles is not defined` | `<style>` → `<GlobalStyles>` transform but no import | Vite plugin auto-injects `GlobalStyles` into existing `import { ... } from 'avalonia-jsx'` |
| 3 | Gradient stops both at offset 0 | No auto-distribution when stops lack explicit offsets | `parseGradientStops` auto-distributes evenly (0→1) when no offsets given |
| 4 | `transform` → `Transform` in transitions | `parseTransitions` used kebab-to-Pascal only, didn't map through `CSS_TO_AVALONIA` | Transition properties now map through `CSS_TO_AVALONIA` first (e.g., `transform` → `RenderTransform`) |
| 5 | `styled()` usage wrong | Passed `{ rules: [...] }` but `styled()` expects `StyleRule[]` directly | Fixed `App.tsx` to pass array directly |
| 6 | `InvalidCastException: TextBlock → Inlines` | TextBlock's `[Content]` property is `Inlines` (expects `Inline`), but text-node children are `TextBlock` controls | `ApplyChildren`, `InsertChild`, `RemoveChild` all detect `TextBlock + Inlines` and redirect to `Text` property |
| 7 | `InvalidCastException: List<object?> → Transitions` | Setter received raw `List<object?>` for `Transitions` property instead of `Transitions` object | `CreateStyle` has explicit name check for `"Transitions"` and routes through `CreateTransitionsFromList` |

## Remaining Concerns

- `removeGlobalStyles` marks for removal but doesn't actually clean up from window.Styles
- `addGlobalStyles` may fire before window is initialized if JS runs synchronously during app startup
- `window.__avaloniaGlobalStyles` array may not persist across hot reloads
- Animation via `animation:` CSS property not yet supported through property system
- Vite plugin's regex-based transformation is fragile for complex template literals with interpolation
