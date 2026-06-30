using System;
using Avalonia;
using Avalonia.Animation;
using Avalonia.Animation.Easings;
using Avalonia.Controls;
using Avalonia.Controls.Primitives;
using Avalonia.Input;
using Avalonia.Interactivity;

namespace Avalonia.JSBridge;

public class SmoothScrollHelper
{
    private readonly ScrollViewer _scrollViewer;
    private double _targetOffsetY;
    private double _targetOffsetX;
    private DateTime _lastWheelTimeY = DateTime.MinValue;
    private DateTime _lastWheelTimeX = DateTime.MinValue;
    private bool _isInitialized;

    public SmoothScrollHelper(ScrollViewer scrollViewer)
    {
        _scrollViewer = scrollViewer;
    }

    public void Enable(bool vertical, bool horizontal)
    {
        if (!_isInitialized)
        {
            // Register a native VectorTransition for Offset property
            _scrollViewer.Transitions = new Transitions
            {
                new VectorTransition
                {
                    Property = ScrollViewer.OffsetProperty,
                    Duration = TimeSpan.FromMilliseconds(1400),
                    Easing = new ExponentialEaseOut()
                }
            };

            _targetOffsetY = _scrollViewer.Offset.Y;
            _targetOffsetX = _scrollViewer.Offset.X;
            _isInitialized = true;
        }

        _scrollViewer.RemoveHandler(InputElement.PointerWheelChangedEvent, OnPointerWheelChanged);
        _scrollViewer.AddHandler(InputElement.PointerWheelChangedEvent, OnPointerWheelChanged, RoutingStrategies.Tunnel | RoutingStrategies.Bubble);
    }

    public void Disable()
    {
        _scrollViewer.RemoveHandler(InputElement.PointerWheelChangedEvent, OnPointerWheelChanged);
        _scrollViewer.Transitions = null;
        _isInitialized = false;
    }

    private void OnPointerWheelChanged(object? sender, PointerWheelEventArgs e)
    {
        var delta = e.Delta;

        bool hasVert = Math.Abs(delta.Y) > 0.001;
        bool hasHoriz = Math.Abs(delta.X) > 0.001;

        if (!hasVert && !hasHoriz) return;

        // Support Shift + Scroll for horizontal scrolling
        if (e.KeyModifiers.HasFlag(KeyModifiers.Shift) && hasVert)
        {
            delta = new Vector(delta.Y, 0);
            hasVert = false;
            hasHoriz = true;
        }

        bool handled = false;
        const double baseStepSize = 50.0; // Base scroll speed

        if (hasVert && _scrollViewer.VerticalScrollBarVisibility != ScrollBarVisibility.Disabled)
        {
            var maxOffsetY = _scrollViewer.Extent.Height - _scrollViewer.Viewport.Height;
            if (maxOffsetY > 0)
            {
                var now = DateTime.UtcNow;
                var elapsedMs = (now - _lastWheelTimeY).TotalMilliseconds;

                // Align target if user hasn't scrolled with the wheel recently
                if (elapsedMs > 300)
                {
                    _targetOffsetY = _scrollViewer.Offset.Y;
                }

                // Calculate velocity multiplier: faster scrolling = larger steps
                double multiplier = 0.5;
                if (elapsedMs < 200)
                {
                    multiplier = 1.0 + Math.Max(0.0, 200.0 - elapsedMs) / 50.0;
                    multiplier = Math.Min(multiplier, 3.5); // Cap multiplier at 3.5x
                }

                _lastWheelTimeY = now;

                _targetOffsetY += -delta.Y * (baseStepSize * multiplier);
                _targetOffsetY = Math.Clamp(_targetOffsetY, 0, maxOffsetY);

                _scrollViewer.Offset = new Vector(_scrollViewer.Offset.X, _targetOffsetY);
                handled = true;
            }
        }

        if (hasHoriz && _scrollViewer.HorizontalScrollBarVisibility != ScrollBarVisibility.Disabled)
        {
            var maxOffsetX = _scrollViewer.Extent.Width - _scrollViewer.Viewport.Width;
            if (maxOffsetX > 0)
            {
                var now = DateTime.UtcNow;
                var elapsedMs = (now - _lastWheelTimeX).TotalMilliseconds;

                if (elapsedMs > 300)
                {
                    _targetOffsetX = _scrollViewer.Offset.X;
                }

                // Calculate velocity multiplier
                double multiplier = 1.0;
                if (elapsedMs < 200)
                {
                    multiplier = 1.0 + Math.Max(0.0, 200.0 - elapsedMs) / 50.0;
                    multiplier = Math.Min(multiplier, 3.5);
                }

                _lastWheelTimeX = now;

                _targetOffsetX += -delta.X * (baseStepSize * multiplier);
                _targetOffsetX = Math.Clamp(_targetOffsetX, 0, maxOffsetX);

                _scrollViewer.Offset = new Vector(_targetOffsetX, _scrollViewer.Offset.Y);
                handled = true;
            }
        }

        if (handled)
        {
            e.Handled = true;
        }
    }
}
