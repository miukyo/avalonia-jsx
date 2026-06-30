# Avalonia-JS Bridge

A cross-platform library that bridges Avalonia UI controls to JavaScript, allowing developers to write Avalonia interfaces using SolidJS (Universal) JSX.

## Features
- **SolidJS (JSX) Integration**: Write your Avalonia layouts using familiar web frontend paradigms.
- **Hot-Reloading**: Changes to your JS frontend automatically reflect in the running Avalonia window.
- **Reflection-Based Factory**: Exposes all Avalonia controls automatically.
- **Event Mapping**: Wire JavaScript functions directly into Avalonia control events.

## Architecture
The bridge works by embedding the [Jint](https://github.com/sebastienros/jint) JavaScript engine within your Avalonia application. 
The JavaScript frontend uses a custom SolidJS universal renderer to construct a JSON representation of the UI tree, which the bridge then parses and instantiates using Avalonia's reflection APIs.

### Setup Instructions

1. **Frontend Setup**
Navigate to `js-frontend` and run:
```bash
npm install
npm run build
```
During development, run `npm run build -- --watch` (or configure vite) to automatically rebuild the bundle when files change.

2. **Avalonia App Integration**
In your `App.axaml.cs` (or your preferred initialization point):
```csharp
public override async void OnFrameworkInitializationCompleted()
{
    if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
    {
        var mainWindow = new MainWindow();
        desktop.MainWindow = mainWindow;

        var bridge = new Avalonia.JSBridge.Bridge();
        await bridge.InitializeAsync();
        
        var bundlePath = Path.GetFullPath(Path.Combine(System.Environment.CurrentDirectory, "js-frontend", "dist", "bridge.bundle.js"));

        async Task LoadUi()
        {
            await bridge.ExecuteBundleAsync(bundlePath);
            var root = await bridge.InvokeRootComponentAsync();
            if (root != null) mainWindow.Content = root;
        }
        
        await LoadUi();

        // Hot-reload
        var hotReload = new Avalonia.JSBridge.HotReloadService(bundlePath, async () => await LoadUi());
    }
}
```

## Creating UIs
In `js-frontend/src/App.jsx`, construct controls using their Avalonia type names:

```jsx
export default function App() {
  return (
    <StackPanel props={{ Orientation: 'Vertical', Spacing: 10 }}>
      <TextBlock props={{ Text: 'Hello from SolidJS!', FontSize: 24 }} />
      <Button props={{ Content: 'Click Me!', onClick: () => console.log('Clicked!') }} />
    </StackPanel>
  );
}
```

**Note**: All standard Avalonia properties must be passed within the `props` object, and events follow the `onEventName` convention.
