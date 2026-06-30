using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Avalonia;
using Avalonia.Animation;
using Avalonia.Animation.Easings;
using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Media.Transformation;

namespace Avalonia.JSBridge;

public static class Utils
{
    public static double? GetDouble(Dictionary<string, object?> dict, string key)
    {
        if (dict.TryGetValue(key, out var val) && val is double d) return d;
        if (dict.TryGetValue(key, out var val2) && val2 is int i) return i;
        if (dict.TryGetValue(key, out var val3) && val3 is long l) return l;
        if (dict.TryGetValue(key, out var val4) && val4 is string s && double.TryParse(s, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var parsed)) return parsed;
        return null;
    }

    public static Color? ParseColor(Dictionary<string, object?> dict, string key)
    {
        if (dict.TryGetValue(key, out var val) && val is string s && Color.TryParse(s, out var color))
            return color;
        return null;
    }

    // Types to search for Avalonia properties (covers the full common hierarchy)
    private static readonly Type[] _propertySearchTypes = new[]
    {
        typeof(Control),
        typeof(Avalonia.Layout.Layoutable),
        typeof(Avalonia.Visual),
        typeof(Avalonia.Controls.Primitives.TemplatedControl),
        typeof(Avalonia.Controls.ContentControl),
        typeof(Avalonia.Controls.StackPanel),
        typeof(Avalonia.Controls.WrapPanel),
        typeof(Avalonia.Controls.Panel),
        typeof(Avalonia.Controls.Border),
        typeof(Avalonia.Controls.TextBlock),
        typeof(Avalonia.Controls.Button),
        typeof(Avalonia.Controls.TextBox),
        typeof(Avalonia.Controls.ItemsControl),
    };

    public static AvaloniaProperty? FindAvaloniaProperty(string propName)
    {
        var fieldName = propName + "Property";
        foreach (var type in _propertySearchTypes)
        {
            var field = type.GetFields(BindingFlags.Static | BindingFlags.Public | BindingFlags.FlattenHierarchy)
                .FirstOrDefault(f => f.Name == fieldName && typeof(AvaloniaProperty).IsAssignableFrom(f.FieldType));
            if (field != null)
                return field.GetValue(null) as AvaloniaProperty;
        }
        return null;
    }

    public static Easing ParseEasing(string? easingStr)
    {
        if (string.IsNullOrEmpty(easingStr)) return new LinearEasing();

        var parts = easingStr.Split('(', StringSplitOptions.TrimEntries);
        var name = parts[0].ToLowerInvariant();

        return name switch
        {
            "linear" => new LinearEasing(),
            "ease" => new CubicEaseInOut(),
            "ease-in" => new CubicEaseIn(),
            "ease-out" => new CubicEaseOut(),
            "ease-in-out" => new CubicEaseInOut(),
            "cubic-bezier" => ParseCubicBezier(easingStr),
            "spring" => new SpringEasing(),
            "sine" or "sinein" => new SineEaseIn(),
            "sineout" => new SineEaseOut(),
            "sineinout" => new SineEaseInOut(),
            "quad" or "quadratic" or "quadraticin" => new QuadraticEaseIn(),
            "quadraticout" => new QuadraticEaseOut(),
            "quadraticinout" => new QuadraticEaseInOut(),
            "cubic" or "cubicin" => new CubicEaseIn(),
            "cubicout" => new CubicEaseOut(),
            "cubicinout" => new CubicEaseInOut(),
            "quart" or "quartic" or "quarticin" => new QuarticEaseIn(),
            "quarticout" => new QuarticEaseOut(),
            "quarticinout" => new QuarticEaseInOut(),
            "quint" or "quinticin" => new QuinticEaseIn(),
            "quinticout" => new QuinticEaseOut(),
            "quinticinout" => new QuinticEaseInOut(),
            "expo" or "exponential" or "exponentialin" => new ExponentialEaseIn(),
            "exponentialout" => new ExponentialEaseOut(),
            "exponentialinout" => new ExponentialEaseInOut(),
            "circ" or "circular" or "circularin" => new CircularEaseIn(),
            "circularout" => new CircularEaseOut(),
            "circularinout" => new CircularEaseInOut(),
            "back" or "backin" => new BackEaseIn(),
            "backout" => new BackEaseOut(),
            "backinout" => new BackEaseInOut(),
            "elastic" or "elasticin" => new ElasticEaseIn(),
            "elasticout" => new ElasticEaseOut(),
            "elasticinout" => new ElasticEaseInOut(),
            "bounce" or "bouncein" => new BounceEaseIn(),
            "bounceout" => new BounceEaseOut(),
            "bounceinout" => new BounceEaseInOut(),
            _ => new LinearEasing(),
        };
    }

    private static Easing ParseCubicBezier(string str)
    {
        var nums = str.Replace("cubic-bezier(", "").Replace(")", "")
            .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        if (nums.Length == 4 &&
            double.TryParse(nums[0], out var x1) &&
            double.TryParse(nums[1], out var y1) &&
            double.TryParse(nums[2], out var x2) &&
            double.TryParse(nums[3], out var y2))
        {
            return new SplineEasing(x1, y1, x2, y2);
        }
        return new LinearEasing();
    }

    public static Transitions? CreateTransitions(List<object?> list)
    {
        var transitions = new Transitions();
        foreach (var item in list)
        {
            if (item is not Dictionary<string, object?> dict) continue;
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
            var easing = ParseEasing(easingStr);

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
}
