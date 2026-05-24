import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import {
  Button as LGButton,
  Body,
  H1,
  H2,
  Subtitle,
  Icon as LGIcon,
} from "@atlantis/design-system/atlas";
import {
  Avatar,
  Badge,
  Callout,
  Icon,
  IconButton,
  Markdown,
  Surface,
  TabGroup,
} from "@atlantis/design-system";
import { mountButton } from "remote/Button";
import clustersDoc from "./content/clusters.md";
import searchDoc from "./content/search.md";
import architectureDoc from "./content/architecture.md";
import mdInline from "./content/markdown/inline.md";
import mdHeadings from "./content/markdown/headings.md";
import mdLists from "./content/markdown/lists.md";
import mdTables from "./content/markdown/tables.md";
import mdCode from "./content/markdown/code.md";
import mdCallouts from "./content/markdown/callouts.md";
import mdKbd from "./content/markdown/kbd.md";
import mdMermaid from "./content/markdown/mermaid.md";
import mdInfographics from "./content/markdown/infographics.md";

type Theme = "light" | "dark";
type View =
  | "overview"
  | "database"
  | "search"
  | "triggers"
  | "charts"
  | "docs"
  | "markdown"
  | "architecture"
  | "settings";

type DocId = "clusters" | "search";
const docs: Record<DocId, string> = { clusters: clustersDoc, search: searchDoc };
const docTabs = [
  { id: "clusters" as const, label: "Clusters" },
  { id: "search" as const, label: "Atlas Search" },
];

type MdFeature =
  | "inline"
  | "headings"
  | "lists"
  | "tables"
  | "code"
  | "callouts"
  | "kbd"
  | "mermaid"
  | "infographics";
const mdSources: Record<MdFeature, string> = {
  inline: mdInline,
  headings: mdHeadings,
  lists: mdLists,
  tables: mdTables,
  code: mdCode,
  callouts: mdCallouts,
  kbd: mdKbd,
  mermaid: mdMermaid,
  infographics: mdInfographics,
};
const mdTabs = [
  { id: "inline" as const, label: "Inline" },
  { id: "headings" as const, label: "Headings" },
  { id: "lists" as const, label: "Lists" },
  { id: "tables" as const, label: "Tables" },
  { id: "code" as const, label: "Code" },
  { id: "callouts" as const, label: "Callouts" },
  { id: "kbd" as const, label: "Keyboard" },
  { id: "mermaid" as const, label: "Mermaid" },
  { id: "infographics" as const, label: "Infographics" },
];

const THEME_KEY = "atlas.theme";
const DOC_KEY = "atlas.doc";
const VIEW_KEY = "atlas.view";
const MD_KEY = "atlas.md";

type NavItem = { id: View; label: string; icon: ReactElement };
const navSections: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Data services",
    items: [
      { id: "overview", label: "Overview", icon: Icon.compass },
      { id: "database", label: "Database", icon: Icon.hash },
      { id: "search", label: "Search", icon: Icon.search },
      { id: "triggers", label: "Triggers", icon: Icon.bolt },
      { id: "charts", label: "Charts", icon: Icon.book },
    ],
  },
  {
    heading: "Developer",
    items: [
      { id: "docs", label: "Documentation", icon: Icon.book },
      { id: "markdown", label: "Markdown", icon: Icon.hash },
      { id: "architecture", label: "Architecture", icon: Icon.link },
    ],
  },
  {
    heading: "Project",
    items: [{ id: "settings", label: "Settings", icon: Icon.menu }],
  },
];

