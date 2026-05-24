import { useEffect, useRef, useState } from "react";
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
import markdownSupport from "./content/markdown-support.md";
import clustersDoc from "./content/clusters.md";
import searchDoc from "./content/search.md";

type DocId = "markdown" | "clusters" | "search";
const docs: Record<DocId, string> = {
  markdown: markdownSupport,
  clusters: clustersDoc,
  search: searchDoc,
};
const docTabs = [
  { id: "markdown" as const, label: "Markdown support" },
  { id: "clusters" as const, label: "Clusters" },
  { id: "search" as const, label: "Atlas Search" },
];

type Theme = "light" | "dark";
const THEME_KEY = "atlas.theme";

const DOC_KEY = "atlas.doc";

export function Dashboard() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    return saved === "dark" || saved === "light" ? saved : "light";
  });
  const [doc, setDoc] = useState<DocId>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(DOC_KEY) : null;
    return saved === "clusters" || saved === "search" ? saved : "markdown";
  });
  const federatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(DOC_KEY, doc);
  }, [doc]);

  useEffect(() => {
    if (federatedRef.current) {
      federatedRef.current.replaceChildren();
      mountButton(federatedRef.current, "Open in Compass");
    }
  }, []);

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
      }}
    >
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
        <div style={{ color: "var(--primary)" }}>{Icon.compass}</div>
        <Subtitle style={{ margin: 0, color: "var(--ink)" }}>Atlas console</Subtitle>
        <Badge kind="info">prod</Badge>
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
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gap: 20,
        }}
      >
        <div>
          <H1 style={{ margin: 0 }}>Primary cluster</H1>
          <Body style={{ marginTop: 6, color: "var(--ink-2)" }}>
            us-east-1 · M30 · 3 shards · last deploy 2h ago
          </Body>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            <H2 style={{ margin: 0 }}>Documentation</H2>
            <Badge kind="info">live markdown</Badge>
            <div style={{ flex: 1 }} />
            <TabGroup tabs={docTabs} value={doc} onChange={setDoc} />
          </div>
          <Markdown>{docs[doc]}</Markdown>
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
      </main>
    </div>
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
}) {
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
