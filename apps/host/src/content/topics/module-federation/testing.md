Testing federated code has the same three layers as testing any other code (unit, integration, end-to-end), plus one new concern: the *contract* between host and remote. The contract isn't tested by either side's normal test suite — the host's tests usually mock the remote, the remote's tests usually mount in isolation. If both sides are green and the contract drifted, prod breaks. Contract tests close that gap.

## Unit tests in a remote

Treat the remote as a normal library. Test the exposed modules the way you'd test any component or function.

```ts
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

test('renders the label', () => {
  render(<Button label="Save" />);
  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
});
```

The remote's own tests don't go through federation — they `import` from local paths. That's fine; the federation layer is a deployment concern, not a logic concern.

## Unit tests in a host that imports remotes

Hosts import `'remote/Button'` which resolves at runtime. In a test environment (Jest, Vitest) that import has no resolver. You have two options:

### Mock the module path

```ts
// vitest.setup.ts
vi.mock('remote/Button', () => ({
  Button: (props: { label: string }) => <button>{props.label}</button>,
}));
```

```ts
// my-test.test.tsx
import { Button } from 'remote/Button';

test('host renders the federated button', () => {
  render(<Button label="ok" />);
  expect(screen.getByText('ok')).toBeInTheDocument();
});
```

Pro: fast, no network.
Con: the mock is what you *believe* the contract is. If you're wrong, the test passes and prod fails.

### Resolve to a local fake

Configure the test runner to alias `remote/*` to a local `__mocks__/remote/*` folder that re-exports the real shapes (ideally generated from the same source the remote ships):

```ts
// vitest.config.ts
resolve: {
  alias: {
    'remote/Button': '/test/mocks/remote/Button.tsx',
  },
},
```

Better than ad-hoc `vi.mock` because the fakes can be reused across tests and reviewed in isolation.

## Contract tests

The contract is: "for each `expose` in the remote, the host can import it and the types/behaviors match what the host expects." Test that explicitly.

### Generated-types check

If you use `@mf-types`, run a periodic CI job that:

1. Pulls the latest types from each remote.
2. Type-checks the host against them.
3. Fails the build (or opens a PR) if types regressed.

This catches "remote silently changed Button's required props" before deploy.

### Smoke test against a real remote

In a CI step, spin up the remote (or point at a staging URL) and run a tiny Playwright test that loads the host and asserts the federated component renders without errors.

```ts
test('federated button renders', async ({ page }) => {
  await page.goto(STAGING_HOST_URL);
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});
```

Fast, end-to-end, catches both contract drift and deploy regressions.

### Shape assertion

A middleware test: import each exposed module, assert the *shape* matches a JSON schema. Less work than full E2E, more coverage than mocking.

```ts
import * as ButtonMod from 'remote/Button';

test('Button module shape', () => {
  expect(ButtonMod).toEqual(
    expect.objectContaining({ Button: expect.any(Function) }),
  );
});
```

## Integration tests

Run host + remote together in a CI job. The cheapest version:

```bash
pnpm --filter remote build && pnpm --filter remote start &
REMOTE_PID=$!
pnpm --filter host build && pnpm --filter host start &
HOST_PID=$!
pnpm playwright test
kill $HOST_PID $REMOTE_PID
```

Then in tests, navigate to the host, click around, assert federated UI works. This catches integration bugs that pure unit tests miss (shared dep version mismatches, real network failures, real CSP violations).

## Mocking remotes in dev

When developing the host against a remote that's slow, broken, or under another team's control, alias the remote at dev-time to a local stub:

```cjs
// dev-only rspack config
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    remote: process.env.USE_REAL_REMOTE
      ? 'remote@http://localhost:3001/remoteEntry.js'
      : 'remote@/dev-stubs/remoteEntry.js',
  },
});
```

The stub `remoteEntry.js` is a tiny static file that exposes the same names. You unblock UI work while the real remote stabilizes.

## Tooling

| Layer | Tool | Notes |
| --- | --- | --- |
| Unit | Vitest / Jest | Mock or alias the remote path |
| Type contract | tsc + `@mf-types` | CI job, fail on regression |
| Shape contract | Vitest with module shape assertions | Cheap, catches obvious drift |
| Integration | Playwright | Boots both sides, hits real federation |
| Visual regression | Playwright + screenshots | Catches CSS drift across remotes |

## Gotchas

- `vi.mock('remote/Button')` in Vitest is hoisted — calling external functions inside the factory doesn't work the way you might expect. Use `vi.mock` with a string import path and a static factory.
- A test that asserts a federated component is *not* rendered (because the remote is intentionally off) needs to not actually attempt the import — gate it behind the same flag the host uses.
- E2E tests that rely on staging remotes are flaky when staging is flaky. Have a deterministic stub mode for PR CI; reserve real federation for nightly or merge-queue runs.
- Snapshot tests including federated UI snapshot the *mock*, not the real thing. Don't be lulled into a false sense of coverage.
- A contract test that asserts the entire shape of a remote will break on every additive change. Assert only the surface the host actually uses.
