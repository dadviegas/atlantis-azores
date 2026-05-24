import overview from "./index.md";
import variablesAndScope from "./variables-and-scope.md";
import typesAndCoercion from "./types-and-coercion.md";
import closures from "./closures.md";
import thisAndBinding from "./this-and-binding.md";
import prototypes from "./prototypes-and-inheritance.md";
import classes from "./classes.md";
import asyncDoc from "./async.md";
import eventLoop from "./event-loop.md";
import iterators from "./iterators-and-generators.md";
import modules from "./modules.md";
import errorHandling from "./error-handling.md";
import collections from "./collections.md";
import memoryAndGc from "./memory-and-gc.md";
import modernFeatures from "./modern-features.md";
import pitfalls from "./pitfalls.md";

export const javascript = {
  id: "javascript",
  label: "JavaScript",
  subtopics: [
    { id: "overview", label: "Overview", body: overview },
    { id: "variables-and-scope", label: "Variables & scope", body: variablesAndScope },
    { id: "types-and-coercion", label: "Types & coercion", body: typesAndCoercion },
    { id: "closures", label: "Closures", body: closures },
    { id: "this-and-binding", label: "this & binding", body: thisAndBinding },
    { id: "prototypes", label: "Prototypes", body: prototypes },
    { id: "classes", label: "Classes", body: classes },
    { id: "async", label: "Async", body: asyncDoc },
    { id: "event-loop", label: "Event loop", body: eventLoop },
    { id: "iterators", label: "Iterators & generators", body: iterators },
    { id: "modules", label: "Modules", body: modules },
    { id: "error-handling", label: "Error handling", body: errorHandling },
    { id: "collections", label: "Collections", body: collections },
    { id: "memory-and-gc", label: "Memory & GC", body: memoryAndGc },
    { id: "modern-features", label: "Modern features", body: modernFeatures },
    { id: "pitfalls", label: "Pitfalls", body: pitfalls },
  ],
} as const;
