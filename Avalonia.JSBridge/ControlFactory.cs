using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Avalonia.Animation;
using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Styling;
using Jint;
using Jint.Native;
using Jint.Native.Object;

namespace Avalonia.JSBridge;

public static class ControlFactory
{
    private static readonly Dictionary<string, Type> _controlTypes = new(StringComparer.OrdinalIgnoreCase);

    private static readonly System.Runtime.CompilerServices.ConditionalWeakTable<ScrollViewer, SmoothScrollHelper> _smoothScrollers = new();
    private static readonly System.Net.Http.HttpClient _imageHttpClient = new();
    private static readonly System.Threading.SemaphoreSlim _imageSemaphore = new(16, 16); // Limit to 8 concurrent downloads
    private static System.Threading.CancellationTokenSource _downloadCts = new();
 
    public static void CancelActiveDownloads()
    {
        try
        {
            _downloadCts.Cancel();
            _downloadCts.Dispose();
        }
        catch {}
        _downloadCts = new System.Threading.CancellationTokenSource();
    }
 
    static ControlFactory()
    {
        var assembly = typeof(Control).Assembly;
        foreach (var type in assembly.GetTypes().Where(t => t.IsSubclassOf(typeof(Control)) && !t.IsAbstract))
        {
            _controlTypes[type.Name] = type;
        }
    }

    public static object? CreateFromJsValue(JsValue value, Engine engine, Window? existingWindow = null)
    {
        if (value.IsString()) return value.AsString();
        if (value.IsNumber()) return value.AsNumber();
        if (value.IsBoolean()) return value.AsBoolean();

        if (value.IsObject())
        {
            var obj = value.AsObject();
            if (obj.HasProperty("type"))
            {
                var typeName = obj.Get("type").AsString();
                if (typeName.Equals("panel", StringComparison.OrdinalIgnoreCase))
                {
                    var children = obj.Get("children");
                    if (children.IsArray())
                    {
                        var array = children.AsArray();
                        if (array.Length == 1)
                        {
                            var firstChild = array[0];
                            if (firstChild.IsObject())
                            {
                                var firstChildObj = firstChild.AsObject();
                                if (firstChildObj.HasProperty("type") && firstChildObj.Get("type").AsString().Equals("window", StringComparison.OrdinalIgnoreCase))
                                {
                                    return CreateFromJsValue(firstChild, engine, existingWindow);
                                }
                            }
                        }
                    }
                }

                if (_controlTypes.TryGetValue(typeName, out var type))
                {
                    object? instance;
                    if (type == typeof(Window) && existingWindow != null)
                    {
                        instance = existingWindow;
                    }
                    else
                    {
                        instance = Activator.CreateInstance(type);
                    }
                    obj.Set("NativeControl", JsValue.FromObject(engine, instance));

                    if (instance is ScrollViewer scrollViewer)
                    {
                        var helper = _smoothScrollers.GetValue(scrollViewer, sv => new SmoothScrollHelper(sv));
                        helper.Enable(vertical: true, horizontal: true);
                    }

                    if (obj.HasProperty("props") && obj.Get("props").IsObject())
                    {
                        var props = obj.Get("props").AsObject();
                        foreach (var prop in props.GetOwnProperties())
                        {
                            var propName = prop.Key.AsString();
                            var propValue = props.Get(propName);
                            ApplyProperty(instance, propName, propValue, engine);
                        }
                    }

                    if (obj.HasProperty("children"))
                    {
                        var children = obj.Get("children");
                        if (children.IsArray())
                        {
                            var array = children.AsArray();
                            ApplyChildren(instance, array, engine);
                        }
                    }

                    return instance;
                }
            }
        }
        return null;
    }

