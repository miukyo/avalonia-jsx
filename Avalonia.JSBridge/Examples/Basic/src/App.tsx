import { StackPanel, TextBlock, Border, Window, DockPanel, Button, AvaloniaRef, NativeWindow } from 'avalonia-jsx';

export default function App() {

  return (
    <Window
      Title="Avalonia"
      Width={600}
      Height={400}
    >
      <Border CornerRadius="0" Padding="0">

        <StackPanel Orientation="Vertical" Spacing={15} Margin="25">
          <TextBlock
            Text="Hello world!"
            FontSize={28}
            FontWeight="Bold"
            Foreground="#eceff4"
          />
        </StackPanel>

      </Border>
    </Window >
  );
}
