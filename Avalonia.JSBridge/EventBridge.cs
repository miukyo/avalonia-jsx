using System;
using System.Reflection;
using Avalonia.Interactivity;
using Jint;
using Jint.Native.Object;

namespace Avalonia.JSBridge;

public static class EventBridge
{
    public static void AttachEvent(object instance, EventInfo eventInfo, ObjectInstance jsFunction, Engine engine)
    {
        var handlerType = eventInfo.EventHandlerType;
        if (handlerType == null) return;

        Delegate? d = null;
        if (handlerType == typeof(EventHandler))
        {
            d = new EventHandler((sender, e) =>
            {
                Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                {
                    try
                    {
                        engine.Invoke(jsFunction);
                        engine.Advanced.ProcessTasks();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"JS Error in event handler: {ex.Message}");
                    }
                });
            });
        }
        else if (handlerType == typeof(EventHandler<RoutedEventArgs>))
        {
            d = new EventHandler<RoutedEventArgs>((sender, e) =>
            {
                Avalonia.Threading.Dispatcher.UIThread.Post(() =>
                {
                    try
                    {
                        engine.Invoke(jsFunction);
                        engine.Advanced.ProcessTasks();
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[C#] JS Error in event handler: {ex.Message}");
                    }
                });
            });
        }

        if (d != null)
        {
            eventInfo.AddEventHandler(instance, d);
        }
    }
}
