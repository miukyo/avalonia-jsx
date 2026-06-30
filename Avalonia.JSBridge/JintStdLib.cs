using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Net.Http;
using System.Net.WebSockets;
using System.Threading;
using System.Collections.Generic;
using Jint;
using Jint.Native;

namespace Avalonia.JSBridge;

public static class JintStdLib
{
    private static readonly HttpClient _httpClient = new();

    public static void Register(Engine engine)
    {
        // 1. PATH module
        engine.SetValue("path", new PathModuleClass());

        // 2. OS module
        engine.SetValue("os", new OsModuleClass());

        // 3. FS module
        engine.SetValue("fs", new FsModuleClass());

        // 4. LocalStorage
        var storageFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "localStorage.json");
        var localStorage = new LocalStorage(storageFile);
        engine.SetValue("localStorage", localStorage);

        // 5. CHILD PROCESS
        engine.SetValue("child_process", new ChildProcessModuleClass(engine));
 
        // 6. HTTP (fetch) API
        engine.SetValue("fetch", new Func<string, JsValue, Task<JsValue>>(async (url, options) =>
        {
            var method = HttpMethod.Get;
            string? body = null;
            var headers = new Dictionary<string, string>();
 
            if (options != null && options.IsObject())
            {
                var optsObj = options.AsObject();
                if (optsObj.HasOwnProperty("method"))
                {
                    method = new HttpMethod(optsObj.Get("method").AsString());
                }
                if (optsObj.HasOwnProperty("body"))
                {
                    body = optsObj.Get("body").AsString();
                }
                if (optsObj.HasOwnProperty("headers"))
                {
                    var headersObj = optsObj.Get("headers").AsObject();
                    foreach (var key in headersObj.GetOwnProperties())
                    {
                        headers[key.Key.ToString()] = headersObj.Get(key.Key).AsString();
                    }
                }
            }
 
            var request = new HttpRequestMessage(method, url);
            foreach (var kvp in headers)
            {
                request.Headers.TryAddWithoutValidation(kvp.Key, kvp.Value);
            }
            if (body != null)
            {
                request.Content = new StringContent(body, Encoding.UTF8, "application/json");
            }
 
            var response = await _httpClient.SendAsync(request);
            var responseContent = await response.Content.ReadAsStringAsync();
 
            var responseJs = engine.Evaluate("new Object()").AsObject();
            responseJs.Set("status", response.StatusCode.GetHashCode());
            responseJs.Set("ok", response.IsSuccessStatusCode);
            responseJs.Set("text", JsValue.FromObject(engine, new Func<Task<string>>(() => {
                var t = Task.FromResult(responseContent);
                Avalonia.Threading.Dispatcher.UIThread.Post(() => engine.Advanced.ProcessTasks());
                return t;
            })));
            responseJs.Set("json", JsValue.FromObject(engine, new Func<Task<object>>(() =>
            {
                try
                {
                    var parsed = engine.Evaluate($"JSON.parse({SimpleJsonEscape(responseContent)})").ToObject();
                    var t = Task.FromResult(parsed ?? new object());
                    Avalonia.Threading.Dispatcher.UIThread.Post(() => engine.Advanced.ProcessTasks());
                    return t;
                }
                catch
                {
                    var t = Task.FromResult<object>(new object());
                    Avalonia.Threading.Dispatcher.UIThread.Post(() => engine.Advanced.ProcessTasks());
                    return t;
                }
            })));
 
            Avalonia.Threading.Dispatcher.UIThread.Post(() =>
            {
                engine.Advanced.ProcessTasks();
            });
 
            return responseJs;
        }));

