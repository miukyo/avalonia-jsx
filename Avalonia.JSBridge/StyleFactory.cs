using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using Avalonia.Animation;
using Avalonia.Animation.Easings;
using Avalonia.Controls;
using Avalonia.Media;
using Avalonia.Styling;
using Jint;
using Jint.Native;

namespace Avalonia.JSBridge;

public static class StyleFactory
{
    private static readonly Assembly _controlsAssembly = typeof(Control).Assembly;

    public static Style CreateStyle(string selector, Dictionary<string, object?> properties, Engine? engine = null)
    {
        var style = new Style { Selector = ParseSelector(selector) };
        foreach (var kvp in properties)
        {
            var propName = kvp.Key;
            var value = kvp.Value;
            // Handle Transitions by name — the raw List<object?> must be converted
            if (propName == "Transitions" && value is List<object?> transList)
            {
                var transitions = CreateTransitionsFromList(transList);
                if (transitions != null)
                {
                    var transProp = FindAvaloniaProperty("Transitions");
                    if (transProp != null)
                        style.Setters.Add(new Setter(transProp, transitions));
                }
                continue;
            }
            var propInfo = FindAvaloniaProperty(propName);
            if (propInfo != null)
            {
                var converted = ConvertPropertyValue(propInfo.PropertyType, value, engine);
                if (converted != null)
                {
                    style.Setters.Add(new Setter(propInfo, converted));
                }
            }
        }
        return style;
    }

    public static Selector ParseSelector(string selector)
    {
        selector = selector.Trim();
        if (string.IsNullOrEmpty(selector))
            throw new ArgumentException("Selector cannot be empty");

        var parts = selector.Split(',')
            .Select(p => p.Trim())
            .Where(p => p.Length > 0)
            .ToArray();

        if (parts.Length > 1)
        {
            var selectors = parts.Select(ParseSingleSelector).ToArray();
            return Selectors.Or((IReadOnlyList<Selector>)selectors);
        }

        return ParseSingleSelector(selector);
    }

    private static Selector ParseSingleSelector(string selector)
    {
        var tokens = Tokenize(selector);
        if (tokens.Count == 0)
            throw new ArgumentException($"Empty selector: '{selector}'");

        var combinatorGroups = SplitByCombinators(tokens);
        Selector? result = null;

        foreach (var group in combinatorGroups)
        {
            var (combinator, compoundTokens) = group;

            var compoundSelector = BuildCompoundSelector(compoundTokens);

            if (result == null)
            {
                result = compoundSelector;
            }
            else
            {
                result = combinator switch
                {
                    Combinator.Child => Selectors.OfType<Control>(result).Child().OfType<Control>(),
                    Combinator.Descendant => Selectors.OfType<Control>(result).Descendant().OfType<Control>(),
                    _ => result
                };
            }
        }

        return result ?? throw new ArgumentException($"Could not parse selector: '{selector}'");
    }

    private enum Combinator { None, Child, Descendant }

    private static List<(Combinator, List<Token>)> SplitByCombinators(List<Token> tokens)
    {
        var groups = new List<(Combinator, List<Token>)>();
        var current = new List<Token>();
        Combinator lastCombinator = Combinator.None;

        for (int i = 0; i < tokens.Count; i++)
        {
            if (tokens[i].Type == TokenType.Combinator)
            {
                if (current.Count > 0)
                {
                    groups.Add((lastCombinator, current));
                    current = new List<Token>();
                }
                lastCombinator = tokens[i].Value == ">" ? Combinator.Child : Combinator.Descendant;
            }
            else
            {
                current.Add(tokens[i]);
            }
        }

        if (current.Count > 0)
            groups.Add((lastCombinator, current));

        return groups;
    }

