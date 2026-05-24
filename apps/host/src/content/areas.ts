import { javascript } from "./topics/javascript/_meta";
import { typescript } from "./topics/typescript/_meta";
import { css } from "./topics/css/_meta";
import { moduleFederation } from "./topics/module-federation/_meta";
import { frontendInfrastructure } from "./topics/frontend-infrastructure/_meta";

export type Subtopic = { id: string; label: string; body: string };
export type Area = { id: string; label: string; subtopics: readonly Subtopic[] };
export type AreaGroup = { heading: string; areas: readonly Area[] };

export const groups: readonly AreaGroup[] = [
  { heading: "Languages", areas: [javascript, typescript, css] },
  { heading: "Tooling", areas: [moduleFederation, frontendInfrastructure] },
];

export const areas: readonly Area[] = groups.flatMap((g) => g.areas);

export const areaById = new Map(areas.map((a) => [a.id, a]));

export function findSubtopic(areaId: string, subtopicId: string): Subtopic | undefined {
  return areaById.get(areaId)?.subtopics.find((s) => s.id === subtopicId);
}
