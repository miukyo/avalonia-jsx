using System;
using System.Collections.Generic;
using Avalonia;
using Avalonia.Media;

namespace Avalonia.JSBridge;

public static class GeometryFactory
{
    public static Geometry? CreateFromJson(Dictionary<string, object?> json)
    {
        if (json == null || !json.TryGetValue("type", out var typeObj) || typeObj is not string type)
            return null;

        return type switch
        {
            "rectangle" => CreateRectangle(json),
            "ellipse" => CreateEllipse(json),
            "path" => CreatePath(json),
            "combine" => CreateCombined(json),
            _ => null
        };
    }

    public static Geometry? CreateFromString(string svgPath)
    {
        if (string.IsNullOrEmpty(svgPath)) return null;
        return Geometry.Parse(svgPath);
    }

    private static RectangleGeometry? CreateRectangle(Dictionary<string, object?> json)
    {
        var rect = GetRect(json, "rect");
        if (rect == null) return null;
        return new RectangleGeometry(rect.Value, Utils.GetDouble(json, "radiusX") ?? 0, Utils.GetDouble(json, "radiusY") ?? 0);
    }

    private static EllipseGeometry? CreateEllipse(Dictionary<string, object?> json)
    {
        var rect = GetRect(json, "rect");
        if (rect != null) return new EllipseGeometry(rect.Value);

        var cx = Utils.GetDouble(json, "cx") ?? Utils.GetDouble(json, "centerX") ?? 0;
        var cy = Utils.GetDouble(json, "cy") ?? Utils.GetDouble(json, "centerY") ?? 0;
        var rx = Utils.GetDouble(json, "rx") ?? Utils.GetDouble(json, "radiusX") ?? 50;
        var ry = Utils.GetDouble(json, "ry") ?? Utils.GetDouble(json, "radiusY") ?? 50;
        return new EllipseGeometry(new Rect(cx - rx, cy - ry, rx * 2, ry * 2));
    }

    private static PathGeometry? CreatePath(Dictionary<string, object?> json)
    {
        if (json.TryGetValue("data", out var data) && data is string svgData && !string.IsNullOrEmpty(svgData))
            return PathGeometry.Parse(svgData);
        return null;
    }

    private static CombinedGeometry? CreateCombined(Dictionary<string, object?> json)
    {
        var g1 = json.TryGetValue("geometry1", out var g1Obj) && g1Obj is Dictionary<string, object?> g1Json
            ? CreateFromJson(g1Json) : null;
        var g2 = json.TryGetValue("geometry2", out var g2Obj) && g2Obj is Dictionary<string, object?> g2Json
            ? CreateFromJson(g2Json) : null;
        if (g1 == null || g2 == null) return null;

        var mode = GeometryCombineMode.Union;
        if (json.TryGetValue("mode", out var modeObj) && modeObj is string modeStr)
        {
            mode = modeStr.ToLowerInvariant() switch
            {
                "intersect" => GeometryCombineMode.Intersect,
                "xor" => GeometryCombineMode.Xor,
                "exclude" => GeometryCombineMode.Exclude,
                _ => GeometryCombineMode.Union
            };
        }

        return new CombinedGeometry(mode, g1, g2);
    }

    private static Rect? GetRect(Dictionary<string, object?> json, string key)
    {
        if (!json.TryGetValue(key, out var val) || val is not Dictionary<string, object?> rect)
            return null;
        var x = Utils.GetDouble(rect, "x") ?? 0;
        var y = Utils.GetDouble(rect, "y") ?? 0;
        var w = Utils.GetDouble(rect, "width") ?? Utils.GetDouble(rect, "w") ?? 100;
        var h = Utils.GetDouble(rect, "height") ?? Utils.GetDouble(rect, "h") ?? 100;
        return new Rect(x, y, w, h);
    }
}