        // 7. WEBSOCKET client helper
        // We inject a standard WebSocket class constructor into JS.
        engine.Execute(@"
            class WebSocket {
                constructor(url) {
                    this.url = url;
                    this.onopen = null;
                    this.onclose = null;
                    this.onmessage = null;
                    this.onerror = null;
                    
                    this._impl = __createWebSocketImpl(url, (event, data) => {
                        if (event === 'open' && this.onopen) this.onopen();
                        if (event === 'close' && this.onclose) this.onclose();
                        if (event === 'error' && this.onerror) this.onerror(data);
                        if (event === 'message' && this.onmessage) this.onmessage({ data: data });
                    });
                }
                send(data) {
                    this._impl.send(data);
                }
                close() {
                    this._impl.close();
                }
            }
            globalThis.WebSocket = WebSocket;
        ");

        engine.SetValue("__createWebSocketImpl", new Func<string, Action<string, string>, WebSocketImpl>((url, callback) =>
        {
            return new WebSocketImpl(url, callback, engine);
        }));
 
        // 8. SSE (EventSource) client helper
        engine.Execute(@"
            class EventSource {
                constructor(url) {
                    this.url = url;
                    this.onopen = null;
                    this.onmessage = null;
                    this.onerror = null;
 
                    this._impl = __createEventSourceImpl(url, (event, data) => {
                        if (event === 'open' && this.onopen) this.onopen();
                        if (event === 'error' && this.onerror) this.onerror(data);
                        if (event === 'message' && this.onmessage) this.onmessage({ data: data });
                    });
                }
                close() {
                    this._impl.close();
                }
            }
            globalThis.EventSource = EventSource;
        ");
 
        engine.SetValue("__createEventSourceImpl", new Func<string, Action<string, string>, EventSourceImpl>((url, callback) =>
        {
            return new EventSourceImpl(url, callback, engine);
        }));
    }

    private static string SimpleJsonEscape(string s)
    {
        var sb = new StringBuilder();
        sb.Append('"');
        foreach (char c in s)
        {
            switch (c)
            {
                case '\\': sb.Append("\\\\"); break;
                case '"': sb.Append("\\\""); break;
                case '\b': sb.Append("\\b"); break;
                case '\f': sb.Append("\\f"); break;
                case '\n': sb.Append("\\n"); break;
                case '\r': sb.Append("\\r"); break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (c < ' ')
                    {
                        sb.AppendFormat("\\u{0:x4}", (int)c);
                    }
                    else
                    {
                        sb.Append(c);
                    }
                    break;
            }
        }
        sb.Append('"');
        return sb.ToString();
    }
}

public class PathModuleClass
{
    public string join(params string[] paths) => Path.Combine(paths);
    public string resolve(params string[] paths) => Path.GetFullPath(Path.Combine(paths));
    public string basename(string path) => Path.GetFileName(path) ?? "";
    public string dirname(string path) => Path.GetDirectoryName(path) ?? "";
    public string extname(string path) => Path.GetExtension(path) ?? "";
}

public class OsModuleClass
{
    public string platform() => OperatingSystem.IsWindows() ? "win32" : (OperatingSystem.IsMacOS() ? "darwin" : "linux");
    public string arch() => System.Runtime.InteropServices.RuntimeInformation.ProcessArchitecture.ToString().ToLower();
    public string homedir() => Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
    public string tmpdir() => Path.GetTempPath();
}

public class FsModuleClass
{
    public object readFileSync(string path, string? encoding = "utf8")
    {
        if (encoding == "binary")
        {
            return File.ReadAllBytes(path);
        }
        return File.ReadAllText(path, Encoding.UTF8);
    }
    public void writeFileSync(string path, string data) => File.WriteAllText(path, data, Encoding.UTF8);
    public bool existsSync(string path) => File.Exists(path);
    public void mkdirSync(string path) => Directory.CreateDirectory(path);
    public string[] readdirSync(string path) => Directory.GetFileSystemEntries(path);
    public void rmdirSync(string path) => Directory.Delete(path, true);
    public void unlinkSync(string path) => File.Delete(path);
}

public class ChildProcessModuleClass
{
    private readonly Engine _engine;
    public ChildProcessModuleClass(Engine engine)
    {
        _engine = engine;
    }
 
    public string execSync(string command)
    {
        var psi = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "cmd.exe" : "/bin/sh",
            Arguments = OperatingSystem.IsWindows() ? $"/c {command}" : $"-c \"{command}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        using var proc = Process.Start(psi);
        if (proc == null) return "";
        proc.WaitForExit();
        return proc.StandardOutput.ReadToEnd() + proc.StandardError.ReadToEnd();
    }
 
    public void exec(string command, Action<string, string> callback)
    {
        Task.Run(() =>
        {
            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = OperatingSystem.IsWindows() ? "cmd.exe" : "/bin/sh",
                    Arguments = OperatingSystem.IsWindows() ? $"/c {command}" : $"-c \"{command}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };
                using var proc = Process.Start(psi);
                if (proc == null)
                {
                    Avalonia.Threading.Dispatcher.UIThread.Post(() => {
                        callback("Failed to start process", "");
                        _engine.Advanced.ProcessTasks();
                    });
                    return;
                }
                var output = proc.StandardOutput.ReadToEnd();
                var error = proc.StandardError.ReadToEnd();
                proc.WaitForExit();
                Avalonia.Threading.Dispatcher.UIThread.Post(() => {
                    callback(error, output);
                    _engine.Advanced.ProcessTasks();
                });
            }
            catch (Exception ex)
            {
                Avalonia.Threading.Dispatcher.UIThread.Post(() => {
                    callback(ex.Message, "");
                    _engine.Advanced.ProcessTasks();
                });
            }
        });
    }
}

