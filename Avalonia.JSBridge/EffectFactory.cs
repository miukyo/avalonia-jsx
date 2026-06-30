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
                BlurRadius = Utils.GetDouble(json, "blurRadius") ?? 5,
                OffsetX = Utils.GetDouble(json, "offsetX") ?? 3.5355,
                OffsetY = Utils.GetDouble(json, "offsetY") ?? 3.5355,
                Color = Utils.ParseColor(json, "color") ?? Colors.Black,
                Opacity = Utils.GetDouble(json, "opacity") ?? 1,
            },
            "dropShadowDirection" => new DropShadowDirectionEffect
            {
                BlurRadius = Utils.GetDouble(json, "blurRadius") ?? 5,
                ShadowDepth = Utils.GetDouble(json, "shadowDepth") ?? 5,
                Direction = Utils.GetDouble(json, "direction") ?? 315,
                Color = Utils.ParseColor(json, "color") ?? Colors.Black,
                Opacity = Utils.GetDouble(json, "opacity") ?? 1,
            },
            "blur" => new BlurEffect
            {
                Radius = Utils.GetDouble(json, "radius") ?? 5,
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


}