    private static Selector BuildCompoundSelector(List<Token> tokens)
    {
        Selector? result = null;
        string? typeName = null;
        string? name = null;
        var classes = new List<string>();
        var pseudos = new List<string>();

        foreach (var token in tokens)
        {
            switch (token.Type)
            {
                case TokenType.Type:
                    typeName = token.Value;
                    break;
                case TokenType.Id:
                    name = token.Value;
                    break;
                case TokenType.Class:
                    classes.Add(token.Value.StartsWith(".") ? token.Value : "." + token.Value);
                    break;
                case TokenType.Pseudo:
                    pseudos.Add(token.Value);
                    break;
            }
        }

        if (typeName != null)
        {
            var type = FindControlType(typeName);
            if (type != null)
            {
                result = Selectors.OfType(result, type);
            }
            else
            {
                // Unknown type name — fall back to :is(Control)
                result = Selectors.Is(result, typeof(Control));
            }
        }
        else if (classes.Count > 0 || pseudos.Count > 0 || name != null)
        {
            // No type specified — use :is(Control) so Avalonia can resolve the selector
            result = Selectors.Is(result, typeof(Control));
        }

        if (name != null)
        {
            result = Selectors.Name(result, name);
        }

        foreach (var cls in classes)
        {
            var className = cls.TrimStart('.');
            result = Selectors.Class(result, className);
        }

        foreach (var pseudo in pseudos)
        {
            result = Selectors.Class(result, pseudo);
        }

        return result!;
    }

