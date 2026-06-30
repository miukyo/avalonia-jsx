interface FsModule {
  readFileSync(path: string, encoding?: string): string | Uint8Array;
  writeFileSync(path: string, data: string): void;
  existsSync(path: string): boolean;
  mkdirSync(path: string): void;
  readdirSync(path: string): string[];
  rmdirSync(path: string): void;
  unlinkSync(path: string): void;
}

interface PathModule {
  join(...paths: string[]): string;
  resolve(...paths: string[]): string;
  basename(path: string): string;
  dirname(path: string): string;
  extname(path: string): string;
}

interface OsModule {
  platform(): 'win32' | 'darwin' | 'linux';
  arch(): string;
  homedir(): string;
  tmpdir(): string;
}

interface ChildProcessModule {
  execSync(command: string): string;
  exec(command: string, callback: (error: string, stdout: string) => void): void;
}

interface LocalStorageModule {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

declare const fs: FsModule;
declare const path: PathModule;
declare const os: OsModule;
declare const child_process: ChildProcessModule;
declare const localStorage: LocalStorageModule;

// WebSocket and EventSource are globally defined, but TS already has built-in types for WebSocket.
// If needed, we can reference or extend them:
// declare class EventSource {
//   constructor(url: string);
//   onopen: (() => void) | null;
//   onmessage: ((event: { data: string }) => void) | null;
//   onerror: ((error: string) => void) | null;
//   close(): void;
// }