    private static object? ConvertValue(JsValue propValue, Type targetType, Engine engine)
    {
        if (targetType == typeof(Thickness))
        {
            if (propValue.IsNumber()) return new Thickness(propValue.AsNumber());
            if (propValue.IsString()) return Thickness.Parse(propValue.AsString());
        }
        if (targetType == typeof(CornerRadius))
        {
            if (propValue.IsNumber()) return new CornerRadius(propValue.AsNumber());
            if (propValue.IsString()) return CornerRadius.Parse(propValue.AsString());
        }
        if (targetType == typeof(Avalonia.Media.IBrush))
        {
            if (propValue.IsString()) return Avalonia.Media.Brush.Parse(propValue.AsString());
        }
        if (targetType == typeof(Avalonia.Media.Color))
        {
            if (propValue.IsString()) return Avalonia.Media.Color.Parse(propValue.AsString());
        }
        if (targetType == typeof(IReadOnlyList<WindowTransparencyLevel>) || targetType == typeof(IEnumerable<WindowTransparencyLevel>) || targetType == typeof(IList<WindowTransparencyLevel>))
        {
            if (propValue.IsString())
            {
                var parts = propValue.AsString().Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                var list = new List<WindowTransparencyLevel>();
                foreach (var part in parts)
                {
                    if (Enum.TryParse<WindowTransparencyLevel>(part, true, out var level))
                    {
                        list.Add(level);
                    }
                }
                return list;
            }
            else if (propValue.IsArray())
            {
                var arr = propValue.AsArray();
                var list = new List<WindowTransparencyLevel>();
                for (int i = 0; i < arr.Length; i++)
                {
                    var val = arr[i];
                    if (val.IsString() && Enum.TryParse<WindowTransparencyLevel>(val.AsString(), true, out var level))
                    {
                        list.Add(level);
                    }
                }
                return list;
            }
        }
        
        if (targetType.IsEnum)
        {
            if (propValue.IsString())
            {
                return Enum.Parse(targetType, propValue.AsString(), true);
            }
            if (propValue.IsNumber())
            {
                return Enum.ToObject(targetType, (int)propValue.AsNumber());
            }
        }
        
        if (targetType == typeof(string)) return propValue.IsString() ? propValue.AsString() : propValue.ToObject()?.ToString();
        if (targetType == typeof(double)) return propValue.IsNumber() ? propValue.AsNumber() : 0.0;
        if (targetType == typeof(float)) return (float)(propValue.IsNumber() ? propValue.AsNumber() : 0.0);
        if (targetType == typeof(int)) return (int)(propValue.IsNumber() ? propValue.AsNumber() : 0);
        if (targetType == typeof(bool)) return propValue.IsBoolean() && propValue.AsBoolean();
        
        // Handle JSON-to-CLR object conversions for complex types
        if (propValue.IsObject() && !propValue.IsArray())
        {
            var jsObj = propValue.AsObject();
            var dict = JsObjectToDict(jsObj);

            if (targetType == typeof(ITransform) || typeof(Transform).IsAssignableFrom(targetType))
                return TransformFactory.CreateFromJson(dict);
            if (targetType == typeof(IEffect) || typeof(Effect).IsAssignableFrom(targetType))
                return EffectFactory.CreateFromJson(dict);
            if (typeof(Brush).IsAssignableFrom(targetType) || targetType == typeof(IBrush))
                return BrushFactory.CreateFromJson(dict) ?? Brush.Parse("#00000000");
            if (typeof(Geometry).IsAssignableFrom(targetType) || targetType == typeof(Geometry))
                return GeometryFactory.CreateFromJson(dict);
        }

        if (propValue.IsArray())
        {
            var arr = propValue.AsArray();
            if (targetType == typeof(Transitions) || targetType == typeof(IList<ITransition>))
                return CreateTransitions(arr);
        }
        
        return propValue.ToObject();
    }

