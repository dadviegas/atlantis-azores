A host consumes remotes by declaring them in its `remotes` config. Each entry tells the bundler "when you see `import('xyz/foo')`, treat `xyz` as a federated container and fetch its `remoteEntry.js` from this URL." The bundler doesn't fetch anything at build time — it inserts code that fetches at runtime.

## Declaring remotes

```cjs
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    remote: 'remote@http://localhost:3001/remoteEntry.js',
    checkout: 'checkout@https://cdn.example.com/checkout/remoteEntry.js',
  },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
});
```

The map key (`remote`) is the *local alias* used in imports. The string value is `<remoteName>@<url>` where `<remoteName>` must match the remote's own `name` field.

```ts
const { Button } = await import('remote/Button');
```

## The `remoteEntry.js` contract

A remote's `remoteEntry.js` is a tiny JS file (a few KB) that exposes a *container* object on `window` (or via an ESM export under the modern runtime). The container has two methods:

- `init(shareScope)` — give it the host's share scope so it can register its shared deps.
- `get(name)` — return a `() => Promise<Module>` factory for an exposed name like `./Button`.

The full lifecycle the bundler-generated code runs is:

1. Inject a `<script>` for `remoteEntry.js`.
2. Wait for the script to register the container under `window[name]`.
3. Initialize the host's share scope (`__webpack_init_sharing__('default')`).
4. Call `container.init(__webpack_share_scopes__.default)`.
5. Call `container.get('./Button')` to get a factory; call the factory to get the module.

In normal usage you never write this — the `import('remote/Button')` call is rewritten to do it for you.

## Scope syntax: `name@url`

| Form | Meaning |
| --- | --- |
| `name@http://host/remoteEntry.js` | Static URL, resolved at build time into the bundle |
| `name@[window.__REMOTE_URL__]` | Promise-based, evaluated at runtime |
| `promise new Promise(...)` | Fully dynamic, you write the loader |
| Plain object (runtime API) | `registerRemotes([{ name, entry }])` |

The static form is the simplest. The runtime forms are covered in [dynamic-remotes](./dynamic-remotes.md).

## Async vs eager consumption

By default, code that imports a remote must live in an async boundary. The bundler enforces this by erroring on synchronous imports of federated modules. The fix is the *bootstrap* pattern:

```ts
// src/index.ts
import('./bootstrap');

// src/bootstrap.ts
import { Button } from 'remote/Button'; // safe — already inside an async chunk
```

The reason: the host's entry must initialize the share scope before *any* federated module is loaded, including ones that share React. The async boundary lets the runtime do that step first.

`React.lazy` and dynamic `import()` are async by construction and skip the bootstrap dance:

```ts
const Button = lazy(() => import('remote/Button'));
```

This is the recommended consumption pattern in app code.

## Type safety at the import site

`import('remote/Button')` is opaque to TypeScript by default. You either declare an ambient module (`declare module 'remote/Button'`) or consume the generated `@mf-types` package from the enhanced plugin. See [typescript-types](./typescript-types.md).

## URL strategies

| Strategy | URL looks like | Update story |
| --- | --- | --- |
| Hard-coded | `remote@https://cdn/example/remoteEntry.js` | Rebuild host to point elsewhere |
| Per-env | Same with build var | One build per env |
| Latest pointer | `remote@https://cdn/example/latest/remoteEntry.js` | Atomic CDN swap |
| Versioned + lookup | URL fetched from a manifest at boot | Decouples deploy from rollout |

A common production pattern: build the host with a manifest URL, fetch the manifest at boot, register remotes from it. Rollouts then mean publishing a new manifest, not redeploying the host.

## Gotchas

- `name` mismatches are silent: `remote@…` will load, then `import('remote/Button')` will throw `Module not found` because `window.remote` isn't there — it's `window.someOtherName`.
- A 200 response with the wrong content-type (HTML error page) is the classic "remoteEntry returned JSON" puzzle. Validate the response, not just the status.
- Importing a remote at the top of your entry file without the bootstrap shim is the most common first-day error. The error message is unhelpful; remember the indirection pattern.
- Browsers cache `remoteEntry.js` aggressively. See [production-considerations](./production-considerations.md).
