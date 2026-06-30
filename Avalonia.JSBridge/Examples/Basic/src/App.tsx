import { StackPanel, TextBlock, Border, Window, Button, styled } from 'avalonia-jsx';

export default function App() {
  return (
    <Window Title="Avalonia" Width={800} Height={600}>
      <style>{`
        .container {
          spacing: 20;
          margin: 32;
        }
        .title {
          font-size: 32;
          font-weight: bold;
          color: white;
        }
        .subtitle {
          font-size: 16;
          color: rgba(255,255,255,0.8);
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
          border-radius: 12;
          padding: 12 24;
          font-size: 14;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .btn-primary:hover {
          background: #2563eb;
          transform: scale(1.05);
        }
        .btn-danger {
          background: linear-gradient(to right, #f093fb, #f5576c);
          color: white;
          border-radius: 8;
          padding: "12 24";
          font-size: 14;
          transition: transform 0.2s ease;
        }
        .btn-danger:hover {
          transform: scale(1.05);
        }
        .avatar {
          width: 64;
          height: 64;
          border-radius: 32;
          background: linear-gradient(135deg, #f093fb, #f5576c);
        }
        .hero {
          font-size: 28;
          font-weight: bold;
          color: white;
        }
      `}</style>

      <StackPanel class="container">
        <TextBlock class="hero">Hello from AvaloniaJS!</TextBlock>
        <TextBlock class="subtitle">Native desktop UI with CSS-like styling</TextBlock>

        <StackPanel Orientation="Horizontal" Spacing={12}>
          <Button class="btn-primary">Primary</Button>
          <Button class="btn-danger">Danger</Button>
        </StackPanel>

        <Border class="avatar" />
      </StackPanel>
    </Window>
  );
}
