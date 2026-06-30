import { StackPanel, TextBlock, Border, Window, Button, ScrollViewer } from 'avalonia-jsx';
import { createSignal, Show } from 'solid-js';

export default function App() {
  const [isClicked, setIsClicked] = createSignal(false);
  return (
    <Window Title="AvaloniaJS Modern Basic" Width={800} Height={600}>
      <style>{`
        .root {
          padding: 64;
        }
        
        .header {
          font-weight: bold;
          font-size: 40;
        }

        .subtitle {
          font-size: 16;
        }

        .btn {
          background: black;
          color: white;
          border-radius: 20;
          margin: 0 20;
          padding: 20 10;
          transition: transform 0.1s ease;
        }

        .btn:active {
          transform: scale(0.9);
        }
      `}</style>

      <ScrollViewer class="root">
        <StackPanel>
          <TextBlock class="header">AvaloniaJS</TextBlock>
          <TextBlock class="subtitle">Experience native desktop performance with React-like developer experience.</TextBlock>

          <StackPanel Orientation='Horizontal' Spacing={20}>
            <Button onClick={() => setIsClicked(true)} class='btn' Content="Click me!" HorizontalAlignment='Left' VerticalContentAlignment='Center' HorizontalContentAlignment='Center'></Button>
            <Show when={isClicked()}>
              <TextBlock VerticalAlignment='Center'>Button clicked!</TextBlock>
            </Show>
          </StackPanel>
        </StackPanel>
      </ScrollViewer>
    </Window>
  );
}
