CI for a frontend app does four things: install dependencies, run checks (lint, type-check, test), build production artifacts, and deploy. Each step has well-understood failure modes and well-understood caching strategies. The most common waste: re-installing `node_modules` from scratch on every job, rebuilding unchanged packages, and running every job serially when most could parallelize. A well-tuned pipeline for a small app finishes in 2-4 minutes; for a monorepo with remote cache, often under a minute on cache hits.

## The standard pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request:

jobs:
  install:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile

  checks:
    needs: install
    runs-on: ubuntu-latest
    strategy:
      matrix:
        task: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm ${{ matrix.task }}

  build:
    needs: checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/ }
```

Real pipelines compress this with reusable workflows or composite actions so install isn't duplicated.

## Caching: node_modules vs the pnpm store

Two things you can cache:

1. **The pnpm/yarn/npm store** (`~/.local/share/pnpm/store/v3`) — content-addressed packages. Survives across all repos. Always safe to cache.
2. **`node_modules`** — the resolved tree for *this* project. Only safe if the lockfile hash matches.

`actions/setup-node@v4` with `cache: pnpm` does the first automatically. It caches the store keyed on the lockfile hash, restores on the next run, then `pnpm install` is near-instant on cache hit.

For `node_modules` directly:

```yaml
- uses: actions/cache@v4
  with:
    path: '**/node_modules'
    key: ${{ runner.os }}-deps-${{ hashFiles('pnpm-lock.yaml') }}
```

This is more aggressive — skips `pnpm install` entirely on cache hit. The risk: if your `postinstall` scripts produce files outside `node_modules`, those don't restore. Most projects are fine; verify by deleting the cache and watching for runtime errors.

## Build cache

The bundler's filesystem cache (`node_modules/.cache/webpack`, `.next/cache`) cuts build times by 5-20x on warm runs:

```yaml
- uses: actions/cache@v4
  with:
    path: |
      node_modules/.cache
      .next/cache
    key: ${{ runner.os }}-build-${{ github.sha }}
    restore-keys: ${{ runner.os }}-build-
```

`restore-keys` is the trick — exact match on `github.sha` rarely hits, but `restore-keys` matches the most recent previous cache as a fallback.

## Turborepo / Nx remote cache

For monorepos this is the biggest CI win. Authenticate, link the project, and every cached task hit skips work entirely:

```yaml
- name: Build with Turborepo remote cache
  env:
    TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
    TURBO_TEAM: my-team
  run: pnpm turbo run build test lint
```

A PR that touches one package rebuilds only that package and its dependents. Everything else hits the cache.

## Build artifacts

CI produces a deployable artifact (a `dist/` folder, a Docker image, a static export). Upload it once, deploy from it:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist-${{ github.sha }}
    path: dist/
    retention-days: 7

# in the deploy job
- uses: actions/download-artifact@v4
  with: { name: dist-${{ github.sha }} }
```

This decouples build from deploy and lets you rerun deploys without rebuilding.

## Preview deploys

Every PR gets its own URL. Most platforms (Vercel, Netlify, Cloudflare Pages, AWS Amplify) do this natively — push a branch, get a URL. For self-hosted setups, the pattern:

```yaml
deploy-preview:
  if: github.event_name == 'pull_request'
  steps:
    - run: aws s3 sync ./dist s3://previews-bucket/${{ github.event.pull_request.number }}/
    - uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            body: `Preview: https://previews.example.com/${context.issue.number}/`
          });
```

Preview deploys catch issues that local dev hides (CDN behavior, env variables, real user CDN paths).

## Branch-per-PR strategies

| Strategy | Pros | Cons |
| --- | --- | --- |
| Long-lived feature branches | isolation | merge hell, drift |
| Trunk-based + short PRs | fast feedback, small diffs | needs strong CI |
| Stacked PRs (Graphite, ghstack) | parallel work | tooling required |

Trunk-based is the dominant pattern. CI runs on every PR; merge to main triggers deploy.

## Common bottlenecks

| Bottleneck | Fix |
| --- | --- |
| Reinstalling deps in every job | Cache the store; use job dependencies; or do one install + upload `node_modules` artifact |
| Running checks serially | Parallel matrix |
| Re-building everything on every PR | Turborepo/Nx remote cache |
| Type-check inside the bundler | Run `tsc --noEmit` as its own parallel job |
| Slow Docker base image | Multi-stage build, slim base, layer ordering |
| Big artifact uploads/downloads | Compress; only upload what's needed for deploy |
| Slow runners | Self-hosted runners or larger GitHub-hosted SKUs |

## Required vs optional checks

In GitHub branch protection, make these *required* before merge:

- Type-check
- Test
- Build
- Lint

Make these *informational* (don't block):

- Visual regression
- Bundle-size diff
- Performance budgets (until you've tuned them)

Required checks that flake or take 20 minutes get worked around. Keep them fast and stable.

## Bundle-size budgets in CI

```yaml
- name: Check bundle size
  uses: andresz1/size-limit-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
```

Or with `bundlewatch` / `bundlesize`. Configure thresholds per chunk:

```jsonc
// .size-limit.json
[
  { "path": "dist/assets/index-*.js", "limit": "150 KB" },
  { "path": "dist/assets/vendor-*.js", "limit": "120 KB" }
]
```

Fails the PR if a change pushes a bundle over the limit. See `bundle-analysis.md`.

## Gotchas

- `actions/checkout` defaults to a shallow clone — some tools (lerna, changesets, git blame in CI) need full history. Set `fetch-depth: 0`.
- Caches keyed on `github.sha` never hit. Use `hashFiles(...)` for content-addressed keys.
- Caches don't restore across forks for security. PR CI from forks runs cold.
- Concurrent runs of the same workflow on the same branch can race. Use `concurrency:` group with `cancel-in-progress: true`.
- Secrets aren't available in PR workflows from forks unless you explicitly opt in (`pull_request_target` — with care).
- Caching `node_modules` across major Node versions breaks native modules — include `${{ runner.os }}` and Node version in the cache key.
- Don't deploy from the build job — separate them so you can re-deploy a tagged artifact without rebuilding.
