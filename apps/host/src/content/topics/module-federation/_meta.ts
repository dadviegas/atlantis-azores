import overview from "./index.md";
import why from "./why-module-federation.md";
import hostVsRemote from "./host-vs-remote.md";
import exposes from "./exposes.md";
import remotes from "./remotes.md";
import shared from "./shared-dependencies.md";
import versioning from "./versioning.md";
import typescriptTypes from "./typescript-types.md";
import runtimeLoading from "./runtime-loading.md";
import dynamicRemotes from "./dynamic-remotes.md";
import ssr from "./ssr.md";
import rspackVsWebpack from "./rspack-vs-webpack.md";
import errorBoundaries from "./error-boundaries.md";
import testing from "./testing.md";
import production from "./production-considerations.md";
import thisRepo from "./this-repo.md";

export const moduleFederation = {
  id: "module-federation",
  label: "Module Federation",
  subtopics: [
    { id: "overview", label: "Overview", body: overview },
    { id: "why", label: "Why Module Federation", body: why },
    { id: "host-vs-remote", label: "Host vs remote", body: hostVsRemote },
    { id: "exposes", label: "Exposes", body: exposes },
    { id: "remotes", label: "Remotes", body: remotes },
    { id: "shared", label: "Shared dependencies", body: shared },
    { id: "versioning", label: "Versioning", body: versioning },
    { id: "typescript-types", label: "TypeScript types", body: typescriptTypes },
    { id: "runtime-loading", label: "Runtime loading", body: runtimeLoading },
    { id: "dynamic-remotes", label: "Dynamic remotes", body: dynamicRemotes },
    { id: "ssr", label: "SSR", body: ssr },
    { id: "rspack-vs-webpack", label: "Rspack vs Webpack", body: rspackVsWebpack },
    { id: "error-boundaries", label: "Error boundaries", body: errorBoundaries },
    { id: "testing", label: "Testing", body: testing },
    { id: "production", label: "Production", body: production },
    { id: "this-repo", label: "This repo", body: thisRepo },
  ],
} as const;