export function Dashboard() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    return saved === "dark" || saved === "light" ? saved : "light";
  });
  const [view, setView] = useState<View>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(VIEW_KEY) : null;
    return isView(saved) ? saved : "overview";
  });
  const [doc, setDoc] = useState<DocId>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(DOC_KEY) : null;
    return saved === "search" ? "search" : "clusters";
  });
  const [md, setMd] = useState<MdFeature>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(MD_KEY) : null;
    return isMdFeature(saved) ? saved : "inline";
  });

  useEffect(() => localStorage.setItem(THEME_KEY, theme), [theme]);
  useEffect(() => localStorage.setItem(VIEW_KEY, view), [view]);
  useEffect(() => localStorage.setItem(DOC_KEY, doc), [doc]);
  useEffect(() => localStorage.setItem(MD_KEY, md), [md]);

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
          <Badge kind="info">prod</Badge>
        </div>

        {navSections.map((section) => (
          <NavSection
            key={section.heading}
            heading={section.heading}
            items={section.items}
            current={view}
            onSelect={setView}
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
        <Subtitle style={{ margin: 0, color: "var(--ink)" }}>{titleFor(view)}</Subtitle>
        <Badge kind="neutral">v0.1.0</Badge>
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
          padding: "32px 32px 48px",
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gap: 20,
          boxSizing: "border-box",
        }}
      >
        {view === "overview" && <OverviewView />}
        {view === "docs" && <DocsView doc={doc} setDoc={setDoc} />}
        {view === "markdown" && <MarkdownSupportView md={md} setMd={setMd} />}
        {view === "architecture" && <ArchitectureView />}
        {view !== "overview" &&
          view !== "docs" &&
          view !== "markdown" &&
          view !== "architecture" && <PlaceholderView title={titleFor(view)} />}
      </main>
    </div>
  );
}

function isView(v: string | null): v is View {
  return (
    v === "overview" ||
    v === "database" ||
    v === "search" ||
    v === "triggers" ||
    v === "charts" ||
    v === "docs" ||
    v === "markdown" ||
    v === "architecture" ||
    v === "settings"
  );
}

function isMdFeature(v: string | null): v is MdFeature {
  return (
    v === "inline" ||
    v === "headings" ||
    v === "lists" ||
    v === "tables" ||
    v === "code" ||
    v === "callouts" ||
    v === "kbd" ||
    v === "mermaid" ||
    v === "infographics"
  );
}

function titleFor(view: View): string {
  switch (view) {
    case "overview": return "Atlas console";
    case "database": return "Database";
    case "search": return "Atlas Search";
    case "triggers": return "Triggers";
    case "charts": return "Charts";
    case "docs": return "Documentation";
    case "markdown": return "Markdown support";
    case "architecture": return "Architecture";
    case "settings": return "Settings";
  }
}

