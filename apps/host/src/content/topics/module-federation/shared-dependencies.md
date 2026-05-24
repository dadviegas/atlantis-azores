The `shared` config is where Module Federation earns its name — and where most production incidents come from. It tells the runtime "these libraries can be shared across containers; here are the rules for picking which copy wins." Get it right and every remote uses the same React. Get it wrong and you ship three React copies, see "Invalid hook call," or boot fail because two singletons disagree on version.

## The basic shape

```cjs
new ModuleFederationPlugin({
  name: 'host',
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  },
});
```

The shorthand `shared: ['react', 'react-dom']` works but doesn't let you set the flags that matter. Always use the object form for anything stateful.

## What each flag actually does

| Flag | Default | What it controls |
| --- | --- | --- |
| `singleton` | `false` | Force exactly one instance across all containers |
| `requiredVersion` | from package.json | Semver range this container needs |
| `version` | from package.json | What this container provides |
| `strictVersion` | `false` | Error (vs warn) if no compatible version is found |
| `eager` | `false` | Include in the initial chunk instead of an async one |
| `shareKey` | the package name | Lookup key in the share scope |
| `shareScope` | `'default'` | Which scope this lives in |
| `import` | the package name | Module to load if no version is shared (or `false` to disable fallback) |

### `singleton`

The runtime keeps a registry per package keyed by version. Without `singleton`, each container that needs an incompatible version gets its own copy. With `singleton: true`, the *highest compatible version* wins and everyone shares it, even if some containers' `requiredVersion` doesn't match (the runtime warns).

Required for: React, React-DOM, any library with internal mutable state (state stores, i18n instances, router history, theme contexts).

Not needed for: pure utility libraries (`lodash-es`, `date-fns`) where multiple copies are merely wasteful, not broken.

### `requiredVersion` and `strictVersion`

`requiredVersion` is the semver range. By default a singleton mismatch is a warning and the runtime proceeds with whatever is available. `strictVersion: true` turns the warning into an error and fails the load.

```cjs
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0', strictVersion: true },
}
```

Use `strictVersion` when "wrong React" is unrecoverable (it almost always is). Skip it when you're rolling a major and want a soft window during deploy.

### `eager`

Federated shared deps are loaded as async chunks by default — they have to be, so the share scope can negotiate first. `eager: true` includes the dep in the *main* chunk of whichever container declares it eager.

You want eager: false (the default) almost always. Use eager: true only on the *host* and only for the share scope's bootstrap dep when you can't add the async indirection (e.g. legacy entries).

### `import: false`

By default, if no shared version is available, the container falls back to loading its own copy. `import: false` disables that fallback — the load fails instead. Use it when you'd rather error than ship a duplicate.

## Singletons and React in practice

```cjs
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react/jsx-runtime': { singleton: true, requiredVersion: '^19.0.0' },
}
```

Without `react/jsx-runtime` shared, the automatic JSX transform pulls in a second tiny module per container that isn't the same instance as `react`. Symptoms are subtle (extra reconciler work) up to broken (hook errors).

## Share scopes

`shareScope: 'default'` is the only one most apps need. Multiple scopes are useful when you want isolation — e.g. plugin sandboxes that should not share state with the host. Each scope is its own registry.

```cjs
shared: {
  react: { singleton: true, shareScope: 'plugins' },
}
```

The host must also initialize the `plugins` scope (`__webpack_init_sharing__('plugins')`) before loading plugin remotes.

## Negotiation walkthrough

1. Host boots, registers its `react@19.0.2` in scope `default`.
2. Remote A loads, says "I need react ^19, I can provide 19.0.0." Scope already has 19.0.2 which satisfies ^19. A uses 19.0.2.
3. Remote B loads, says "I need react ^18." Singleton: warning fires; B uses 19.0.2 anyway. Without singleton: B loads its own 18.x, ships duplicate.

## Gotchas

- Two singletons of the *same* library with *incompatible* ranges: console warning, hard-to-debug bugs. Add `strictVersion: true` in pre-prod to surface these early.
- ESM vs CJS copies count as different modules even at the same version. Make sure all containers resolve the same flavor.
- `requiredVersion` defaults come from each container's `package.json` at *build time*. If a remote was built against React 18.2 and the host is on 19, the remote's `requiredVersion` is `^18.2` and the negotiation warns.
- Eager + singleton on a non-host container creates a hard dep on that container loading before any other. Almost never what you want.
- Shared CSS-in-JS libraries with module-level caches (Emotion, styled-components) absolutely need `singleton: true`, or you get duplicated styles and `:first-child` warnings.
