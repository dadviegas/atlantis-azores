import { useEffect, useRef, useState, type ReactElement } from "react";
import { Body, Subtitle } from "@atlantis/design-system/atlas";
import {
  Avatar,
  Badge,
  Icon,
  IconButton,
  Markdown,
  Surface,
} from "@atlantis/design-system";
import { mountButton } from "remote/Button";
import { areas, areaById, findSubtopic, groups, type Area } from "./content/areas";

type Theme = "light" | "dark";

const THEME_KEY = "atlas.theme";
const AREA_KEY = "atlas.area";
const SUBTOPIC_KEY = "atlas.subtopic";

const areaIcons: Record<string, ReactElement> = {
  javascript: Icon.js,
  typescript: Icon.ts,
  css: Icon.css,
  "module-federation": Icon.federation,
  "frontend-infrastructure": Icon.bolt,
};

const defaultArea = areas[0].id;
const defaultSubtopic = areas[0].subtopics[0].id;

export function Dashboard() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    return saved === "dark" || saved === "light" ? saved : "light";
  });
  const [areaId, setAreaId] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(AREA_KEY) : null;
    return saved && areaById.has(saved) ? saved : defaultArea;
  });
  const [subtopicId, setSubtopicId] = useState<string>(() => {
    const savedArea = typeof window !== "undefined" ? localStorage.getItem(AREA_KEY) : null;
    const savedSub = typeof window !== "undefined" ? localStorage.getItem(SUBTOPIC_KEY) : null;
    const area = savedArea && areaById.get(savedArea);
    if (area && savedSub && area.subtopics.some((s) => s.id === savedSub)) return savedSub;
    return defaultSubtopic;
  });

  useEffect(() => localStorage.setItem(THEME_KEY, theme), [theme]);
  useEffect(() => localStorage.setItem(AREA_KEY, areaId), [areaId]);
  useEffect(() => localStorage.setItem(SUBTOPIC_KEY, subtopicId), [subtopicId]);

  const area = areaById.get(areaId) ?? areas[0];
  const subtopic = findSubtopic(area.id, subtopicId) ?? area.subtopics[0];

  const selectArea = (next: string) => {
    setAreaId(next);
    const nextArea = areaById.get(next);
    if (nextArea) setSubtopicId(nextArea.subtopics[0].id);
  };

  return (
    <div
      className="atlas-root"
      data-palette="cove"
      data-theme={theme}
      data-density="comfy"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--ink)",
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        gridTemplateRows: "auto 1fr",
      }}
    >
      <aside
        style={{
          gridRow: "1 / span 2",
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px" }}>
          <div style={{ color: "var(--primary)" }}>{Icon.compass}</div>
          <strong style={{ fontSize: ".95em", letterSpacing: ".02em" }}>Atlas</strong>
          <Badge kind="info">notes</Badge>
        </div>

        {groups.map((group) => (
          <NavSection
            key={group.heading}
            heading={group.heading}
            areas={group.areas}
            currentArea={area.id}
            onSelect={selectArea}
          />
        ))}
      </aside>

      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <Subtitle style={{ margin: 0, color: "var(--ink)" }}>{area.label}</Subtitle>
        <span style={{ color: "var(--ink-3)", fontSize: ".9em" }}>/ {subtopic.label}</span>
        <div style={{ flex: 1 }} />
        <IconButton label="Notifications" icon={Icon.bell} />
        <IconButton
          label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          icon={theme === "light" ? Icon.moon : Icon.sun}
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        />
        <Avatar initials="DV" />
      </header>

      <main
        style={{
          padding: "24px 32px 48px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gap: 20,
          boxSizing: "border-box",
        }}
      >
        <SecondaryNav
          area={area}
          current={subtopic.id}
          onSelect={setSubtopicId}
        />
        <TopicView body={subtopic.body} />
        {area.id === "module-federation" && subtopic.id === "this-repo" && <FederatedDemo />}
      </main>
    </div>
  );
}

function NavSection({
  heading,
  areas,
  currentArea,
  onSelect,
}: {
  heading: string;
  areas: readonly Area[];
  currentArea: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div
        style={{
          fontSize: ".68em",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".1em",
          color: "var(--ink-3)",
          padding: "0 10px 6px",
        }}
      >
        {heading}
      </div>
      {areas.map((item) => {
        const active = item.id === currentArea;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: "var(--radius-sm)",
              background: active ? "var(--primary-soft)" : "transparent",
              color: active ? "var(--primary)" : "var(--ink-2)",
              border: "1px solid transparent",
              fontSize: ".88em",
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              textAlign: "left",
              transition: "background .12s, color .12s",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ display: "inline-flex", width: 16 }}>{areaIcons[item.id]}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function SecondaryNav({
  area,
  current,
  onSelect,
}: {
  area: Area;
  current: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      aria-label={`${area.label} subtopics`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "10px 12px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      {area.subtopics.map((s) => {
        const active = s.id === current;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            aria-current={active ? "page" : undefined}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid",
              borderColor: active ? "var(--primary)" : "var(--border)",
              background: active ? "var(--primary-soft)" : "transparent",
              color: active ? "var(--primary)" : "var(--ink-2)",
              fontSize: ".82em",
              fontWeight: active ? 600 : 500,
              cursor: "pointer",
              transition: "background .12s, color .12s, border-color .12s",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "var(--surface-2)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = "transparent";
            }}
          >
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}

function TopicView({ body }: { body: string }) {
  return (
    <Surface tone="base" padding={28}>
      <Markdown>{body}</Markdown>
    </Surface>
  );
}

function FederatedDemo() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) mountButton(ref.current, "Loaded from remote@:3001");
  }, []);

  return (
    <div
      style={{
        marginTop: 4,
        padding: 18,
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--surface-2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <Badge kind="accent">remote@:3001</Badge>
        <Body style={{ margin: 0, color: "var(--ink-2)", fontSize: ".88em" }}>
          The button below is fetched at runtime from the remote bundle.
        </Body>
      </div>
      <div ref={ref} />
    </div>
  );
}
