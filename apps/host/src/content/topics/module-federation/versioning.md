In a federated app, "version" means two different things and you need both: the version of an exposed module's *contract* (its props, exports, behavior) and the version of the *shared libraries* the remote was built against. The first determines whether your consumers break. The second determines whether your remote can run inside their host.

## Two version surfaces

| Surface | Lives in | Breaks when | Detected at |
| --- | --- | --- | --- |
| Exposed module contract | The remote's `exposes` map | Props/exports change | Type-check or runtime |
| Shared dep range | Remote's `shared.requiredVersion` | Host upgrades a major | Runtime (warn or error) |

A remote can be perfectly compatible on one surface and broken on the other. Plan for both.

## Semver for the exposed contract

Treat each exposed module like a published package:

- **Patch**: bug fix, no signature change. Safe to deploy.
- **Minor**: additive — new optional prop, new exported member. Safe.
- **Major**: required prop added, prop renamed, default behavior changed, export removed.

There is no `npm install` step that forces consumers to upgrade — they consume whatever URL the host points at. That means a major change is a coordinated event: ship both old and new for a window, then cut over.

## Rollout strategies

### Single URL, atomic swap

Simplest. `remote@/static/remote/remoteEntry.js` is overwritten on each deploy. Pro: trivial. Con: rollback is "re-deploy the old build," and during the swap some users get a mismatched mix. Use for low-stakes remotes.

### Versioned URLs + manifest

Each build publishes to `/static/remote/<sha>/remoteEntry.js`. A manifest (`/manifest.json`) maps logical names to current URLs. The host fetches the manifest at boot and registers remotes from it.

```ts
const manifest = await fetch('/manifest.json').then(r => r.json());
registerRemotes(
  Object.entries(manifest).map(([name, entry]) => ({ name, entry }))
);
```

Pro: instant rollback (revert the manifest), atomic per-remote, can route different versions per user. Con: one extra request, you own the manifest format.

### Canary / percentage rollouts

Manifest returns different URLs based on user bucket:

```ts
const variant = bucket(userId) < 5 ? 'next' : 'stable';
const url = manifest.remote[variant];
```

5% get `remote@next`, the rest stay on `remote@stable`. Both versions are deployed simultaneously. If error rate on `next` spikes, change the threshold to 0 and you're rolled back.

### Pinned versions

Host hard-codes `remote@.../v2.1.4/remoteEntry.js`. Useful when the host wants reproducibility (e.g. a long-lived release tag). The cost is that a remote bugfix doesn't reach pinned hosts until they redeploy.

## Breaking changes to exposed modules

Step-by-step for a non-trivial change:

1. Add the new shape alongside the old. Export `./ButtonV2` while `./Button` keeps working.
2. Update consumers one at a time to `./ButtonV2`.
3. When zero consumers use `./Button`, remove it. Bump the remote's major.

Or, for prop changes on a single export:

1. Add the new prop as optional with the old default.
2. Update consumers to pass the new prop.
3. Flip the default.
4. Remove the old prop in a major.

Telemetry helps here: log which props/keys are received so you actually know when usage drops to zero.

## Shared-dep versioning

The hard cases are major bumps of singletons (React 18 → 19, Redux 4 → 5). Strategy:

1. Coordinate a window where the host and *all* remotes upgrade together.
2. Set `strictVersion: false` during the window so the runtime tolerates skew.
3. Deploy host first with broad `requiredVersion: '>=18 <20'` if possible (React rarely allows this; some libs do).
4. Deploy remotes one by one.
5. Re-tighten `requiredVersion` and re-enable `strictVersion` after.

For React specifically, the window above doesn't really exist — React internals change. A React major across federated builds is a synchronized release, full stop. Plan for it.

## Compatibility table example

| Remote build | React version | Compatible hosts |
| --- | --- | --- |
| 2.4.x | ^18 | host >=4.0, <5 |
| 2.5.x | ^19 | host >=5.0 |
| 3.0.x | ^19 | host >=5.0, dropped IE11 polyfill |

Publish this for each remote. The team consuming it should not have to read your source to know if they can adopt your latest.

## Gotchas

- Renaming an expose without keeping the old key is a silent breaking change — the host gets `Module not found` at runtime, not at build.
- "We'll just deploy host and remote together" works until the user has the host already loaded in a tab and you deploy a remote update. Same-session version skew is real.
- Shared singletons negotiated in production with `strictVersion: false` will *silently* mismatch. Aggregate the runtime warnings to a logging endpoint so you actually see them.
- Pre-release tags in semver (`19.0.0-rc.1`) do not satisfy `^19.0.0`. If you use RCs across remotes, set `requiredVersion` accordingly or you'll get duplicates.
