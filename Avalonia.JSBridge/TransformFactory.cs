using System;
using System.Collections.Generic;
using Avalonia.Media;

namespace Avalonia.JSBridge;

public static class TransformFactory
{
    public static ITransform? CreateFromJson(Dictionary<string, object?> json)
    {
        if (json == null || !json.TryGetValue("type", out var typeObj) || typeObj is not string type)
            return null;

        return type switch
        {
            "rotate" => new RotateTransform
            {
                Angle = GetDouble(json, "angle") ?? 0,
                CenterX = GetDouble(json, "centerX") ?? 0,
                CenterY = GetDouble(json, "centerY") ?? 0,
            },
            "scale" => new ScaleTransform
            {
                ScaleX = GetDouble(json, "x") ?? GetDouble(json, "scaleX") ?? 1,
                ScaleY = GetDouble(json, "y") ?? GetDouble(json, "scaleY") ?? 1,
            },
            "translate" => new TranslateTransform
            {
                X = GetDouble(json, "x") ?? 0,
                Y = GetDouble(json, "y") ?? 0,
            },
            "skew" => new SkewTransform
            {
                AngleX = GetDouble(json, "x") ?? GetDouble(json, "angleX") ?? 0,
                AngleY = GetDouble(json, "y") ?? GetDouble(json, "angleY") ?? 0,
            },
            "group" => CreateGroup(json),
            _ => null
        };
    }

    public static TransformGroup? CreateGroup(Dictionary<string, object?> json)
    {
        if (!json.TryGetValue("children", out var childrenObj) || childrenObj is not List<object?> children)
            return null;

        var group = new TransformGroup();
        foreach (var child in children)
        {
            if (child is Dictionary<string, object?> childJson)
            {
                var transform = CreateFromJson(childJson);
                if (transform is Transform t)
                    group.Children.Add(t);
            }
        }
        return group;
    }

    private static double? GetDouble(Dictionary<string, object?> dict, string key)
    {
        if (dict.TryGetValue(key, out var val) && val is double d)
            return d;
        if (dict.TryGetValue(key, out var val2) && val2 is int i)
            return i;
        if (dict.TryGetValue(key, out var val3) && val3 is long l)
            return l;
        if (dict.TryGetValue(key, out var val4) && val4 is string s && double.TryParse(s, out var parsed))
            return parsed;
        return null;
    }
}
