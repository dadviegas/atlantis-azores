import overview from "./index.md";
import bundlersLandscape from "./bundlers-landscape.md";
import webpackVsRspack from "./webpack-vs-rspack.md";
import vite from "./vite.md";
import transpilers from "./transpilers.md";
import loadersAndPlugins from "./loaders-and-plugins.md";
import codeSplitting from "./code-splitting.md";
import treeShaking from "./tree-shaking.md";
import sourceMaps from "./source-maps.md";
import assets from "./assets.md";
import devServerAndHmr from "./dev-server-and-hmr.md";
import buildPerformance from "./build-performance.md";
import monorepos from "./monorepos.md";
import packageManagers from "./package-managers.md";
import ciCd from "./ci-cd.md";
import bundleAnalysis from "./bundle-analysis.md";

export const frontendInfrastructure = {
  id: "frontend-infrastructure",
  label: "Frontend Infrastructure",
  subtopics: [
    { id: "overview", label: "Overview", body: overview },
    { id: "bundlers-landscape", label: "Bundlers landscape", body: bundlersLandscape },
    { id: "webpack-vs-rspack", label: "Webpack vs Rspack", body: webpackVsRspack },
    { id: "vite", label: "Vite", body: vite },
    { id: "transpilers", label: "Transpilers", body: transpilers },
    { id: "loaders-and-plugins", label: "Loaders & plugins", body: loadersAndPlugins },
    { id: "code-splitting", label: "Code splitting", body: codeSplitting },
    { id: "tree-shaking", label: "Tree shaking", body: treeShaking },
    { id: "source-maps", label: "Source maps", body: sourceMaps },
    { id: "assets", label: "Assets", body: assets },
    { id: "dev-server-and-hmr", label: "Dev server & HMR", body: devServerAndHmr },
    { id: "build-performance", label: "Build performance", body: buildPerformance },
    { id: "monorepos", label: "Monorepos", body: monorepos },
    { id: "package-managers", label: "Package managers", body: packageManagers },
    { id: "ci-cd", label: "CI/CD", body: ciCd },
    { id: "bundle-analysis", label: "Bundle analysis", body: bundleAnalysis },
  ],
} as const;
