using System.IO;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;
using Avalonia.JSBridge;

namespace Basic;

public partial class App : Application
{
    private HotReloadService? _hotReload;

    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override async void OnFrameworkInitializationCompleted()
    {
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            desktop.ShutdownMode = ShutdownMode.OnExplicitShutdown;

            var bridge = new Bridge();
            var bundlePath = "avares://Basic/dist/bridge.bundle.js";
            var localBundlePath = Path.GetFullPath(Path.Combine(System.Environment.CurrentDirectory, "dist", "bridge.bundle.js"));
            if (File.Exists(localBundlePath))
            {
                bundlePath = localBundlePath;
            }
            Window? currentWindow = null;

            async System.Threading.Tasks.Task LoadUi()
            {
                try
                {
                    bridge.ClearGlobalStyles();
                    await bridge.InitializeAsync();
                    await bridge.ExecuteBundleAsync(bundlePath);
                    var root = await bridge.InvokeRootComponentAsync(currentWindow);

                    if (root is Window window)
                    {
                        if (currentWindow == null)
                        {
                            currentWindow = window;
                            desktop.MainWindow = window;
                            window.Closed += (s, e) =>
                            {
                                if (currentWindow == window) desktop.Shutdown();
                            };
                        }
                        // Apply CSS global styles now that the window and its controls exist
                        bridge.ApplyGlobalStylesToWindow(currentWindow);
                        window.Show();
                    }
                    else if (root is Control control)
                    {
                        if (currentWindow == null)
                        {
                            var hostWindow = new Window { Content = control, Title = "Avalonia JS App", Width = 800, Height = 600 };
                            currentWindow = hostWindow;
                            desktop.MainWindow = hostWindow;
                            hostWindow.Closed += (s, e) =>
                            {
                                if (currentWindow == hostWindow) desktop.Shutdown();
                            };
                            bridge.ApplyGlobalStylesToWindow(hostWindow);
                            hostWindow.Show();
                        }
                        else
                        {
                            // Update content in-place
                            currentWindow.Content = control;
                            bridge.ApplyGlobalStylesToWindow(currentWindow);
                        }
                    }
                }
                catch (System.Exception ex)
                {
                    System.Console.WriteLine($"Error loading UI: {ex}");
                }
            }

            await LoadUi();


            if (File.Exists(localBundlePath))
            {
                _hotReload = new HotReloadService(localBundlePath, async () =>
                {
                    System.Console.WriteLine("Reloading UI...");
                    await LoadUi();
                });
            }
        }

        base.OnFrameworkInitializationCompleted();
    }
}