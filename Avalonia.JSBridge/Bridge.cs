using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Styling;
using Jint;
using Jint.Native;

namespace Avalonia.JSBridge;

public class Bridge
{
    private Engine? _engine;
    private readonly ConcurrentDictionary<string, List<Dictionary<string, object?>>> _globalStyles = new();
    private int _styleIdCounter;
  
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
            }),

            // Apply styles to a specific control's Styles collection
            applyStyles = new Action<JsValue, JsValue>((controlValue, rulesValue) =>
            {
                var control = controlValue.ToObject();
                if (control == null || !rulesValue.IsArray()) return;

                var rules = rulesValue.AsArray();
                Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                {
                    if (control is StyledElement styled)
                    {
                        for (uint i = 0; i < rules.Length; i++)
                        {
                            var rule = rules[i];
                            if (!rule.IsObject()) continue;
                            var ruleDict = ControlFactory.JsObjectToDict(rule.AsObject());
                            var selector = ruleDict.TryGetValue("selector", out var sel) ? sel?.ToString() : null;
                            var properties = ruleDict.TryGetValue("properties", out var props) && props is Dictionary<string, object?> propDict
                                ? propDict : new Dictionary<string, object?>();
                            if (!string.IsNullOrEmpty(selector))
                            {
                                var style = StyleFactory.CreateStyle(selector, properties, _engine);
                                styled.Styles.Add(style);
                            }
                        }
                    }
                });
            }),

            // Add global styles (returns an ID string for later removal)
            addGlobalStyles = new Func<JsValue, string>(rulesValue =>
            {
                if (!rulesValue.IsArray()) return "";
                var id = System.Threading.Interlocked.Increment(ref _styleIdCounter).ToString();
                var rules = rulesValue.AsArray();

                var ruleList = new List<Dictionary<string, object?>>();
                for (uint i = 0; i < rules.Length; i++)
                {
                    if (rules[i].IsObject())
                        ruleList.Add(ControlFactory.JsObjectToDict(rules[i].AsObject()));
                }
                // Store rules — they will be applied synchronously once the window is available
                _globalStyles[id] = ruleList;

                return id;
            }),

            // Remove global styles by ID
            removeGlobalStyles = new Action<string>(id =>
            {
                if (_globalStyles.TryRemove(id, out _))
                {
                    // Note: Full removal of styles requires rebuilding the window.
                    // For simplicity, we re-initialize which HotReloadService handles.
                    Console.WriteLine($"Styles {id} marked for removal. Full reload required.");
                }
            }),

            // Fire-and-forget animation on a control
            runAnimation = new Action<JsValue, JsValue>((controlValue, animValue) =>
            {
                var control = controlValue.ToObject();
                if (control == null || !animValue.IsObject()) return;

                var animDict = ControlFactory.JsObjectToDict(animValue.AsObject());
                if (control is Animatable animatable)
                {
                    _ = AnimationFactory.RunAnimation(animatable, animDict);
                }
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

    /// <summary>
    /// Applies all global styles collected during JS execution to the given window.
    /// Call this synchronously after InvokeRootComponentAsync so the window is guaranteed
    /// to be available before styles are attached.
    /// </summary>
    public void ApplyGlobalStylesToWindow(Window window)
    {
        if (_engine == null) return;
        
        // Clear any previously applied JS styles (for hot-reload)
        window.Styles.Clear();
        
        foreach (var (id, ruleList) in _globalStyles)
        {
            foreach (var rule in ruleList)
            {
                var selector = rule.TryGetValue("selector", out var s) ? s?.ToString() : null;
                var properties = rule.TryGetValue("properties", out var p) && p is Dictionary<string, object?> pd ? pd : new();
                
                if (!string.IsNullOrEmpty(selector))
                {
                    try
                    {
                        var style = StyleFactory.CreateStyle(selector, properties, _engine);
                        window.Styles.Add(style);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Bridge] Failed to create style for selector '{selector}': {ex.Message}");
                    }
                }
            }
        }
    }
    /// <summary>
    /// Clears all stored global styles. Call before re-executing the bundle on hot-reload
    /// so styles don't accumulate across reloads.
    /// </summary>
    public void ClearGlobalStyles() => _globalStyles.Clear();
 
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
