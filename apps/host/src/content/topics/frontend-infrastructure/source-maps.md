A source map is a JSON file that maps positions in the generated bundle back to positions in the original source. Without it, a stack trace from production points at minified mush like `a.b.c is not a function at index-3a8f.js:1:34281`. With one, the browser DevTools and error-tracking services translate that into a real filename and line number. The cost is build time, disk space, and a small risk of leaking source if you serve maps publicly.

## Variants — what to use when

Webpack/Rspack accept a `devtool` string that picks among ~25 combinations. The meaningful ones:

| Value | Quality | Build speed | Use |
| --- | --- | --- | --- |
| `eval` | low (per module) | fastest | dev only |
| `eval-source-map` | high | slower dev | preferred dev |
| `eval-cheap-module-source-map` | mid | fast dev | balance for big projects |
| `source-map` | high, separate file | slow | prod |
| `hidden-source-map` | high, no `//# sourceMappingURL` comment | slow | prod with private maps |
| `nosources-source-map` | line numbers only, no source content | slow | prod when paranoid |
| `false` | none | fastest | never in prod for tracked apps |

Naming decoder:

- `eval` — sources wrapped in `eval()`, fastest to update on rebuild.
- `cheap` — line numbers only, no columns.
- `module` — maps to the original source before loaders, not the post-loader output.
- `inline` — embedded as a data URI instead of separate file.
- `hidden` — file emitted but not linked from the bundle.
- `nosources` — line/column mappings but original source content stripped.

Vite uses a simpler API: `build.sourcemap: true | 'inline' | 'hidden'`.

## Production stripping

The standard pattern:

1. Build with `hidden-source-map` so the `.js.map` files exist but aren't linked.
2. Upload the `.map` files to your error-tracking service (Sentry, Datadog, Rollbar).
3. Deploy only the `.js` files to the CDN — keep maps off the public origin.

```yaml
# .github/workflows/deploy.yml
- run: pnpm build
- name: Upload source maps to Sentry
  run: |
    sentry-cli sourcemaps upload \
      --release ${{ github.sha }} \
      --org my-org --project my-app \
      ./dist/assets
- name: Delete maps before deploy
  run: find ./dist -name '*.map' -delete
- name: Deploy
  run: aws s3 sync ./dist s3://my-cdn
```

This way Sentry can symbolicate stack traces using the SHA-tagged release, but no one browsing your site can pull down readable source.

## The Sentry upload pattern

The error-tracking service needs three things to symbolicate:

1. The map file.
2. The release identifier (typically a git SHA, baked into the bundle as a global).
3. The artifact URL the map was served from (so the SDK can match runtime errors to the right map).

```ts
// in app init
Sentry.init({
  dsn: '...',
  release: process.env.RELEASE_SHA,
});
```

Most CIs do this with a `sentry-cli` step or the official GitHub Action. Datadog and Rollbar have equivalents.

## Build perf cost

| devtool | Build time penalty (rough) |
| --- | --- |
| `false` | 0% |
| `eval` | +5% |
| `eval-cheap-module-source-map` | +20% |
| `eval-source-map` | +60% |
| `source-map` | +80-120% |
| `hidden-source-map` | same as `source-map` |

Source-map generation is expensive because it requires the transpiler/minifier to track every position transformation through every pass. For massive monorepos, this is often the single biggest line item in build time.

## Source maps and minifiers

Terser, SWC, and esbuild all generate maps that chain back through the bundler's input map. The bundler then composes these into a final map. If any tool in the chain emits a broken map, the chain breaks and traces point at wrong lines.

Symptoms of a broken chain:

- Stack frames point at whitespace or wrong file.
- "Source content not available" in DevTools.
- Sentry symbolication shows offset by 1-2 lines.

Common cause: a custom Babel plugin that mutates code without returning a map.

## Inline maps

`inline-source-map` embeds the map as a base64 data URI at the end of the bundle. Don't use it in production — it doubles the JS payload. Fine for some dev workflows where serving separate files is annoying.

## Source maps for CSS

Often forgotten — `css-loader` and `postcss-loader` have their own `sourceMap: true` option. Without it, CSS errors and rule positions in DevTools are useless.

```js
{
  test: /\.css$/,
  use: [
    'style-loader',
    { loader: 'css-loader', options: { sourceMap: true } },
    { loader: 'postcss-loader', options: { sourceMap: true } },
  ],
}
```

## Gotchas

- Shipping `.map` files in your public bundle is a code leak. Browsers and crawlers can pull them. Always strip or gate them.
- `nosources-source-map` is the privacy-conscious middle ground but breaks "view original source" in DevTools.
- If your bundle uses Module Federation, each remote needs its own maps uploaded under its own release ID.
- A new release without re-uploading maps means stack traces in Sentry stop symbolicating. Automate the upload.
- Sourcemap files referenced via absolute URLs in `//# sourceMappingURL=...` comments must actually exist at that URL during debugging — `hidden-source-map` avoids this entirely.
- `webpack-cli --devtool=false` overrides the config — beware command-line surprises.
- Watch builds use `eval`-based maps by default; switching to `source-map` in dev makes rebuilds painfully slow.
