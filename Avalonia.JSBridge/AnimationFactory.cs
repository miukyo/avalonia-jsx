using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Avalonia.Animation;
using Avalonia.Animation.Easings;
using Avalonia.Media;
using Avalonia.Styling;

namespace Avalonia.JSBridge;

public static class AnimationFactory
{
    public static Avalonia.Animation.Animation CreateAnimation(Dictionary<string, object?> json)
    {
        var anim = new Avalonia.Animation.Animation
        {
            Duration = TimeSpan.FromMilliseconds(GetDouble(json, "duration") ?? 300),
            Delay = TimeSpan.FromMilliseconds(GetDouble(json, "delay") ?? 0),
            DelayBetweenIterations = TimeSpan.FromMilliseconds(GetDouble(json, "delayBetweenIterations") ?? 0),
            SpeedRatio = GetDouble(json, "speedRatio") ?? 1.0,
            Easing = ParseEasing(json),
            IterationCount = ParseIterationCount(json),
            PlaybackDirection = ParsePlaybackDirection(json),
            FillMode = ParseFillMode(json),
        };

        if (json.TryGetValue("keyframes", out var kfObj) && kfObj is List<object?> keyframes)
        {
            foreach (var kf in keyframes)
            {
                if (kf is Dictionary<string, object?> kfDict)
                {
                    anim.Children.Add(CreateKeyFrame(kfDict));
                }
            }
        }

        return anim;
    }

    public static async Task RunAnimation(Animatable target, Dictionary<string, object?> json, CancellationToken ct = default)
    {
        var anim = CreateAnimation(json);
        await anim.RunAsync(target, ct);
    }

    private static KeyFrame CreateKeyFrame(Dictionary<string, object?> json)
    {
        var kf = new KeyFrame
        {
            Cue = new Cue(GetDouble(json, "offset") ?? 0),
        };

        if (json.TryGetValue("keySpline", out var splineObj) && splineObj is string splineStr)
        {
            kf.KeySpline = KeySpline.Parse(splineStr, null);
        }
        else if (json.TryGetValue("keySpline", out var splineObj2) && splineObj2 is Dictionary<string, object?> splineDict)
        {
            kf.KeySpline = new KeySpline
            {
                ControlPointX1 = GetDouble(splineDict, "x1") ?? 0,
                ControlPointY1 = GetDouble(splineDict, "y1") ?? 0,
                ControlPointX2 = GetDouble(splineDict, "x2") ?? 1,
                ControlPointY2 = GetDouble(splineDict, "y2") ?? 1,
            };
        }

        if (json.TryGetValue("properties", out var propsObj) && propsObj is Dictionary<string, object?> props)
        {
            foreach (var kvp in props)
            {
                var prop = FindAvaloniaProperty(kvp.Key);
                if (prop != null)
                {
                    var converted = ConvertAnimationValue(prop.PropertyType, kvp.Value);
                    if (converted != null)
                    {
                        kf.Setters.Add(new Setter(prop, converted));
                    }
                }
            }
        }

        return kf;
    }

    private static Easing ParseEasing(Dictionary<string, object?> json)
    {
        if (!json.TryGetValue("easing", out var val) || val is not string easingStr)
            return new LinearEasing();

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

    private static IterationCount ParseIterationCount(Dictionary<string, object?> json)
    {
        if (!json.TryGetValue("iterations", out var val))
            return new IterationCount(1);

        if (val is double d)
            return new IterationCount((ulong)d);
        if (val is int i)
            return new IterationCount((ulong)i);
        if (val is string s && s.Equals("infinite", StringComparison.OrdinalIgnoreCase))
            return IterationCount.Infinite;

        return new IterationCount(1);
    }

    private static PlaybackDirection ParsePlaybackDirection(Dictionary<string, object?> json)
    {
        if (!json.TryGetValue("direction", out var val) || val is not string s)
            return PlaybackDirection.Normal;

        return s.ToLowerInvariant() switch
        {
            "reverse" => PlaybackDirection.Reverse,
            "alternate" => PlaybackDirection.Alternate,
            "alternate-reverse" => PlaybackDirection.AlternateReverse,
            _ => PlaybackDirection.Normal
        };
    }

    private static FillMode ParseFillMode(Dictionary<string, object?> json)
    {
        if (!json.TryGetValue("fillMode", out var val) || val is not string s)
            return FillMode.None;

        return s.ToLowerInvariant() switch
        {
            "forwards" or "forward" => FillMode.Forward,
            "backwards" or "backward" => FillMode.Backward,
            "both" => FillMode.Both,
            _ => FillMode.None
        };
    }

    private static AvaloniaProperty? FindAvaloniaProperty(string propName)
    {
        var propField = typeof(Avalonia.Controls.Control).GetFields(
            System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.Public |
            System.Reflection.BindingFlags.FlattenHierarchy)
            .FirstOrDefault(f => f.Name == propName + "Property" &&
                typeof(AvaloniaProperty).IsAssignableFrom(f.FieldType));
        return propField?.GetValue(null) as AvaloniaProperty;
    }

    private static object? ConvertAnimationValue(Type targetType, object? value)
    {
        if (value == null) return null;

        if (value is string str)
        {
            if (targetType == typeof(Color)) return Color.Parse(str);
            if (targetType == typeof(IBrush)) return Brush.Parse(str);
            if (targetType == typeof(Thickness)) return Thickness.Parse(str);
            if (targetType == typeof(CornerRadius)) return CornerRadius.Parse(str);
            if (targetType.IsEnum && Enum.TryParse(targetType, str, true, out var enumVal)) return enumVal;
            if (targetType == typeof(double)) return double.TryParse(str, out var d) ? d : null;
            return str;
        }

        if (value is double num)
        {
            if (targetType == typeof(double)) return num;
            if (targetType == typeof(float)) return (float)num;
            if (targetType == typeof(int)) return (int)num;
            if (targetType == typeof(Thickness)) return new Thickness(num);
            if (targetType == typeof(CornerRadius)) return new CornerRadius(num);
            return num;
        }

        if (value is bool b)
        {
            if (targetType == typeof(bool)) return b;
            return b;
        }

        if (value is Dictionary<string, object?> obj)
        {
            if (typeof(Transform).IsAssignableFrom(targetType) || targetType == typeof(ITransform))
                return TransformFactory.CreateFromJson(obj);
            if (typeof(Brush).IsAssignableFrom(targetType) || targetType == typeof(IBrush))
                return BrushFactory.CreateFromJson(obj);
            if (typeof(Geometry).IsAssignableFrom(targetType) || targetType == typeof(Geometry))
                return GeometryFactory.CreateFromJson(obj);
        }

        return value;
    }

    private static double? GetDouble(Dictionary<string, object?> dict, string key)
    {
        if (dict.TryGetValue(key, out var val) && val is double d) return d;
        if (dict.TryGetValue(key, out var val2) && val2 is int i) return i;
        if (dict.TryGetValue(key, out var val3) && val3 is long l) return l;
        if (dict.TryGetValue(key, out var val4) && val4 is string s && double.TryParse(s, out var parsed)) return parsed;
        return null;
    }
}
