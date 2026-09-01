/**
 * YouTube-style reference components (React, inline-styled).
 *
 * Why inline styles instead of Tailwind classes: many artifact/sandbox
 * environments render Tailwind WITHOUT a build step, so only pre-defined
 * core utility classes work — arbitrary-value classes like bg-[#0f0f0f]
 * are silently dropped. Since this design system depends on exact brand
 * hex values, build style objects from the `tokens` object below instead
 * of guessing at the closest Tailwind gray. Layout/spacing (flex, gap,
 * padding, rounded-full, etc.) can still use Tailwind core classes freely.
 *
 * Copy whichever components you need into the artifact and adapt content.
 */

const tokens = {
  bg: "#0f0f0f",
  surfaceRaised: "#272727",
  textPrimary: "#f1f1f1",
  textSecondary: "#aaaaaa",
  border: "#2d2d2d",
  accent: "#ff0000",
  accentHover: "#cc0000",
  chipBg: "#272727",
  chipBgActive: "#f1f1f1",
  chipTextActive: "#0f0f0f",
  font: "Roboto, 'Helvetica Neue', Arial, sans-serif",
  radiusLg: 12,
  headerH: 56,
  sidebarW: 240,
  sidebarWCollapsed: 72,
};

export function Header({ appName = "Streamly", onMenuClick, avatarInitial = "S" }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center justify-between z-50"
      style={{ height: tokens.headerH, background: tokens.bg, borderBottom: `1px solid ${tokens.border}`, padding: "0 16px", fontFamily: tokens.font }}
    >
      <div className="flex items-center gap-4" style={{ width: tokens.sidebarW }}>
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center rounded-full"
          style={{ width: 40, height: 40, color: tokens.textPrimary, background: "transparent" }}
        >
          ☰
        </button>
        <span style={{ color: tokens.textPrimary, fontWeight: 700, fontSize: 18 }}>
          <span style={{ color: tokens.accent }}>▶</span> {appName}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center" style={{ maxWidth: 640 }}>
        <input
          placeholder="Search"
          className="flex-1 rounded-l-full outline-none"
          style={{ height: 40, padding: "0 16px", background: tokens.bg, border: `1px solid ${tokens.border}`, color: tokens.textPrimary, fontSize: 14 }}
        />
        <button
          className="rounded-r-full flex items-center justify-center"
          style={{ width: 64, height: 40, background: tokens.surfaceRaised, borderLeft: `1px solid ${tokens.border}` }}
        >
          🔍
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, color: tokens.textPrimary }}>➕</button>
        <button className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, color: tokens.textPrimary }}>🔔</button>
        <div
          className="rounded-full flex items-center justify-center font-semibold"
          style={{ width: 32, height: 32, background: "linear-gradient(135deg,#ff5f6d,#845ec2)", color: "#fff", fontSize: 13 }}
        >
          {avatarInitial}
        </div>
      </div>
    </header>
  );
}

const NAV_SECTIONS = [
  { items: [["🏠", "Home"], ["🎬", "Shorts"], ["📺", "Subscriptions"]] },
  { title: "You", items: [["🕒", "History"], ["📁", "Playlists"]] },
  { title: "Explore", items: [["🔥", "Trending"], ["🎵", "Music"]] },
];

export function Sidebar({ collapsed = false, activeLabel = "Home" }) {
  const width = collapsed ? tokens.sidebarWCollapsed : tokens.sidebarW;
  return (
    <nav
      className="fixed left-0 bottom-0 overflow-y-auto transition-all"
      style={{ top: tokens.headerH, width, background: tokens.bg, padding: "12px 0", fontFamily: tokens.font }}
    >
      {NAV_SECTIONS.map((section, i) => (
        <div key={i}>
          {i > 0 && <div style={{ height: 1, background: tokens.border, margin: "12px 12px" }} />}
          {section.title && !collapsed && (
            <div style={{ fontSize: 12, fontWeight: 500, color: tokens.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", padding: "4px 24px" }}>
              {section.title}
            </div>
          )}
          {section.items.map(([icon, label]) => {
            const active = label === activeLabel;
            return (
              <div
                key={label}
                className="flex items-center rounded-lg mx-3"
                style={{
                  gap: collapsed ? 0 : 24,
                  height: 40,
                  padding: collapsed ? 0 : "0 24px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? tokens.surfaceRaised : "transparent",
                  color: tokens.textPrimary,
                  fontWeight: active ? 500 : 400,
                  fontSize: 14,
                }}
              >
                <span style={{ width: 24, textAlign: "center" }}>{icon}</span>
                {!collapsed && <span>{label}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function FilterChips({ chips = ["All", "Tutorials", "Cooking", "Design"], active = "All" }) {
  return (
    <div className="flex gap-3 overflow-x-auto" style={{ padding: "0 24px 16px", fontFamily: tokens.font }}>
      {chips.map((chip) => {
        const isActive = chip === active;
        return (
          <div
            key={chip}
            className="flex items-center rounded-full flex-shrink-0"
            style={{
              height: 32,
              padding: "0 16px",
              fontSize: 14,
              fontWeight: 500,
              background: isActive ? tokens.chipBgActive : tokens.chipBg,
              color: isActive ? tokens.chipTextActive : tokens.textPrimary,
            }}
          >
            {chip}
          </div>
        );
      })}
    </div>
  );
}

export function VideoCard({ title, owner, meta, duration = "4:12", color = "#3b6978" }) {
  return (
    <div style={{ cursor: "pointer", fontFamily: tokens.font }}>
      <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: tokens.radiusLg, overflow: "hidden", background: color }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: 0.6, fontSize: 28 }}>▶</div>
        <span
          style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.8)", color: "#fff", fontSize: 12, fontWeight: 500, padding: "1px 4px", borderRadius: 4 }}
        >
          {duration}
        </span>
      </div>
      <div className="flex gap-3" style={{ marginTop: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: tokens.textPrimary, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {title}
          </div>
          <div style={{ fontSize: 12, color: tokens.textSecondary, marginTop: 4 }}>{owner}</div>
          <div style={{ fontSize: 12, color: tokens.textSecondary }}>{meta}</div>
        </div>
      </div>
    </div>
  );
}

export function VideoGrid({ items }) {
  return (
    <div
      className="grid"
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px 12px", padding: "0 24px 40px" }}
    >
      {items.map((item, i) => (
        <VideoCard key={i} {...item} />
      ))}
    </div>
  );
}

/* Example composition:
 *
 * export default function App() {
 *   const [collapsed, setCollapsed] = React.useState(false);
 *   const items = [
 *     { title: "Building a design system from scratch", owner: "Streamly Studio", meta: "128K views · 2 days ago", color: "#4c5c68" },
 *     { title: "Weeknight pasta, four ways", owner: "Kitchen Diaries", meta: "54K views · 1 week ago", color: "#8a5a44" },
 *   ];
 *   return (
 *     <div style={{ background: tokens.bg, minHeight: "100vh" }}>
 *       <Header onMenuClick={() => setCollapsed(!collapsed)} />
 *       <Sidebar collapsed={collapsed} />
 *       <main style={{ marginLeft: collapsed ? tokens.sidebarWCollapsed : tokens.sidebarW, paddingTop: tokens.headerH + 16 }}>
 *         <FilterChips />
 *         <VideoGrid items={items} />
 *       </main>
 *     </div>
 *   );
 * }
 */