    public static void ApplyProperty(object? instance, string propName, JsValue propValue, Engine engine)
    {
        if (instance == null) return;

        // Support Attached Properties (e.g. WindowDecorationProperties.ElementRole or Grid.Row)
        if (propName.Contains('.') && instance is AvaloniaObject avaloniaObject)
        {
            var parts = propName.Split('.');
            if (parts.Length == 2)
            {
                var ownerTypeName = parts[0];
                var attachedPropName = parts[1];
                
                var ownerType = typeof(Control).Assembly.GetTypes()
                    .FirstOrDefault(t => t.Name.Equals(ownerTypeName, StringComparison.OrdinalIgnoreCase));
                
                if (ownerType != null)
                {
                    var fieldInfo = ownerType.GetField(attachedPropName + "Property", BindingFlags.Static | BindingFlags.Public);
                    if (fieldInfo != null)
                    {
                        var avaloniaProperty = fieldInfo.GetValue(null) as AvaloniaProperty;
                        if (avaloniaProperty != null)
                        {
                            try
                            {
                                var clrValue = ConvertValue(propValue, avaloniaProperty.PropertyType, engine);
                                avaloniaObject.SetValue(avaloniaProperty, clrValue);
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error applying attached property {propName}: {ex.Message}");
                            }
                            return;
                        }
                    }
                }
            }
        }

        var type = instance.GetType();

        if (propName.StartsWith("on", StringComparison.OrdinalIgnoreCase))
        {
            var eventName = propName.Substring(2);
            var eventInfo = type.GetEvent(eventName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (eventInfo != null)
            {
                if (propValue.IsObject())
                {
                    EventBridge.AttachEvent(instance, eventInfo, propValue.AsObject(), engine);
                }
                else
                {
                    Console.WriteLine($"WARNING: Event handler for {eventName} is not an object. Type: {propValue.Type}");
                }
                return;
            }
            else
            {
                Console.WriteLine($"WARNING: Event {eventName} not found on {type.Name}");
            }
        }

        var propInfo = type.GetProperty(propName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
        // Handle Classes specially: it's a get-only collection, not a settable string property
        if (propInfo != null && propName.Equals("Classes", StringComparison.OrdinalIgnoreCase) && instance is Avalonia.Controls.Control ctrl)
        {
            if (propValue.IsString())
            {
                var classStr = propValue.AsString();
                foreach (var cls in classStr.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                    ctrl.Classes.Add(cls);
            }
            return;
        }
        if (propInfo != null && propInfo.CanWrite)
        {
            try
            {
                if (propInfo.PropertyType == typeof(Thickness))
                {
                    if (propValue.IsNumber()) propInfo.SetValue(instance, new Thickness(propValue.AsNumber()));
                    else if (propValue.IsString()) propInfo.SetValue(instance, Thickness.Parse(propValue.AsString()));
                }
                else if (propInfo.PropertyType == typeof(CornerRadius))
                {
                    if (propValue.IsNumber()) propInfo.SetValue(instance, new CornerRadius(propValue.AsNumber()));
                    else if (propValue.IsString()) propInfo.SetValue(instance, CornerRadius.Parse(propValue.AsString()));
                }
                else if (propInfo.PropertyType == typeof(Avalonia.Media.IBrush))
                {
                    if (propValue.IsString()) propInfo.SetValue(instance, Avalonia.Media.Brush.Parse(propValue.AsString()));
                }
                else if (propInfo.PropertyType == typeof(Avalonia.Media.Color))
                {
                    if (propValue.IsString()) propInfo.SetValue(instance, Avalonia.Media.Color.Parse(propValue.AsString()));
                }
                else if (propInfo.PropertyType == typeof(Avalonia.Media.IImage) || propInfo.PropertyType == typeof(Avalonia.Media.Imaging.Bitmap))
                {
                    if (propValue.IsString())
                    {
                        var urlOrPath = propValue.AsString();
                        if (urlOrPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || urlOrPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                        {
                            var cts = _downloadCts;
                            var token = cts.Token;
                            System.Threading.Tasks.Task.Run(async () =>
                            {
                                if (token.IsCancellationRequested) return;
                                try
                                {
                                    await _imageSemaphore.WaitAsync(token);
                                }
                                catch (OperationCanceledException)
                                {
                                    return;
                                }
                                try
                                {
                                    if (token.IsCancellationRequested) return;
                                    var request = new System.Net.Http.HttpRequestMessage(System.Net.Http.HttpMethod.Get, urlOrPath);
                                    var response = await _imageHttpClient.SendAsync(request, token);
                                    response.EnsureSuccessStatusCode();
                                    
                                    var bytes = await response.Content.ReadAsByteArrayAsync(token);
                                    if (token.IsCancellationRequested) return;
                                    
                                    using var ms = new System.IO.MemoryStream(bytes);
                                    var bitmap = new Avalonia.Media.Imaging.Bitmap(ms);
                                    Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                                    {
                                        if (token.IsCancellationRequested) return;
                                        propInfo.SetValue(instance, bitmap);
                                    });
                                }
                                catch (Exception ex) when (ex is OperationCanceledException || ex is TaskCanceledException)
                                {
                                    // Silently ignore cancellation
                                }
                                catch (Exception ex)
                                {
                                    Console.WriteLine($"Error loading image from {urlOrPath}: {ex.Message}");
                                }
                                finally
                                {
                                    _imageSemaphore.Release();
                                }
                            }, token);
                        }
                        else if (System.IO.File.Exists(urlOrPath))
                        {
                            try
                            {
                                var bitmap = new Avalonia.Media.Imaging.Bitmap(urlOrPath);
                                propInfo.SetValue(instance, bitmap);
                            }
                            catch { }
                        }
                    }
                }
                else if (propValue.IsString())
                {
                    var strValue = propValue.AsString();
                    if (propInfo.PropertyType == typeof(string) || propInfo.PropertyType == typeof(object))
                    {
                        propInfo.SetValue(instance, strValue);
                    }
                    else if (propInfo.PropertyType.IsEnum)
                    {
                        propInfo.SetValue(instance, Enum.Parse(propInfo.PropertyType, strValue, true));
                    }
                    else if (propInfo.PropertyType == typeof(IReadOnlyList<WindowTransparencyLevel>) || propInfo.PropertyType == typeof(IEnumerable<WindowTransparencyLevel>) || propInfo.PropertyType == typeof(IList<WindowTransparencyLevel>) || propInfo.PropertyType.Name.Contains("WindowTransparencyLevelCollection"))
                    {
                        var parts = strValue.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        var list = new List<WindowTransparencyLevel>();
                        foreach (var part in parts)
                        {
                            list.Add(ParseTransparencyLevel(part));
                        }
                        var collection = new WindowTransparencyLevelCollection(list);
                        propInfo.SetValue(instance, collection);
                    }
                    else
                    {
                        var converter = System.ComponentModel.TypeDescriptor.GetConverter(propInfo.PropertyType);
                        if (converter != null && converter.CanConvertFrom(typeof(string)))
                        {
                            propInfo.SetValue(instance, converter.ConvertFromInvariantString(strValue));
                        }
                    }
                }
                else if (propValue.IsArray() && (propInfo.PropertyType == typeof(IReadOnlyList<WindowTransparencyLevel>) || propInfo.PropertyType == typeof(IEnumerable<WindowTransparencyLevel>) || propInfo.PropertyType == typeof(IList<WindowTransparencyLevel>) || propInfo.PropertyType.Name.Contains("WindowTransparencyLevelCollection")))
                {
                    var arr = propValue.AsArray();
                    var list = new List<WindowTransparencyLevel>();
                    for (int i = 0; i < arr.Length; i++)
                    {
                        var val = arr[i];
                        if (val.IsString())
                        {
                            list.Add(ParseTransparencyLevel(val.AsString()));
                        }
                    }
                    var collection = new WindowTransparencyLevelCollection(list);
                    propInfo.SetValue(instance, collection);
                }
                else if (propValue.IsBoolean())
                {
                    propInfo.SetValue(instance, propValue.AsBoolean());
                }
                else if (propValue.IsNumber())
                {
                    propInfo.SetValue(instance, Convert.ChangeType(propValue.AsNumber(), propInfo.PropertyType));
                }
            }
            catch
            {
            }
        }
    }

    private static void ApplyChildren(object? instance, Jint.Native.JsArray children, Engine engine)
    {
        if (instance == null) return;
        var len = (int)children.Length;
        if (len == 0) return;

        var propInfo = instance.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(p => p.GetCustomAttribute<Avalonia.Metadata.ContentAttribute>(true) != null);

        if (propInfo != null)
        {
            var val = propInfo.GetValue(instance);

            // If the parent is a TextBlock and children are text nodes,
            // set the Text property directly instead of adding to Inlines
            if (instance is Avalonia.Controls.TextBlock textBlock && propInfo.Name == nameof(Avalonia.Controls.TextBlock.Inlines))
            {
                var sb = new System.Text.StringBuilder();
                for (int i = 0; i < len; i++)
                {
                    var child = CreateFromJsValue(children.Get((uint)i), engine);
                    if (child is Avalonia.Controls.TextBlock childTb && childTb.Text != null)
                        sb.Append(childTb.Text);
                }
                if (sb.Length > 0)
                    textBlock.Text = sb.ToString();
                return;
            }

            if (val is IList list)
            {
                for (int i = 0; i < len; i++)
                {
                    var child = CreateFromJsValue(children.Get((uint)i), engine);
                    if (child != null) list.Add(child);
                }
            }
            else if (propInfo.CanWrite)
            {
                var child = CreateFromJsValue(children.Get(0), engine);
                if (child != null) propInfo.SetValue(instance, child);
            }
        }
        else if (instance is ItemsControl itemsControl && itemsControl.Items is IList list)
        {
            for (int i = 0; i < len; i++)
            {
                var child = CreateFromJsValue(children.Get((uint)i), engine);
                if (child != null) list.Add(child);
            }
        }
    }

    public static void InsertChild(object? parent, JsValue childNode, object? anchor, Engine engine)
    {
        if (parent == null || childNode == null || childNode.IsUndefined()) return;

        var childObj = childNode.AsObject();
        var childControlValue = childObj.Get("NativeControl");
        object? childControl = null;

        if (childControlValue.IsUndefined())
        {
            childControl = CreateFromJsValue(childNode, engine);
        }
        else
        {
            // Try to extract the wrapped CLR object directly, but Jint handles conversion in ToObject
            try
            {
                childControl = childControlValue.ToObject();
            }
            catch { }
        }

        if (childControl == null) return;

        var propInfo = parent.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(p => p.GetCustomAttribute<Avalonia.Metadata.ContentAttribute>(true) != null);

        if (propInfo != null)
        {
            var val = propInfo.GetValue(parent);

            // TextBlock children should set Text, not add to Inlines
            if (parent is Avalonia.Controls.TextBlock tb && propInfo.Name == nameof(Avalonia.Controls.TextBlock.Inlines))
            {
                if (childControl is Avalonia.Controls.TextBlock childTb && childTb.Text != null)
                    tb.Text = childTb.Text;
                return;
            }

            if (val is IList list)
            {
                if (anchor != null)
                {
                    var index = list.IndexOf(anchor);
                    if (index >= 0) list.Insert(index, childControl);
                    else list.Add(childControl);
                }
                else
                {
                    list.Add(childControl);
                }
            }
            else if (propInfo.CanWrite)
            {
                propInfo.SetValue(parent, childControl);
            }
        }
        else if (parent is ItemsControl itemsControl)
        {
            if (itemsControl.Items is IList list)
            {
                if (anchor != null)
                {
                    var index = list.IndexOf(anchor);
                    if (index >= 0) list.Insert(index, childControl);
                    else list.Add(childControl);
                }
                else
                {
                    list.Add(childControl);
                }
            }
        }
    }

    public static void RemoveChild(object? parent, object? child)
    {
        if (parent == null || child == null) return;

        var propInfo = parent.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .FirstOrDefault(p => p.GetCustomAttribute<Avalonia.Metadata.ContentAttribute>(true) != null);

        if (propInfo != null)
        {
            // TextBlock children cleanup not applicable — text is stored in Text property
            if (parent is Avalonia.Controls.TextBlock && propInfo.Name == nameof(Avalonia.Controls.TextBlock.Inlines))
                return;

            var val = propInfo.GetValue(parent);
            if (val is IList list)
            {
                list.Remove(child);
            }
            else if (propInfo.CanWrite && val == child)
            {
                propInfo.SetValue(parent, null);
            }
        }
        else if (parent is ItemsControl itemsControl && itemsControl.Items is IList list)
        {
            list.Remove(child);
        }
    }

    private static WindowTransparencyLevel ParseTransparencyLevel(string val)
    {
        if (string.Equals(val, "None", StringComparison.OrdinalIgnoreCase)) return WindowTransparencyLevel.None;
        if (string.Equals(val, "Transparent", StringComparison.OrdinalIgnoreCase)) return WindowTransparencyLevel.Transparent;
        if (string.Equals(val, "Blur", StringComparison.OrdinalIgnoreCase)) return WindowTransparencyLevel.Blur;
        if (string.Equals(val, "AcrylicBlur", StringComparison.OrdinalIgnoreCase)) return WindowTransparencyLevel.AcrylicBlur;
        if (string.Equals(val, "Mica", StringComparison.OrdinalIgnoreCase)) return WindowTransparencyLevel.Mica;
        return WindowTransparencyLevel.None;
    }

    public static Dictionary<string, object?> JsObjectToDict(ObjectInstance jsObj)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var prop in jsObj.GetOwnProperties())
        {
            var key = prop.Key.AsString();
            if (key == "__proto__" || key == "constructor") continue;
            var val = jsObj.Get(prop.Key);
            dict[key] = JsValueToClr(val);
        }
        return dict;
    }

    public static object? JsValueToClr(JsValue val)
    {
        if (val.IsNull() || val.IsUndefined()) return null;
        if (val.IsString()) return val.AsString();
        if (val.IsNumber()) return val.AsNumber();
        if (val.IsBoolean()) return val.AsBoolean();
        if (val.IsArray())
        {
            var arr = val.AsArray();
            var list = new List<object?>();
            for (uint i = 0; i < arr.Length; i++)
                list.Add(JsValueToClr(arr[i]));
            return list;
        }
        if (val.IsObject())
        {
            return JsObjectToDict(val.AsObject());
        }
        return val.ToObject();
    }

    private static Transitions? CreateTransitions(Jint.Native.JsArray arr)
    {
        var transitions = new Transitions();
        for (uint i = 0; i < arr.Length; i++)
        {
            var item = arr[i];
            if (!item.IsObject()) continue;
            var dict = JsObjectToDict(item.AsObject());

            var propName = dict.TryGetValue("property", out var p) ? p?.ToString() : null;
            var duration = dict.TryGetValue("duration", out var d) ? Convert.ToDouble(d) : 200.0;
            var delay = dict.TryGetValue("delay", out var dl) ? Convert.ToDouble(dl) : 0.0;
            var easingStr = dict.TryGetValue("easing", out var e) ? e?.ToString() : null;

            if (propName == null) continue;

            var avaloniaProp = FindAvaloniaProperty(propName);
            if (avaloniaProp == null) continue;

            var propType = avaloniaProp.PropertyType;
            var durationTs = TimeSpan.FromMilliseconds(duration);
            var delayTs = TimeSpan.FromMilliseconds(delay);
            var easing = ParseEasingName(easingStr);

            ITransition? transition = null;
            if (propType == typeof(double) || propType == typeof(float))
                transition = new DoubleTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(int))
                transition = new IntegerTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(bool))
                transition = new BoolTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(Color))
                transition = new ColorTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(IBrush) || propType == typeof(ISolidColorBrush))
                transition = new BrushTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(Thickness))
                transition = new ThicknessTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(CornerRadius))
                transition = new CornerRadiusTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(Point))
                transition = new PointTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(Size))
                transition = new SizeTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(Vector))
                transition = new VectorTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(BoxShadows) || propType == typeof(BoxShadow))
                transition = new BoxShadowsTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(RelativePoint))
                transition = new RelativePointTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else if (propType == typeof(ITransform))
                transition = new TransformOperationsTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else
                transition = new DoubleTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };

            if (transition != null)
                transitions.Add(transition);
        }
        return transitions.Count > 0 ? transitions : null;
    }

    private static AvaloniaProperty? FindAvaloniaProperty(string propName)
    {
        return typeof(Control).GetFields(BindingFlags.Static | BindingFlags.Public | BindingFlags.FlattenHierarchy)
            .FirstOrDefault(f => f.Name == propName + "Property" && typeof(AvaloniaProperty).IsAssignableFrom(f.FieldType))
            ?.GetValue(null) as AvaloniaProperty;
    }

    private static Avalonia.Animation.Easings.Easing ParseEasingName(string? name)
    {
        if (string.IsNullOrEmpty(name)) return new Avalonia.Animation.Easings.LinearEasing();
        return name.ToLowerInvariant() switch
        {
            "linear" => new Avalonia.Animation.Easings.LinearEasing(),
            "ease" => new Avalonia.Animation.Easings.CubicEaseInOut(),
            "ease-in" => new Avalonia.Animation.Easings.CubicEaseIn(),
            "ease-out" => new Avalonia.Animation.Easings.CubicEaseOut(),
            "ease-in-out" => new Avalonia.Animation.Easings.CubicEaseInOut(),
            _ => new Avalonia.Animation.Easings.LinearEasing(),
        };
    }
}
