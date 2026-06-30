using System;
using System.Collections.Generic;
using Avalonia;
using Avalonia.Media;

namespace Avalonia.JSBridge;

public static class BrushFactory
{
    public static IBrush? CreateFromJson(Dictionary<string, object?> json)
    {
        if (json == null || !json.TryGetValue("type", out var typeObj) || typeObj is not string type)
            return null;

        return type switch
        {
            "linearGradient" => CreateLinearGradient(json),
            "radialGradient" => CreateRadialGradient(json),
            "conicGradient" => CreateConicGradient(json),
            _ => null
        };
    }

    private static LinearGradientBrush? CreateLinearGradient(Dictionary<string, object?> json)
    {
        var brush = new LinearGradientBrush
        {
            StartPoint = ParseRelativePoint(json, "startPoint") ?? new RelativePoint(0, 0.5, RelativeUnit.Relative),
            EndPoint = ParseRelativePoint(json, "endPoint") ?? new RelativePoint(1, 0.5, RelativeUnit.Relative),
            SpreadMethod = ParseSpreadMethod(json),
        };
        FillGradientStops(brush, json);
        return brush;
    }

    private static RadialGradientBrush? CreateRadialGradient(Dictionary<string, object?> json)
    {
        var brush = new RadialGradientBrush
        {
            Center = ParseRelativePoint(json, "center") ?? new RelativePoint(0.5, 0.5, RelativeUnit.Relative),
            GradientOrigin = ParseRelativePoint(json, "gradientOrigin") ?? new RelativePoint(0.5, 0.5, RelativeUnit.Relative),
            RadiusX = ParseRelativeScalar(json, "radiusX") ?? new RelativeScalar(0.5, RelativeUnit.Relative),
            RadiusY = ParseRelativeScalar(json, "radiusY") ?? new RelativeScalar(0.5, RelativeUnit.Relative),
            SpreadMethod = ParseSpreadMethod(json),
        };
        FillGradientStops(brush, json);
        return brush;
    }

    private static ConicGradientBrush? CreateConicGradient(Dictionary<string, object?> json)
    {
        var brush = new ConicGradientBrush
        {
            Center = ParseRelativePoint(json, "center") ?? new RelativePoint(0.5, 0.5, RelativeUnit.Relative),
            Angle = GetDouble(json, "angle") ?? 0,
        };
        FillGradientStops(brush, json);
        return brush;
    }

    private static void FillGradientStops(GradientBrush brush, Dictionary<string, object?> json)
    {
        if (!json.TryGetValue("stops", out var stopsObj) || stopsObj is not List<object?> stops)
            return;

        foreach (var stop in stops)
        {
            if (stop is not Dictionary<string, object?> stopDict) continue;
            var offset = GetDouble(stopDict, "offset") ?? 0;
            var color = ParseColor(stopDict, "color") ?? Colors.Transparent;
            brush.GradientStops.Add(new GradientStop(color, offset));
        }
    }

    private static GradientSpreadMethod ParseSpreadMethod(Dictionary<string, object?> json)
    {
        if (json.TryGetValue("spreadMethod", out var val) && val is string s)
        {
            return s.ToLowerInvariant() switch
            {
                "reflect" => GradientSpreadMethod.Reflect,
                "repeat" => GradientSpreadMethod.Repeat,
                _ => GradientSpreadMethod.Pad
            };
        }
        return GradientSpreadMethod.Pad;
    }

    private static RelativePoint? ParseRelativePoint(Dictionary<string, object?> json, string key)
    {
        if (json.TryGetValue(key, out var val))
        {
            if (val is string s)
            {
                var parts = s.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length == 2 &&
                    double.TryParse(parts[0], out var x) &&
                    double.TryParse(parts[1], out var y))
                {
                    if (x >= 0 && x <= 1 && y >= 0 && y <= 1)
                        return new RelativePoint(x, y, RelativeUnit.Relative);
                    return new RelativePoint(x, y, RelativeUnit.Absolute);
                }
            }
            if (val is List<object?> list && list.Count == 2)
            {
                var x = Convert.ToDouble(list[0]);
                var y = Convert.ToDouble(list[1]);
                return new RelativePoint(x, y, RelativeUnit.Relative);
            }
        }
        return null;
    }

    private static RelativeScalar? ParseRelativeScalar(Dictionary<string, object?> json, string key)
    {
        if (json.TryGetValue(key, out var val))
        {
            if (val is double d)
                return new RelativeScalar(d, d >= 0 && d <= 1 ? RelativeUnit.Relative : RelativeUnit.Absolute);
            if (val is string s && double.TryParse(s, out var parsed))
                return new RelativeScalar(parsed, parsed >= 0 && parsed <= 1 ? RelativeUnit.Relative : RelativeUnit.Absolute);
        }
        return null;
    }

    private static Color? ParseColor(Dictionary<string, object?> dict, string key)
    {
        if (dict.TryGetValue(key, out var val) && val is string s && Color.TryParse(s, out var color))
            return color;
        return null;
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
