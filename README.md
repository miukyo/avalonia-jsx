<div align="center">

![AvaloniaJSX](docs/.img/Banner.png)

</div>

# Avalonia JSX

Avalonia JSX is an experimental framework bridging the powerful [Avalonia UI](https://avaloniaui.net/) desktop framework with a modern JavaScript/TypeScript ecosystem. 

It enables developers to build native, cross-platform desktop applications using familiar web technologies like React/Solid.js patterns, CSS-like styling, and hot-reload.

## Core Components

The project consists of two primary parts that are designed to be used together:

1. **`avalonia-jsx`**: A frontend library that provides the JSX/TSX environment, component definitions, and build tooling (Vite plugins) to compile web-like code into a format the Avalonia backend understands.
2. **`Avalonia.JSBridge`**: A .NET backend library that hosts a JavaScript runtime (Jint), parses the output from `avalonia-jsx`, and dynamically constructs native Avalonia UI controls, styles, and animations.

> **Important**: `Avalonia.JSBridge` is specifically designed to be used in tandem with `avalonia-jsx`. The bridge expects the specific JSON structures and lifecycle events that `avalonia-jsx` generates.

## Documentation

- [Getting Started](docs/GettingStarted.md)
- [Architecture](docs/Architecture.md)
- [Supported CSS](docs/SupportedCSS.md)

## Example

Writing UI in Avalonia JSX looks like this:

```tsx
import { StackPanel, TextBlock, Window, Button } from 'avalonia-jsx';
import { createSignal, Show } from 'solid-js';

export default function App() {
  const [isClicked, setIsClicked] = createSignal(false);
  return (
    <Window Title="AvaloniaJS Basic" Width={800} Height={600}>
      <style>{`
        .header { font-weight: bold; font-size: 40; }
        .btn { background: black; color: white; border-radius: 20; padding: 20 10; transition: transform 0.1s ease; }
        .btn:active { transform: scale(0.9); }
      `}</style>
      <StackPanel>
        <TextBlock class="header">AvaloniaJS</TextBlock>
        <StackPanel Orientation='Horizontal' Spacing={20}>
          <Button onClick={() => setIsClicked(true)} class='btn' Content="Click me!" />
          <Show when={isClicked()}>
            <TextBlock VerticalAlignment='Center'>Button clicked!</TextBlock>
          </Show>
        </StackPanel>
      </StackPanel>
    </Window>
  );
}
```
