import { StackPanel, TextBlock, Border, Window, DockPanel, Button, AvaloniaRef, NativeWindow } from 'avalonia-jsx';

export default function App() {
  let windowRef: AvaloniaRef<NativeWindow>;

  return (
    <Window
      ref={(el) => windowRef = el}
      Title="Avalonia JS Custom Titlebar"
      Width={600}
      Height={400}
      Background='Transparent'
      ExtendClientAreaToDecorationsHint={true}
      WindowDecorations="BorderOnly"
      TransparencyLevelHint="Mica"
    >
      <Border CornerRadius="0" Padding="0">
        <StackPanel Orientation="Vertical">

          {/* Custom Draggable Title Bar */}
          <Border
            Height={35}
            Background="Transparent"
            {...{ "WindowDecorationProperties.ElementRole": "TitleBar" }}
          >
            <DockPanel LastChildFill={true} Height={35} >

              {/* Caption Buttons */}
              <StackPanel {...{ "DockPanel.Dock": "Right" }} Orientation="Horizontal" {...{ "WindowDecorationProperties.ElementRole": "DecorationsElement" }}>
                <Button
                  CornerRadius={0}
                  Content="–"
                  Width={45}
                  Height={35}
                  Background="Transparent"
                  BorderThickness={0}
                  Foreground="white"
                  HorizontalContentAlignment="Center"
                  VerticalContentAlignment="Center"
                  onClick={() => {
                    if (windowRef?.NativeControl) {
                      windowRef.NativeControl.WindowState = "Minimized"; // Minimized
                    }
                  }}
                />
                <Button
                  CornerRadius={0}
                  Content="▢"
                  Width={45}
                  Height={35}
                  Background="Transparent"
                  BorderThickness={0}
                  Foreground="white"
                  HorizontalContentAlignment="Center"
                  VerticalContentAlignment="Center"
                  {...{ "WindowDecorationProperties.ElementRole": "MaximizeButton" }}
                  onClick={() => {
                    if (windowRef?.NativeControl) {
                      const current = windowRef.NativeControl;
                      windowRef.NativeControl.WindowState = (current.WindowState === 0 as unknown as "Normal") ? "Maximized" : "Normal"; // Normal / Maximized
                    }
                  }}
                />
                <Button
                  CornerRadius={0}
                  Content="✕"
                  Width={45}
                  Height={35}
                  Background="Transparent"
                  BorderThickness={0}
                  Foreground="white"
                  HorizontalContentAlignment="Center"
                  VerticalContentAlignment="Center"
                  onClick={() => {
                    if (windowRef?.NativeControl) {
                      windowRef.NativeControl.Close();
                    }
                  }}
                />
              </StackPanel>

              {/* Title Text */}
              <TextBlock
                Text="Avalonia JS - Custom Titlebar"
                FontSize={12}
                Foreground="white"
                VerticalAlignment="Center"
                Margin="15,0"
              />

            </DockPanel>
          </Border>

          {/* Main Content Area */}
          <StackPanel Orientation="Vertical" Spacing={15} Margin="25">
            <StackPanel Orientation="Vertical" Spacing={4} HorizontalAlignment="Center" Margin="0,40,0,10">
              <TextBlock
                Text="Custom Titlebar Enabled"
                FontSize={28}
                FontWeight="Bold"
                Foreground="#eceff4"
              />
              <TextBlock
                Text="The top bar is draggable and behaves like a native window titlebar."
                FontSize={14}
                Foreground="#88c0d0"
                HorizontalAlignment="Center"
              />
            </StackPanel>
          </StackPanel>

        </StackPanel>
      </Border>
    </Window>
  );
}
