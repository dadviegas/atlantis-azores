In production, Module Federation moves part of your build pipeline into the browser. The `remoteEntry.js` you ship is loaded over HTTP at run time and executed in the user's session. That changes the answers to questions you'd already settled for a normal SPA: how do you cache it, where do you serve it from, what does Content-Security-Policy look like, how do you tell when it's slow.

## Caching `remoteEntry.js`

The single most important rule: never cache `remoteEntry.js` aggressively unless the URL is immutable.

| URL strategy | Cache-Control | Tradeoff |
| --- | --- | --- |
| `/remote/remoteEntry.js` (mutable) | `no-cache` or short TTL | Always-fresh, one extra request |
| `/remote/<sha>/remoteEntry.js` (immutable) | `public, max-age=31536000, immutable` | Best perf, requires manifest lookup |
| `/remote/latest/remoteEntry.js` + atomic swap | `no-cache` | Simple, costs a revalidation per session |

The chunks the remoteEntry references (`*.chunk.js`) are content-hashed and can be cached forever. The entry itself is the pointer that changes.

## CDN delivery

Serve remote bundles from a CDN, not from the remote's origin server. Reasons:

- Geographic distribution — users near a PoP get sub-100ms loads.
- Bandwidth — the origin is a deploy target, not a serving target.
- Compression — CDN does Brotli/Zstd at the edge.

Origin requirements:

- HTTPS.
- Correct CORS headers (`Access-Control-Allow-Origin: <host-origin>` or `*` for fully public remotes).
- `application/javascript` content-type (not `text/html` if your routing fell through).
- Long-cache for hashed chunks, short-cache for `remoteEntry.js`.

## Immutable URLs and atomic rollback

The strongest production pattern: every build of a remote publishes to a unique URL (`/remote/<sha>/remoteEntry.js`), and a small manifest maps "current" to the active SHA. Atomic rollback is one PUT to the manifest. Old versions stay reachable so users mid-session don't break.

```ts
// at host boot
const manifest = await fetch('/manifest.json').then(r => r.json());
registerRemotes(
  Object.entries(manifest).map(([name, info]) => ({
    name,
    entry: `https://cdn.example.com/${name}/${info.sha}/remoteEntry.js`,
  })),
);
```

The manifest itself gets a short cache (5–60s) so rollouts propagate quickly. Everything else is immutable and cached forever.

## Content-Security-Policy

Federated code loads `<script>` tags at runtime. CSP must allow them.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  connect-src 'self' https://cdn.example.com;
```

For dynamic remotes whose origins aren't fixed at deploy, you have two options:

- Whitelist a fixed set of origins where all plugins must live.
- Use a CSP `nonce` and dynamically nonce each `<script>` you inject.

Strict-dynamic with nonces is the modern best practice but requires the federation runtime to apply the nonce to injected scripts. The enhanced runtime supports this via a plugin hook.

```ts
init({
  // ...
  plugins: [{
    name: 'csp-nonce',
    createScript: ({ url }) => {
      const s = document.createElement('script');
      s.src = url;
      s.nonce = window.__CSP_NONCE__;
      return s;
    },
  }],
});
```

## Observability

What to measure, beyond standard web vitals:

| Metric | Why |
| --- | --- |
| `remoteEntry` load time per remote | Spots slow CDNs, regional issues |
| Chunk load time per remote | Spots heavy remotes |
| Share scope negotiation warnings | Catches version drift in prod |
| `remote_load_failed` rate | Reliability SLI per remote |
| Time-to-mount for federated routes | UX impact of federation overhead |
| `remote_version` for each loaded remote | Cohort analysis, rollback verification |

Tag each event with the remote's SHA. Aggregate dashboards per remote per SHA. When error rate spikes on `v=abcd123`, you know what to roll back.

## Performance budgets

A federated host's TTI depends on the slowest remote on the critical path. Budgets per remote:

- `remoteEntry.js` ≤ 10 KB gzipped — it's metadata, not code.
- Critical-path remote total payload ≤ 50 KB gzipped (per remote).
- No remote should block the host's first paint — render the shell first, hydrate remotes async.

Enforce in CI: a remote's PR that bumps `remoteEntry.js` past the budget fails the check.

## Security implications

Loading a remote is loading JS into your origin's security context. The remote can:

- Read every cookie scoped to your origin.
- Make authenticated requests as the user.
- Modify the DOM, intercept input, exfiltrate data.

Consequences:

- Only federate code you trust. "Trusted third party" in MF means "as trusted as your own code."
- For untrusted plugin marketplaces, sandbox via iframe + postMessage instead, *not* federation.
- Pin SHAs in production. A live `/latest/` URL is a deploy-on-push that bypasses code review.
- Use Subresource Integrity (SRI) where feasible. Federation makes SRI awkward (the entry is generated per build) but you can hash it in CI and serve `integrity=` from the manifest.

## Failure radius

A remote that crashes on load takes down whatever depended on it. Design so that:

- The shell renders without any remotes available.
- Each remote is wrapped in an error boundary (see [error-boundaries](./error-boundaries.md)).
- Critical user flows (login, checkout) have local fallbacks for their federated dependencies, or don't federate at all.

## Deploy checklist

Before a federated app goes to prod, verify:

- [ ] `remoteEntry.js` cache headers correct
- [ ] Chunks have content hashes and long-cache headers
- [ ] CDN serves correct CORS and content-type
- [ ] CSP allows all remote origins (or nonces in place)
- [ ] Telemetry: load timing, errors, version per remote
- [ ] Kill switch wired (manifest flag or feature flag)
- [ ] Rollback rehearsed end-to-end
- [ ] Error boundary around every federated mount
- [ ] Bundle budgets enforced in CI

## Gotchas

- A misconfigured CDN returning HTML for missing files (200 OK with an error page) is the classic "remoteEntry undefined" puzzle.
- `Cache-Control: no-store` on `remoteEntry.js` is overkill and breaks bfcache. Prefer `no-cache` with proper validators.
- Service workers caching `remoteEntry.js` past its lifetime is a slow-leak production incident. Either don't cache it or skip-waiting on activation.
- A "successful" deploy that didn't update the manifest leaves users on the old version forever. Manifest update is the actual deploy.
- Cross-origin federation without `crossorigin="anonymous"` on injected scripts means errors from the remote come through to your error handler as opaque "Script error." Lose all useful stack info.
