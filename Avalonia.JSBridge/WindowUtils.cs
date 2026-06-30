using System;
using System.Collections.Generic;
using System.Reflection;
using Avalonia.Controls;

namespace Avalonia.JSBridge;

public static class WindowUtils
{
    private static readonly HashSet<string> ExcludedProps = new(StringComparer.OrdinalIgnoreCase)
    {
        "Content", "Parent", "VisualParent", "LogicalParent", "InheritanceParent",
        "Position", "Bounds", "FrameSize", "ClientSize", "IsActive", "IsVisible",
        "Owner", "Presenter", "PlatformImpl", "Renderer", "Clipboard", "StorageProvider",
        "FocusManager", "InputMethod", "Screens", "DataContext", "CommandBindings",
        "InputBindings", "Styles", "Resources", "TemplatedParent", "Transitions"
    };

    /// <summary>
    /// Copies all user-configured window properties dynamically from a source Window to a target Window.
    /// Excludes structural, platform-specific, and layout-jumping properties.
    /// </summary>
    public static void CopyProperties(Window source, Window target)
    {
        if (source == null || target == null) return;

        var windowType = typeof(Window);
        foreach (var prop in windowType.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (prop.CanRead && prop.CanWrite && !ExcludedProps.Contains(prop.Name))
            {
                try
                {
                    var value = prop.GetValue(source);
                    var defaultValue = prop.PropertyType.IsValueType ? Activator.CreateInstance(prop.PropertyType) : null;

                    // Only copy if the value is different from the default (meaning it was set by the user)
                    if (!Equals(value, defaultValue))
                    {
                        prop.SetValue(target, value);
                    }
                }
                catch { }
            }
        }
    }
}