function NavSection({
  heading,
  items,
  current,
  onSelect,
}: {
  heading: string;
  items: NavItem[];
  current: View;
  onSelect: (v: View) => void;
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
      {items.map((item) => {
        const active = item.id === current;
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
            <span style={{ display: "inline-flex", width: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function OverviewView() {
  const federatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (federatedRef.current) {
      mountButton(federatedRef.current, "Open in Compass");
    }
  }, []);

  return (
    <>
      <div>
        <H1 style={{ margin: 0 }}>Primary cluster</H1>
        <Body style={{ marginTop: 6, color: "var(--ink-2)" }}>
          us-east-1 · M30 · 3 shards · last deploy 2h ago
        </Body>
      </div>

      <section
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}
      >
        <Stat label="Operations/sec" value="12.4k" trend="success" trendLabel="+4.2%" />
        <Stat label="Connections" value="312" trend="neutral" trendLabel="steady" />
        <Stat label="Replication lag" value="48ms" trend="warning" trendLabel="+12ms" />
      </section>

      <Callout kind="warning" title="Index suggestion">
        A query on <code>orders.userId</code> averaged 220ms over the last hour. Consider
        adding a compound index <code>{`{ userId: 1, createdAt: -1 }`}</code>.
      </Callout>

      <Surface tone="raised" padding={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <H2 style={{ margin: 0, flex: 1 }}>Quick actions</H2>
          <Badge kind="success">healthy</Badge>
        </div>
        <Body style={{ marginTop: 6, marginBottom: 16, color: "var(--ink-2)" }}>
          Manage your cluster using LeafyGreen actions below.
        </Body>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <LGButton variant="primary" leftGlyph={<LGIcon glyph="Connect" />}>
            Connect
          </LGButton>
          <LGButton variant="default" leftGlyph={<LGIcon glyph="Settings" />}>
            Configure
          </LGButton>
          <LGButton variant="default" leftGlyph={<LGIcon glyph="Visibility" />}>
            Browse data
          </LGButton>
          <LGButton variant="dangerOutline" leftGlyph={<LGIcon glyph="Warning" />}>
            Pause cluster
          </LGButton>
        </div>
      </Surface>

      <Surface tone="base" padding={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <H2 style={{ margin: 0, flex: 1 }}>Federated panel</H2>
          <Badge kind="accent">remote@:3001</Badge>
        </div>
        <Body style={{ color: "var(--ink-2)", marginBottom: 14 }}>
          The button below is exposed by <code>remote/Button</code> and loaded at runtime
          via Module Federation. React, ReactDOM, and the design system are MF singletons.
        </Body>
        <div ref={federatedRef} />
      </Surface>
    </>
  );
}

function DocsView({ doc, setDoc }: { doc: DocId; setDoc: (d: DocId) => void }) {
  return (
    <Surface tone="base" padding={20}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <H2 style={{ margin: 0 }}>Documentation</H2>
        <Badge kind="info">live markdown</Badge>
        <div style={{ flex: 1 }} />
        <TabGroup tabs={docTabs} value={doc} onChange={setDoc} />
      </div>
      <Markdown>{docs[doc]}</Markdown>
    </Surface>
  );
}

function MarkdownSupportView({
  md,
  setMd,
}: {
  md: MdFeature;
  setMd: (m: MdFeature) => void;
}) {
  return (
    <Surface tone="base" padding={20}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <H2 style={{ margin: 0 }}>Markdown support</H2>
        <Badge kind="info">{mdTabs.length} features</Badge>
        <div style={{ flex: 1 }} />
        <Badge kind="neutral">{`content/markdown/${md}.md`}</Badge>
      </div>
      <Body style={{ color: "var(--ink-2)", marginBottom: 14 }}>
        Each tab loads a separate <code>.md</code> file from
        <code> apps/host/src/content/markdown/</code>, bundled via rspack&apos;s
        <code> asset/source</code> rule, and rendered through the design system&apos;s
        <code> &lt;Markdown /&gt;</code> component.
      </Body>
      <div style={{ marginBottom: 14 }}>
        <TabGroup tabs={mdTabs} value={md} onChange={setMd} />
      </div>
      <Markdown>{mdSources[md]}</Markdown>
    </Surface>
  );
}

function ArchitectureView() {
  return (
    <Surface tone="base" padding={20}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <H2 style={{ margin: 0, flex: 1 }}>Architecture</H2>
        <Badge kind="accent">mermaid</Badge>
      </div>
      <Markdown>{architectureDoc}</Markdown>
    </Surface>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <Surface tone="base" padding={32}>
      <H2 style={{ margin: 0 }}>{title}</H2>
      <Body style={{ marginTop: 8, color: "var(--ink-2)" }}>
        This is a placeholder view to show the Atlas-style left navigation. Wire it up
        when you need it.
      </Body>
    </Surface>
  );
}

function Stat({
  label,
  value,
  trend,
  trendLabel,
}: {
  label: string;
  value: string;
  trend: "success" | "warning" | "neutral";
  trendLabel: string;
}): ReactNode {
  const trendKind = trend === "success" ? "success" : trend === "warning" ? "warning" : "neutral";
  return (
    <Surface tone="base" padding={18}>
      <Body style={{ color: "var(--ink-2)", fontSize: ".85em" }}>{label}</Body>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
        <H2 style={{ margin: 0 }}>{value}</H2>
        <Badge kind={trendKind}>{trendLabel}</Badge>
      </div>
    </Surface>
  );
}