public class LocalStorage
{
    private readonly string _filePath;
    private readonly Dictionary<string, string> _items = new();

    public LocalStorage(string filePath)
    {
        _filePath = filePath;
        Load();
    }

    public string? getItem(string key)
    {
        return _items.TryGetValue(key, out var val) ? val : null;
    }

    public void setItem(string key, string value)
    {
        _items[key] = value;
        Save();
    }

    public void removeItem(string key)
    {
        _items.Remove(key);
        Save();
    }

    public void clear()
    {
        _items.Clear();
        Save();
    }

    private void Load()
    {
        try
        {
            if (File.Exists(_filePath))
            {
                var json = File.ReadAllText(_filePath);
                var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                if (dict != null)
                {
                    foreach (var kvp in dict)
                    {
                        _items[kvp.Key] = kvp.Value;
                    }
                }
            }
        }
        catch { }
    }

    private void Save()
    {
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(_items);
            File.WriteAllText(_filePath, json);
        }
        catch { }
    }
}

public class WebSocketImpl
{
    private readonly ClientWebSocket _ws = new();
    private readonly CancellationTokenSource _cts = new();
    private readonly Action<string, string> _callback;
    private readonly Engine _engine;
 
    public WebSocketImpl(string url, Action<string, string> callback, Engine engine)
    {
        _callback = callback;
        _engine = engine;
        Task.Run(async () =>
        {
            try
            {
                await _ws.ConnectAsync(new Uri(url), _cts.Token);
                PostCallback("open", "");
                
                var buffer = new byte[4096];
                while (_ws.State == WebSocketState.Open && !_cts.Token.IsCancellationRequested)
                {
                    var result = await _ws.ReceiveAsync(new ArraySegment<byte>(buffer), _cts.Token);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await _ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, _cts.Token);
                        PostCallback("close", "");
                    }
                    else if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        PostCallback("message", msg);
                    }
                }
            }
            catch (Exception ex)
            {
                PostCallback("error", ex.Message);
                PostCallback("close", "");
            }
        });
    }
 
    private void PostCallback(string ev, string data)
    {
        Avalonia.Threading.Dispatcher.UIThread.Post(() =>
        {
            _callback(ev, data);
            _engine.Advanced.ProcessTasks();
        });
    }
 
    public void send(string data)
    {
        if (_ws.State == WebSocketState.Open)
        {
            var bytes = Encoding.UTF8.GetBytes(data);
            _ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None).Wait();
        }
    }
 
    public void close()
    {
        _cts.Cancel();
        if (_ws.State == WebSocketState.Open)
        {
            _ws.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None).Wait();
        }
    }
}
 
public class EventSourceImpl
{
    private readonly Action<string, string> _callback;
    private readonly Engine _engine;
    private readonly CancellationTokenSource _cts = new();
    private static readonly HttpClient _client = new();
 
    public EventSourceImpl(string url, Action<string, string> callback, Engine engine)
    {
        _callback = callback;
        _engine = engine;
        Task.Run(async () =>
        {
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("text/event-stream"));
                
                using var response = await _client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, _cts.Token);
                PostCallback("open", "");
 
                using var stream = await response.Content.ReadAsStreamAsync(_cts.Token);
                using var reader = new StreamReader(stream);
 
                while (!_cts.Token.IsCancellationRequested)
                {
                    var line = await reader.ReadLineAsync(_cts.Token);
                    if (line == null) break;
                    if (string.IsNullOrEmpty(line)) continue;
 
                    if (line.StartsWith("data:"))
                    {
                        var data = line.Substring(5).Trim();
                        PostCallback("message", data);
                    }
                }
            }
            catch (Exception ex)
            {
                PostCallback("error", ex.Message);
            }
        });
    }
 
    private void PostCallback(string ev, string data)
    {
        Avalonia.Threading.Dispatcher.UIThread.Post(() =>
        {
            _callback(ev, data);
            _engine.Advanced.ProcessTasks();
        });
    }
 
    public void close()
    {
        _cts.Cancel();
    }
}
