import { javascript } from "./topics/javascript/_meta";
import { typescript } from "./topics/typescript/_meta";
import { css } from "./topics/css/_meta";
import { moduleFederation } from "./topics/module-federation/_meta";

export type Subtopic = { id: string; label: string; body: string };
export type Area = { id: string; label: string; subtopics: readonly Subtopic[] };

export const areas: readonly Area[] = [javascript, typescript, css, moduleFederation];

export const areaById = new Map(areas.map((a) => [a.id, a]));

export function findSubtopic(areaId: string, subtopicId: string): Subtopic | undefined {
  return areaById.get(areaId)?.subtopics.find((s) => s.id === subtopicId);
}
