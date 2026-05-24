Asset handling is everything between "I `import` this PNG/SVG/font/CSS file" and "the browser fetches the right bytes from the right URL". Bundlers treat assets as first-class modules — they can hash filenames for cache busting, inline small files as data URIs, generate multiple sizes, and emit `<link>` tags. Each asset type (images, fonts, SVG, CSS) has its own conventions.

## Webpack/Rspack asset modules

Since Webpack 5, you don't need `file-loader` / `url-loader` / `raw-loader` separately — they're built in as asset module types:

```js
module: {
  rules: [
    { test: /\.png$/, type: 'asset/resource' }, // emit as file
    { test: /\.svg$/, type: 'asset/inline' },   // data URI
    { test: /\.txt$/, type: 'asset/source' },   // raw string
    {
      test: /\.(jpg|jpeg)$/,
      type: 'asset', // auto: inline if < 8 KB, else resource
      parser: { dataUrlCondition: { maxSize: 4 * 1024 } },
    },
  ],
}
```

| Type | What you get when you import |
| --- | --- |
| `asset/resource` | URL string, file emitted with hash |
| `asset/inline` | base64 data URI string |
| `asset/source` | raw file contents as string |
| `asset` | auto-choose based on size threshold |

```ts
import logoUrl from './logo.png';     // '/assets/logo.3a8f.png'
import iconSvg from './icon.svg';     // 'data:image/svg+xml;base64,...'
import readme from './README.md';     // '# Hello\n...'
```

## Vite/Rollup assets

Vite uses URL imports automatically:

```ts
import logoUrl from './logo.png';       // hashed URL
import logoUrl from './logo.png?url';   // explicit
import logoRaw from './logo.svg?raw';   // raw string
import logoData from './logo.png?inline'; // data URI
```

The `public/` folder is the escape hatch — anything in `public/foo.png` is copied as-is to `/foo.png`, no processing, no hashing.

## Public path

The public path tells the bundler what URL prefix to use when generating asset URLs:

```js
output: {
  publicPath: '/static/', // assets resolve as /static/logo.3a8f.png
}
```

- `'/'` — assets at site root.
- `'auto'` — Webpack/Rspack infer from `document.currentScript`.
- Full URL — assets served from a CDN: `'https://cdn.example.com/v2/'`.
- For Module Federation remotes, `publicPath: 'auto'` is essential so they work when consumed under any host URL.

## SVG

Three common patterns:

```ts
// 1. as URL — use as <img src>
import logoUrl from './logo.svg';

// 2. as React component — SVGR transforms it
import Logo from './logo.svg?react';
<Logo width={24} />

// 3. as raw string — for icon sprites
import logoRaw from './logo.svg?raw';
```

For component imports you need `@svgr/webpack` (Webpack/Rspack) or `vite-plugin-svgr` (Vite). SVGR parses the SVG and emits a React component with controllable props.

## Fonts

```js
{ test: /\.(woff2?|ttf|otf)$/, type: 'asset/resource' }
```

Conventions:

- Prefer `woff2` — universal browser support since 2018, smallest size.
- Self-host instead of Google Fonts — avoids the third-party DNS+TLS round-trip and tracking concerns.
- `font-display: swap` in `@font-face` to render fallback while loading.
- Preload critical fonts in `index.html`: `<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>`.

## CSS strategies

| Strategy | What it is | Pros | Cons |
| --- | --- | --- | --- |
| Vanilla CSS | `.css` files imported into JS | simple, no runtime | global namespace |
| CSS Modules | `.module.css`, classnames hashed | scoped automatically | extra build setup, IDE quirks |
| CSS-in-JS (runtime) | Emotion, styled-components | dynamic styles, theming | runtime cost, SSR ceremony |
| CSS-in-JS (zero-runtime) | Vanilla Extract, Linaria, Panda | scoped + dynamic + no runtime | build complexity |
| Tailwind / Atomic | utility classes | tiny CSS, no naming | learning curve, markup verbosity |

### Vanilla CSS

```ts
import './app.css'; // global, side-effect import
```

### CSS Modules

```ts
import styles from './Button.module.css';
<button className={styles.primary} />
```

`styles.primary` resolves to something like `Button_primary__3a8f`. Bundler scopes the class names per file.

### CSS-in-JS

```ts
// Emotion
import { css } from '@emotion/react';
const button = css`color: red; padding: 8px;`;
<button css={button} />
```

Runtime libraries inject `<style>` tags into the DOM. SSR needs to extract critical CSS during render. Zero-runtime libraries (Vanilla Extract) statically extract styles at build time — no runtime cost but you lose some dynamism.

## Image optimization

Bundlers do not transcode images by default. For real optimization use:

- `vite-plugin-image-optimizer` / `imagemin-webpack-plugin` — minify on build.
- `@vercel/og` / `next/image` — runtime resize and `<picture>` generation.
- A dedicated image CDN: Cloudinary, imgix, Vercel Image Optimization, Cloudflare Images.

For modern formats:

```html
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="" />
</picture>
```

## Asset naming and hashing

```js
output: {
  filename: 'js/[name].[contenthash:8].js',
  assetModuleFilename: 'assets/[name].[hash:8][ext]',
}
```

`[contenthash]` changes only when the file's content changes — required for long-term CDN caching with `Cache-Control: immutable`.

## Gotchas

- Importing a CSS file into a "side-effect-free" package — tree-shaking drops it. Mark CSS files as side-effectful in `package.json`.
- `publicPath: '/'` breaks when you serve the app under a subpath (`/admin/`). Use `'auto'` or a build-time env var.
- Importing SVGs inconsistently across the codebase — pick one pattern (URL, component, or raw) and stick with it.
- CSS Modules + TypeScript needs `*.module.css.d.ts` files or `typed-css-modules` to compile.
- Inlining large fonts (>30 KB) as base64 in CSS blocks render — keep them as separate hashed files.
- Public folder assets bypass hashing, so they need their own cache strategy (short max-age or query-string busting).
