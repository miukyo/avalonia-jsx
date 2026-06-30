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
                Angle = Utils.GetDouble(json, "angle") ?? 0,
                CenterX = Utils.GetDouble(json, "centerX") ?? 0,
                CenterY = Utils.GetDouble(json, "centerY") ?? 0,
            },
            "scale" => new ScaleTransform
            {
                ScaleX = Utils.GetDouble(json, "x") ?? Utils.GetDouble(json, "scaleX") ?? 1,
                ScaleY = Utils.GetDouble(json, "y") ?? Utils.GetDouble(json, "scaleY") ?? 1,
            },
            "translate" => new TranslateTransform
            {
                X = Utils.GetDouble(json, "x") ?? 0,
                Y = Utils.GetDouble(json, "y") ?? 0,
            },
            "skew" => new SkewTransform
            {
                AngleX = Utils.GetDouble(json, "x") ?? Utils.GetDouble(json, "angleX") ?? 0,
                AngleY = Utils.GetDouble(json, "y") ?? Utils.GetDouble(json, "angleY") ?? 0,
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


}
