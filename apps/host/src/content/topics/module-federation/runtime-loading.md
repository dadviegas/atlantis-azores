Behind every `import('remote/Button')` there is a small dance the bundler inserts: load a script, register a container, initialize a share scope, ask the container for a factory, call the factory to get the module. Knowing that dance helps you diagnose every "why isn't my remote loading" question.

## The remoteEntry script

Each remote build emits a `remoteEntry.js`. It is small (containers don't ship application code — only the metadata to load it on demand). Loading it has one side effect: it assigns a *container* object to `window[name]`, where `name` is the `name` you set in `ModuleFederationPlugin`.

```js
// roughly what the generated remoteEntry.js does
window['remote'] = {
  init(shareScope) { /* register shared deps into the scope */ },
  get(request) {
    if (request === './Button') {
      return () => __webpack_require__('./src/Button.tsx');
    }
  },
};
```

The modern runtime (under `@module-federation/enhanced`) wraps this with a proper ESM module record and adds lifecycle hooks, but the contract is the same.

## init and get

Two methods, in this order:

1. `container.init(shareScope)` — the host passes its share scope to the remote. The remote registers its shared deps' versions into the scope. After this point, both sides know what versions are available.
2. `container.get('./Button')` — returns a factory `() => Module`. Calling the factory loads and evaluates the actual exposed module (and any chunks it needs).

You can call these manually for dynamic remotes (see [dynamic-remotes](./dynamic-remotes.md)):

```ts
await __webpack_init_sharing__('default');
const container = window['remote'];
await container.init(__webpack_share_scopes__.default);
const factory = await container.get('./Button');
const { Button } = factory();
```

## Share-scope initialization

`__webpack_init_sharing__(scopeName)` populates `__webpack_share_scopes__[scopeName]` with the host's shared deps. It must be called *once*, before any container's `init`. The bundler does this automatically for the first federated import; the bootstrap pattern (`import('./bootstrap')`) exists to ensure the host's own shared deps load before any remote's.

The share scope is a flat object keyed by package name; each entry is keyed by version. Multiple containers add their versions; readers pick the highest compatible one. Singletons resolve to a single version regardless.

## The bootstrap pattern, explained

```ts
// src/index.ts
import('./bootstrap');

// src/bootstrap.ts
import App from './App';
import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')!).render(<App />);
```

What `index.ts` runs is a synchronous import of a dynamic chunk. The bundler treats that chunk as async, which gives the runtime room to:

1. Resolve which version of `react` the host provides.
2. Register it into the share scope.
3. *Then* evaluate `bootstrap.ts`, which can safely share React with any remote loaded inside it.

Skip this and you get either errors at build (synchronous federated import) or silently duplicated React at runtime.

## Async chunk loading

A federated import is a chunk load. The runtime emits `<script>` tags (or `import()` for native ESM mode) for:

- The remote's `remoteEntry.js` (once per remote, cached).
- Each chunk the exposed module depends on (vendor splits, etc.).
- Each shared dep that wasn't already loaded for the host.

Webpack/Rspack handle dedup: if `react.chunk.js` is already in flight, a second request waits on the first. The result is one network request per unique chunk per session.

## The modern runtime (`@module-federation/enhanced`)

The enhanced runtime adds:

- A plugin system with lifecycle hooks (`beforeRequest`, `errorLoadRemote`, `init`, etc.).
- A manifest format richer than raw `remoteEntry.js` — includes shared dep metadata, expose list, type tarball URL.
- First-class dynamic remotes via `registerRemotes()`.
- ESM-native mode (`type: 'module'`) that avoids `window` globals entirely.

Hooks let you, for example, retry a failed remote load, swap a URL based on a feature flag, or pipe load timing to telemetry:

```ts
import { init } from '@module-federation/enhanced/runtime';

init({
  name: 'host',
  remotes: [{ name: 'remote', entry: 'http://localhost:3001/remoteEntry.js' }],
  plugins: [{
    name: 'telemetry',
    errorLoadRemote: ({ id, error }) => {
      reportError({ remote: id, message: String(error) });
    },
  }],
});
```

## Lifecycle timeline

| Step | Who triggers | What happens |
| --- | --- | --- |
| 1. Page loads | Browser | HTML parsed, host `<script>` runs |
| 2. Bootstrap | `import('./bootstrap')` | Host's shared deps loaded |
| 3. Share scope init | First federated import | `__webpack_init_sharing__('default')` |
| 4. remoteEntry fetch | First import of that remote | `<script src="...remoteEntry.js">` |
| 5. Container init | After remoteEntry loads | `container.init(scope)` |
| 6. Get factory | `container.get(name)` | Returns factory function |
| 7. Module load | Factory called | Exposed module + chunks loaded |
| 8. Module evaluated | Chunks resolved | `import()` resolves |

## Gotchas

- A failing remoteEntry fetch (network, 404, CORS) throws *inside the dynamic import* — wrap it in an error boundary or try/catch, not at app boot.
- The container is assigned to `window[name]` *synchronously when the script evaluates*. If the script is blocked (CSP, ad blocker), there is no container, and the next step throws `Cannot read properties of undefined`.
- Calling `init` twice on the same container is a no-op in modern runtime, an error in older versions.
- The share scope is per *window*. A different iframe is a different scope.
- Service workers can cache `remoteEntry.js` past its useful life. Either don't cache it or version the URL.
