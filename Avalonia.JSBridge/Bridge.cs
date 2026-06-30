using System;
using System.IO;
using System.Threading.Tasks;
using Avalonia.Controls;
using Jint;
using Jint.Native;

namespace Avalonia.JSBridge;

public class Bridge
{
    private Engine? _engine;
 
    public Bridge()
    {
    }
 
    public Task InitializeAsync()
    {
        _engine = new Engine(engineOptions =>
        {
            engineOptions.AllowClr(typeof(Control).Assembly);
        });

        JintStdLib.Register(_engine);

        _engine.SetValue("console", new
        {
            log = new Action<object>(msg => Console.WriteLine(msg))
        });

        _engine.SetValue("AvaloniaNative", new
        {
            updateProperty = new Action<Jint.Native.JsValue, string, Jint.Native.JsValue>((controlValue, propName, value) =>
            {
                var control = controlValue.ToObject();
                Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                {
                    ControlFactory.ApplyProperty(control, propName, value, _engine);
                });
            }),
            insertChild = new Action<Jint.Native.JsValue, Jint.Native.JsValue, Jint.Native.JsValue>((parentValue, childNode, anchorValue) =>
            {
                var parent = parentValue.ToObject();
                var anchor = anchorValue.IsUndefined() || anchorValue.IsNull() ? null : anchorValue.ToObject();
                Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                {
                    ControlFactory.InsertChild(parent, childNode, anchor, _engine);
                });
            }),
            removeChild = new Action<Jint.Native.JsValue, Jint.Native.JsValue>((parentValue, childValue) =>
            {
                var parent = parentValue.ToObject();
                var child = childValue.ToObject();
                Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                {
                    ControlFactory.RemoveChild(parent, child);
                });
            })
        });

        return Task.CompletedTask;
    }

    public Task ExecuteBundleAsync(string path)
    {
        if (_engine == null) throw new InvalidOperationException("Bridge engine has not been initialized. Call InitializeAsync first.");
        
        string code;
        if (path.StartsWith("avares://"))
        {
            using (var stream = Avalonia.Platform.AssetLoader.Open(new Uri(path)))
            using (var sr = new StreamReader(stream))
            {
                code = sr.ReadToEnd();
            }
        }
        else
        {
            using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (var sr = new StreamReader(fs))
            {
                code = sr.ReadToEnd();
            }
        }
        
        _engine.Execute(code);
        return Task.CompletedTask;
    }
 
    public Task<Control?> InvokeRootComponentAsync(Window? existingWindow = null)
    {
        if (_engine == null) throw new InvalidOperationException("Bridge engine has not been initialized. Call InitializeAsync first.");
        var bridgeObj = _engine.GetValue("AvaloniaBridge");
        if (bridgeObj.IsUndefined() || !bridgeObj.IsObject())
        {
            Console.WriteLine("Warning: 'AvaloniaBridge' global not found.");
            return Task.FromResult<Control?>(null);
        }
 
        var renderFunction = bridgeObj.AsObject().Get("render");
        if (renderFunction.IsUndefined() || !renderFunction.IsObject())
        {
            Console.WriteLine("Warning: No 'render' function found on AvaloniaBridge.");
            return Task.FromResult<Control?>(null);
        }
 
        var jsResult = _engine.Invoke(renderFunction);
        _engine.Advanced.ProcessTasks();
        ControlFactory.CancelActiveDownloads();
        var control = ControlFactory.CreateFromJsValue(jsResult, _engine, existingWindow);
        return Task.FromResult(control as Control);
    }
}
