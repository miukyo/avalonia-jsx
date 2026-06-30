using System;
using System.IO;
using Avalonia.Threading;

namespace Avalonia.JSBridge;

public class HotReloadService : IDisposable
{
    private readonly FileSystemWatcher _watcher;
    private readonly Action _onReload;
    private DateTime _lastReload = DateTime.MinValue;
 
    public HotReloadService(string filePath, Action onReload)
    {
        _onReload = onReload;
        var directory = Path.GetDirectoryName(filePath) ?? ".";
        var fileName = Path.GetFileName(filePath);
        
        _watcher = new FileSystemWatcher(directory, fileName)
        {
            NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.CreationTime | NotifyFilters.Size
        };
        
        _watcher.Changed += Watcher_Changed;
        _watcher.Created += Watcher_Changed;
        _watcher.EnableRaisingEvents = true;
    }
 
    private void Watcher_Changed(object sender, FileSystemEventArgs e)
    {
        // Debounce using a time-based threshold
        Dispatcher.UIThread.Post(async () =>
        {
            await System.Threading.Tasks.Task.Delay(100);
            if ((DateTime.UtcNow - _lastReload).TotalMilliseconds > 500)
            {
                _lastReload = DateTime.UtcNow;
                _onReload?.Invoke();
            }
        });
    }

    public void Dispose()
    {
        _watcher?.Dispose();
    }
}
