Static remotes are configured at build time: `remote@http://localhost:3001/remoteEntry.js` is baked into the host bundle. Dynamic remotes are configured at *runtime*: the host doesn't know the URL (or even the name) when it builds. This is what enables plugin systems, per-environment URLs without rebuilding, A/B routing, and marketplaces where third parties ship JS.

## When you need dynamic remotes

- Plugin / extension systems (CMS blocks, design-tool plugins, IDE extensions).
- Per-tenant white-label apps where each tenant's modules live at a different URL.
- A/B testing different remote versions from the same host bundle.
- Marketplaces (third-party widgets, ad units, embeds).
- Migrating between CDN providers without rebuilding the host.

If the host owns the deploy of every remote and the URLs never change, static remotes are simpler. Don't go dynamic by default.

## The low-level API (Webpack/Rspack runtime globals)

Before the enhanced runtime, the canonical way looked like this:

```ts
async function loadRemote<T>(scope: string, url: string, module: string): Promise<T> {
  await __webpack_init_sharing__('default');

  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const container = (window as any)[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  return factory();
}

const { Button } = await loadRemote('remote', '/remoteEntry.js', './Button');
```

What's happening:

1. `__webpack_init_sharing__('default')` populates the host's share scope. Safe to call repeatedly.
2. Inject a `<script>` for the remote's entry. Wait for `onload`.
3. The remote registers itself on `window[scope]`. Read it.
4. Call `container.init` with the share scope so the remote can register its versions.
5. Call `container.get(name)` for a factory, then call it.

This works in pure Webpack and Rspack with no extra plugin, but you're writing plumbing.

## The modern API: `registerRemotes`

`@module-federation/enhanced/runtime` exposes a high-level API that wraps the dance:

```ts
import { init, loadRemote, registerRemotes } from '@module-federation/enhanced/runtime';

init({
  name: 'host',
  remotes: [], // can start empty
  shared: { react: { version: '19.0.0', shareConfig: { singleton: true } } },
});

registerRemotes([
  { name: 'remote', entry: 'http://localhost:3001/remoteEntry.js' },
]);

const { Button } = await loadRemote<{ Button: ComponentType }>('remote/Button');
```

You can call `registerRemotes` multiple times — registering a plugin discovered after boot is one line.

## Plugin discovery example

```ts
async function bootPlugins() {
  const manifest = await fetch('/api/plugins').then(r => r.json());
  // manifest = [{ name: 'plugin-foo', entry: 'https://.../foo/remoteEntry.js' }, ...]
  registerRemotes(manifest);
  for (const p of manifest) {
    const mod = await loadRemote<{ activate: () => void }>(`${p.name}/main`);
    mod.activate();
  }
}
```

The host doesn't need to be redeployed when a new plugin ships — it just needs to be in the manifest.

## Override scenarios

`registerRemotes` lets you *replace* an already-registered remote. The modern runtime supports a `force: true` flag to override; otherwise duplicate registrations no-op.

```ts
registerRemotes(
  [{ name: 'remote', entry: 'https://canary.cdn/remoteEntry.js' }],
  { force: true },
);
```

Useful for canary toggles, feature flags, and dev tooling that swaps a deployed remote for a local one.

## Static vs dynamic comparison

| Aspect | Static remote | Dynamic remote |
| --- | --- | --- |
| URL known at build | Yes | No |
| Configured in | `ModuleFederationPlugin.remotes` | `registerRemotes()` runtime call |
| Type generation | Works (via `@mf-types`) | Manual or skipped |
| Add a new remote | Rebuild host | One `registerRemotes` call |
| Override URL | Rebuild | `force: true` |
| Code size impact | None per remote | Slightly more runtime code |

## Patterns that combine both

A common production setup: the *core* remotes are static (header, footer, design system — always loaded). *Optional* remotes (plugins, A/B variants, tenant customizations) are dynamic. Static remotes get build-time type safety; dynamic ones use a base contract plus runtime validation.

## Gotchas

- The script injection approach doesn't handle Content-Security-Policy by default. You need `script-src` to allow the remote's origin or a per-request nonce.
- A failed script load leaves `window[scope]` undefined. Wrap the resolution in a timeout — `onerror` doesn't always fire for slow networks.
- Two dynamic registrations of the same scope without `force` silently keep the first. Debug "why isn't my new URL loading" starts here.
- Shared dep negotiation happens on the *first* `container.init`. A late-registered remote that needs a higher React version than what's already in the scope cannot upgrade it.
- Dynamic remotes break the build-time type story. Plan for runtime validation, especially across organizational boundaries.
- Don't allow user-controlled URLs into `registerRemotes`. It's `<script>` injection by another name.
