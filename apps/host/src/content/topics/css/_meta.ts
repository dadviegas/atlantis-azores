import overview from "./index.md";
import selectors from "./selectors-and-specificity.md";
import cascade from "./cascade-and-inheritance.md";
import boxModel from "./box-model.md";
import flexbox from "./flexbox.md";
import grid from "./grid.md";
import positioning from "./positioning.md";
import customProperties from "./custom-properties.md";
import responsive from "./responsive-design.md";
import containerQueries from "./container-queries.md";
import typography from "./typography.md";
import color from "./color.md";
import transitions from "./transitions-and-animations.md";
import logical from "./logical-properties.md";
import modernFeatures from "./modern-features.md";
import pitfalls from "./pitfalls.md";

export const css = {
  id: "css",
  label: "Styles & CSS",
  subtopics: [
    { id: "overview", label: "Overview", body: overview },
    { id: "selectors", label: "Selectors & specificity", body: selectors },
    { id: "cascade", label: "Cascade & inheritance", body: cascade },
    { id: "box-model", label: "Box model", body: boxModel },
    { id: "flexbox", label: "Flexbox", body: flexbox },
    { id: "grid", label: "Grid", body: grid },
    { id: "positioning", label: "Positioning", body: positioning },
    { id: "custom-properties", label: "Custom properties", body: customProperties },
    { id: "responsive", label: "Responsive design", body: responsive },
    { id: "container-queries", label: "Container queries", body: containerQueries },
    { id: "typography", label: "Typography", body: typography },
    { id: "color", label: "Color", body: color },
    { id: "transitions", label: "Transitions & animations", body: transitions },
    { id: "logical", label: "Logical properties", body: logical },
    { id: "modern-features", label: "Modern features", body: modernFeatures },
    { id: "pitfalls", label: "Pitfalls", body: pitfalls },
  ],
} as const;
