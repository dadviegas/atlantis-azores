import overview from "./index.md";
import basicTypes from "./basic-types.md";
import interfacesVsTypes from "./interfaces-vs-types.md";
import generics from "./generics.md";
import narrowing from "./narrowing.md";
import utilityTypes from "./utility-types.md";
import mappedTypes from "./mapped-types.md";
import conditionalTypes from "./conditional-types.md";
import templateLiteralTypes from "./template-literal-types.md";
import modulesAndDeclarations from "./modules-and-declarations.md";
import tsconfig from "./tsconfig.md";
import strictMode from "./strict-mode.md";
import inference from "./inference.md";
import decorators from "./decorators.md";
import typeLevelPatterns from "./type-level-patterns.md";
import pitfalls from "./pitfalls.md";

export const typescript = {
  id: "typescript",
  label: "TypeScript",
  subtopics: [
    { id: "overview", label: "Overview", body: overview },
    { id: "basic-types", label: "Basic types", body: basicTypes },
    { id: "interfaces-vs-types", label: "Interfaces vs types", body: interfacesVsTypes },
    { id: "generics", label: "Generics", body: generics },
    { id: "narrowing", label: "Narrowing", body: narrowing },
    { id: "utility-types", label: "Utility types", body: utilityTypes },
    { id: "mapped-types", label: "Mapped types", body: mappedTypes },
    { id: "conditional-types", label: "Conditional types", body: conditionalTypes },
    { id: "template-literal-types", label: "Template literal types", body: templateLiteralTypes },
    { id: "modules-and-declarations", label: "Modules & declarations", body: modulesAndDeclarations },
    { id: "tsconfig", label: "tsconfig", body: tsconfig },
    { id: "strict-mode", label: "Strict mode", body: strictMode },
    { id: "inference", label: "Inference", body: inference },
    { id: "decorators", label: "Decorators", body: decorators },
    { id: "type-level-patterns", label: "Type-level patterns", body: typeLevelPatterns },
    { id: "pitfalls", label: "Pitfalls", body: pitfalls },
  ],
} as const;
