A monolithic SPA works fine until multiple teams ship into it. Then the bottleneck stops being code and starts being coordination: shared release trains, merge queues, monorepo CI that runs everything when one team changes a button. Module Federation exists to break that coupling by letting separate teams build, version, and deploy their slice of the UI independently, while still presenting a single application to the user.

## The problem in concrete terms

- A checkout team and a search team both ship to `shop.example.com`.
- Today they share one Webpack build. Search's CI takes 11 minutes, checkout's takes 8, and a release is blocked on whichever is slowest plus whoever broke `main`.
- Each team wants its own pipeline, own on-call, own rollback button — without shipping the user a separate "search app" tab that loses cart state.

Module Federation gives each team a bundle that the shell loads at runtime, the same way native code loads a `.so`. The shell decides *which* version to load; the team decides what's in it.

## Alternatives and tradeoffs

| Approach | Independent deploys | Shared deps | Shared state | Cost |
| --- | --- | --- | --- | --- |
| Single bundle | No | Trivial | Trivial | Coordination |
| iframes | Yes | No (duplicated) | postMessage only | UX, perf, a11y |
| NPM packages | Sort of (consumer rebuilds) | Yes (at build) | Yes | Slow rollout |
| Server-side composition (ESI, Tailor) | Yes | Per fragment | Hard | Edge complexity |
| single-spa | Yes | Manual | Manual via window | More glue code |
| Module Federation | Yes | Yes (negotiated) | Yes (same realm) | Bundler-coupled |

### iframes

Hard isolation is the win and the loss. You get a separate JS realm, separate CSS, separate failures — and separate everything else: no shared React, awkward keyboard focus across frames, broken responsive layouts, two copies of every polyfill. Fine for a third-party widget; painful as the basis of a product.

### NPM packages

The "old way" for shared UI. Every consumer rebuilds when you publish, so a hotfix in a shared header means N PRs across N apps. Versions drift. Rollout latency is measured in days. Great for stable primitives (a design system), bad for fast-moving product surfaces.

### Server-side composition

Edge Side Includes, Tailor, Podium — stitch HTML fragments on the server. Independent deploys are real, but JS interactivity across fragments is awkward, you pay for an edge tier, and SPA-grade transitions usually require client glue anyway.

### single-spa

A runtime router that mounts independent SPAs into one shell. Predates MF. Solves orchestration but leaves bundling alone — every micro-app ships its own React unless you wire up `importmaps` or SystemJS by hand. MF often slots in *under* single-spa to handle the bundling half.

## Where MF earns its keep

- Multiple teams, one URL, divergent release cadences.
- A shared design system that you want to update in place without rebuilding consumers.
- Plugin systems where third parties ship JS into a host (CMS blocks, IDE extensions, ad-tech).
- A/B routing where the shell loads `checkout@v2` for 5% of users by changing one URL.

## Where it doesn't

- A single team, single repo, single deploy. Just code-split. MF adds complexity you don't need.
- Truly hostile third-party code — you want iframes (or a Worker) for the sandbox.
- Native mobile. RN has its own story; web MF doesn't transfer.

## Gotchas

- "Independent deploys" requires contract discipline. Without it you just moved the coordination problem from build-time merges to runtime breakage.
- Shared dependencies are negotiated at runtime — version skew shows up in production, not CI.
- You now own a runtime loader, a CDN, and a cache invalidation strategy. That's infrastructure, not just a build config.