    private static Type? FindControlType(string name)
    {
        return _controlsAssembly.GetTypes()
            .FirstOrDefault(t => t.Name.Equals(name, StringComparison.OrdinalIgnoreCase)
                && t.IsSubclassOf(typeof(Control)));
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

    private static AvaloniaProperty? FindAvaloniaProperty(string propName)
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

    private static object? ConvertPropertyValue(Type targetType, object? value, Engine? engine)
    {
        if (value == null) return null;

        if (value is string str)
        {
            // Strip surrounding quotes that may have slipped through from CSS
            if (str.Length >= 2 &&
                ((str[0] == '"' && str[^1] == '"') || (str[0] == '\'' && str[^1] == '\'')))
            {
                str = str[1..^1].Trim();
            }
            // Normalise space-separated thickness values to comma-separated (e.g. "12 24" → "12,24")
            if ((targetType == typeof(Thickness) || targetType == typeof(CornerRadius)) && str.Contains(' '))
            {
                str = System.Text.RegularExpressions.Regex.Replace(str.Trim(), @"\s+", ",");
            }
            try
            {
                if (targetType == typeof(IBrush))
                    return Brush.Parse(str);
                if (targetType == typeof(Color))
                    return Color.Parse(str);
                if (targetType == typeof(Geometry) || targetType.IsSubclassOf(typeof(Geometry)))
                    return Geometry.Parse(str);
                if (targetType == typeof(Thickness))
                    return Thickness.Parse(str);
                if (targetType == typeof(CornerRadius))
                    return CornerRadius.Parse(str);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[StyleFactory] Failed to parse '{str}' as {targetType.Name}: {ex.Message}");
                return null;
            }
            if (targetType == typeof(double) || targetType == typeof(float))
                return double.TryParse(str, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out var d) ? d : null;
            if (targetType == typeof(int))
                return int.TryParse(str, out var i) ? i : null;
            if (targetType.IsEnum && Enum.TryParse(targetType, str, true, out var enumVal))
                return enumVal;
            if (targetType == typeof(BoxShadow))
                return BoxShadow.Parse(str);
            return str;
        }

        if (value is bool b)
        {
            if (targetType == typeof(bool)) return b;
            return b;
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

        if (value is Dictionary<string, object?> obj)
        {
            if (targetType == typeof(ITransform) || typeof(Transform).IsAssignableFrom(targetType))
                return TransformFactory.CreateFromJson(obj);
            if (targetType == typeof(IEffect) || typeof(Effect).IsAssignableFrom(targetType))
                return EffectFactory.CreateFromJson(obj);
            if (typeof(Brush).IsAssignableFrom(targetType) || targetType == typeof(IBrush))
                return BrushFactory.CreateFromJson(obj);
            if (typeof(Geometry).IsAssignableFrom(targetType) || targetType == typeof(Geometry))
                return GeometryFactory.CreateFromJson(obj);
        }

        if (value is List<object?> list)
        {
            if (typeof(System.Collections.IList).IsAssignableFrom(targetType))
                return list;
            if (targetType == typeof(Transitions) || targetType == typeof(IList<ITransition>))
                return CreateTransitionsFromList(list);
        }

        return value;
    }

    private static Transitions? CreateTransitionsFromList(List<object?> list)
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
            else if (propType == typeof(ITransform))
                transition = new TransformOperationsTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };
            else
                transition = new DoubleTransition { Property = avaloniaProp, Duration = durationTs, Delay = delayTs, Easing = easing };

            if (transition != null)
                transitions.Add(transition);
        }
        return transitions.Count > 0 ? transitions : null;
    }

    private static Easing ParseEasingName(string? name)
    {
        if (string.IsNullOrEmpty(name)) return new LinearEasing();
        return name.ToLowerInvariant() switch
        {
            "linear" => new LinearEasing(),
            "ease" => new CubicEaseInOut(),
            "ease-in" => new CubicEaseIn(),
            "ease-out" => new CubicEaseOut(),
            "ease-in-out" => new CubicEaseInOut(),
            _ => new LinearEasing(),
        };
    }

    private enum TokenType { Type, Id, Class, Pseudo, Combinator, AttribStart, AttribEnd, AttribEq, AttribValue }

    private class Token
    {
        public TokenType Type { get; set; }
        public string Value { get; set; } = "";
    }

    private static List<Token> Tokenize(string selector)
    {
        var tokens = new List<Token>();
        int i = 0;
        while (i < selector.Length)
        {
            var c = selector[i];
            if (c == ' ')
            {
                var start = i;
                while (i < selector.Length && selector[i] == ' ') i++;
                if (i < selector.Length && selector[i] != ',' && selector[i] != '>')
                {
                    if (tokens.Count > 0 && tokens[^1].Type != TokenType.Combinator)
                        tokens.Add(new Token { Type = TokenType.Combinator, Value = " " });
                }
                continue;
            }

            if (c == '>')
            {
                tokens.Add(new Token { Type = TokenType.Combinator, Value = ">" });
                i++;
                continue;
            }

            if (c == ',')
            {
                i++;
                continue;
            }

            if (c == '#')
            {
                i++;
                var start = i;
                while (i < selector.Length && (char.IsLetterOrDigit(selector[i]) || selector[i] == '-'))
                    i++;
                tokens.Add(new Token { Type = TokenType.Id, Value = selector[start..i] });
                continue;
            }

            if (c == '.')
            {
                i++;
                var start = i;
                while (i < selector.Length && (char.IsLetterOrDigit(selector[i]) || selector[i] == '-'))
                    i++;
                tokens.Add(new Token { Type = TokenType.Class, Value = "." + selector[start..i] });
                continue;
            }

            if (c == ':')
            {
                i++;
                var start = i;
                while (i < selector.Length && (char.IsLetterOrDigit(selector[i]) || selector[i] == '-'))
                    i++;
                tokens.Add(new Token { Type = TokenType.Pseudo, Value = ":" + selector[start..i] });
                continue;
            }

            if (c == '[')
            {
                i++;
                var start = i;
                while (i < selector.Length && selector[i] != ']' && selector[i] != '=')
                    i++;
                var propName = selector[start..i].Trim();
                tokens.Add(new Token { Type = TokenType.AttribStart, Value = propName });
                if (i < selector.Length && selector[i] == '=')
                {
                    tokens.Add(new Token { Type = TokenType.AttribEq, Value = "=" });
                    i++;
                    start = i;
                    if (i < selector.Length && (selector[i] == '"' || selector[i] == '\''))
                    {
                        var quote = selector[i];
                        i++;
                        start = i;
                        while (i < selector.Length && selector[i] != quote) i++;
                        tokens.Add(new Token { Type = TokenType.AttribValue, Value = selector[start..i] });
                        if (i < selector.Length) i++;
                    }
                    else
                    {
                        while (i < selector.Length && selector[i] != ']') i++;
                        tokens.Add(new Token { Type = TokenType.AttribValue, Value = selector[start..i].Trim() });
                    }
                }
                if (i < selector.Length) i++;
                tokens.Add(new Token { Type = TokenType.AttribEnd });
                continue;
            }

            if (char.IsLetter(c))
            {
                var start = i;
                while (i < selector.Length && (char.IsLetterOrDigit(selector[i]) || selector[i] == '-'))
                    i++;
                tokens.Add(new Token { Type = TokenType.Type, Value = selector[start..i] });
                continue;
            }

            i++;
        }

        return tokens;
    }
}
