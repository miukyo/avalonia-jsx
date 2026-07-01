# Getting Started

## Prerequisites
- .NET 8 SDK or later
- Node.js (v18+)

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd avalonia-js
   ```

2. **Install Node Dependencies**:
   Navigate to the web project (or the Basic example) and install dependencies.
   ```bash
   cd Avalonia.JSBridge/Examples/Basic
   npm install
   ```

3. **Start the Frontend Dev Server**:
   Start Vite in watch mode to automatically rebuild the frontend when you make changes.
   ```bash
   npm run dev
   ```

4. **Run the Avalonia App**:
   In a new terminal, run the desktop application backend.
   ```bash
   dotnet run
   ```

## Creating your first UI

In the frontend code, edit `App.tsx` (or `App.jsx`).

```tsx
import { StackPanel, TextBlock, Window } from 'avalonia-jsx';

export default function App() {
  return (
    <Window Title="My First App" Width={400} Height={300}>
      <StackPanel>
        <TextBlock>Welcome to AvaloniaJS!</TextBlock>
      </StackPanel>
    </Window>
  );
}
```

The Avalonia app will hot-reload the UI automatically!
