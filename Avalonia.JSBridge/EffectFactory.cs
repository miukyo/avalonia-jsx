using System;
using System.Collections.Generic;
using Avalonia.Media;
using Avalonia.Media.Immutable;

namespace Avalonia.JSBridge;

public static class EffectFactory
{
    public static IEffect? CreateFromJson(Dictionary<string, object?> json)
    {
        if (json == null || !json.TryGetValue("type", out var typeObj) || typeObj is not string type)
            return null;

        return type switch
        {
            "dropShadow" => new DropShadowEffect
            {
                BlurRadius = GetDouble(json, "blurRadius") ?? 5,
                OffsetX = GetDouble(json, "offsetX") ?? 3.5355,
                OffsetY = GetDouble(json, "offsetY") ?? 3.5355,
                Color = ParseColor(json, "color") ?? Colors.Black,
                Opacity = GetDouble(json, "opacity") ?? 1,
            },
            "dropShadowDirection" => new DropShadowDirectionEffect
            {
                BlurRadius = GetDouble(json, "blurRadius") ?? 5,
                ShadowDepth = GetDouble(json, "shadowDepth") ?? 5,
                Direction = GetDouble(json, "direction") ?? 315,
                Color = ParseColor(json, "color") ?? Colors.Black,
                Opacity = GetDouble(json, "opacity") ?? 1,
            },
            "blur" => new BlurEffect
            {
                Radius = GetDouble(json, "radius") ?? 5,
            },
            _ => null
        };
    }

    public static IEffect? FromBoxShadow(BoxShadow boxShadow)
    {
        if (boxShadow.IsInset) return null;
        return new DropShadowEffect
        {
            BlurRadius = boxShadow.Blur,
            OffsetX = boxShadow.OffsetX,
            OffsetY = boxShadow.OffsetY,
            Color = boxShadow.Color,
        };
    }

    private static Color? ParseColor(Dictionary<string, object?> json, string key)
    {
        if (json.TryGetValue(key, out var val) && val is string s)
        {
            if (Color.TryParse(s, out var color))
                return color;
        }
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
