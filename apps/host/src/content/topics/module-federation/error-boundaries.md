A federated remote is, from the host's perspective, a network dependency that runs as code. Both halves of that sentence are dangerous: network calls fail, and code crashes. A host without a story for either of those failure modes is one bad deploy away from a blank page. The fix is layered: detect failures, contain them, recover when possible, and have a manual kill switch when it isn't.

## Failure modes

| Mode | Symptom | Recovery |
| --- | --- | --- |
| Network: `remoteEntry.js` 404 / DNS / timeout | Dynamic import rejects | Retry, fall back, hide feature |
| Parse error in remoteEntry | Container undefined after script load | No retry — it'll fail again |
| Missing expose | `container.get(name)` returns nullish | Surface contract error |
| Module evaluation throws | Dynamic import rejects | Boundary catches, fallback UI |
| Shared dep mismatch | Hook errors, weird runtime crashes | Roll back the offending side |
| Render-time crash | React error during mount | React error boundary |

The first two happen during *load*. The last is a React render. They need different mechanisms.

## React error boundaries around mounts

A class component is still the only way to catch render errors below it. Wrap every federated mount in one:

```tsx
class RemoteBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode; onError?: (e: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { this.props.onError?.(error); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
```

```tsx
const RemoteButton = lazy(() => import('remote/Button'));

<RemoteBoundary fallback={<LocalButton />} onError={reportError}>
  <Suspense fallback={<Skeleton />}>
    <RemoteButton />
  </Suspense>
</RemoteBoundary>
```

The `Suspense` covers async load; the error boundary covers everything else.

## Catching load failures explicitly

`React.lazy` rethrows the import rejection into the closest error boundary. If you want different handling for "load failed" vs "render crashed," do the load yourself:

```ts
async function loadRemoteWithFallback() {
  try {
    return (await import('remote/Button')).Button;
  } catch (err) {
    reportError({ kind: 'remote-load', err });
    return LocalButton;
  }
}
```

This lets you swap to a local implementation transparently, without surfacing a failure state to the user.

## Retry strategy

Network failures are often transient. A single retry with backoff catches most:

```ts
async function loadWithRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= attempts; i++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (i < attempts) await new Promise(r => setTimeout(r, 300 * 2 ** i));
    }
  }
  throw lastErr;
}

const Button = lazy(() => loadWithRetry(() => import('remote/Button')));
```

Rules:

- Retry network errors, not parse/eval errors. Distinguish by error message or status.
- Cap at 2–3 retries. The user is waiting.
- Exponential backoff. Don't hammer a remote that's down.
- Add jitter if you're loading many remotes at once and a shared CDN burped.

## Fallback UIs

Three levels, choose by criticality:

| Criticality | Fallback |
| --- | --- |
| Decorative (banner, recommendation) | Hide silently |
| Optional feature (chat widget) | Skeleton or "unavailable" tile |
| Required (cart, login) | Local minimal implementation or full-page error |

A fallback that's worse than nothing (a broken-looking placeholder) is worse than nothing. If you can't render a coherent fallback, hide the slot.

## Kill switches

Sometimes you know a remote is bad and you need it *off* — across all users, immediately, without rebuilding the host. Two patterns:

### Manifest flag

The remotes manifest the host fetches at boot includes an `enabled` boolean per remote. Set it to false in the manifest, push the manifest, every new session skips that remote.

```ts
const manifest = await fetch('/manifest.json').then(r => r.json());
const live = manifest.filter(r => r.enabled);
registerRemotes(live);
```

### Feature flag at the import site

Each federated mount checks a flag:

```tsx
{flags.remoteButtonEnabled
  ? <Suspense fallback={null}><RemoteButton /></Suspense>
  : <LocalButton />}
```

Flag platform changes (LaunchDarkly, internal) propagate in seconds. Useful when the remote is *technically* loadable but produces bad behavior you can't roll back fast enough.

## Telemetry

You can't fix what you can't see. Emit at minimum:

- `remote_load_started` / `remote_load_succeeded` / `remote_load_failed` per remote per session, with timing.
- `remote_render_error` from boundaries, with the remote name, error message, stack.
- `remote_version_mismatch` from share-scope negotiation warnings.

Aggregate by remote, by version, by user agent. A regression usually shows up first as a spike in one of these on one remote.

## Gotchas

- Error boundaries don't catch async errors thrown *outside* render (event handlers, useEffect). Wrap those explicitly.
- A `lazy` import that's already failed once is a *resolved-with-error* promise. Calling it again won't retry. Re-create the `lazy` reference to retry — or use the `loadWithRetry` pattern above.
- A remote that fails to load doesn't fail-fast: it can hang on a slow `<script>` request until the browser gives up (tens of seconds). Race the load against a timeout.
- A flaky CDN returning HTML error pages with `200 OK` will *parse* as JS (or near-enough to throw a useful error), but the container will be undefined. Boundary should catch; telemetry should distinguish.
- Don't wrap an entire host in a single boundary. Wrap *each* remote, so one failure doesn't take down the page.
