import { useEffect, useState } from "react";

// ─── Static Data ────────────────────────────────────────────────────────────

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I connect my GitHub repository?",
        a: "Go to Repositories → Add Repository, paste your GitHub repo URL, and click Connect. CloudForge will automatically detect your project language and prepare the deployment pipeline.",
      },
      {
        q: "What languages and frameworks does CloudForge support?",
        a: "CloudForge supports Node.js, Python, React, Vue, Angular, Django, FastAPI, and more. Language detection is automatic based on your project files (package.json, requirements.txt, etc.).",
      },
      {
        q: "How long does a first deployment take?",
        a: "First deployments typically take 3–5 minutes as CloudForge builds your Docker image and provisions resources. Subsequent deployments are faster due to build caching.",
      },
    ],
  },
  {
    category: "Deployments",
    items: [
      {
        q: "How do I trigger a deployment?",
        a: "Go to Deployment → Deployments and click 'New Deployment'. Select your repository, target environment (dev/staging/production), and click Deploy. You can also enable auto-deploy on git push.",
      },
      {
        q: "How do I roll back a failed deployment?",
        a: "Go to Deployment → Rollbacks, find the version you want to restore, and click 'Rollback'. The previous stable version will be restored within seconds.",
      },
      {
        q: "Can I deploy to multiple environments?",
        a: "Yes. CloudForge supports dev, staging, and production environments. Go to Deployment → Environments to manage them.",
      },
    ],
  },
  {
    category: "CI/CD Pipelines",
    items: [
      {
        q: "How do I set up a CI/CD pipeline?",
        a: "CloudForge auto-generates a pipeline when you connect a repository. You can customize stages (build, test, deploy) in the Pipelines section.",
      },
      {
        q: "How do I view pipeline build logs?",
        a: "Go to Pipelines → Build History, click on any build, and view the full logs for each stage.",
      },
    ],
  },
  {
    category: "Account & Security",
    items: [
      {
        q: "How do I create an API token?",
        a: "Go to Settings → API, enter a token name (e.g. 'CI/CD Token'), and click Generate Token. Copy it immediately — it won't be shown again.",
      },
      {
        q: "How do I change my password?",
        a: "Go to Settings → Security, enter your current password and new password, then click Change Password.",
      },
      {
        q: "Is my data stored securely?",
        a: "Yes. All passwords are hashed with bcrypt. API routes are protected with JWT tokens. Your credentials are never stored in plain text.",
      },
    ],
  },
];

const QUICK_LINKS = [
  {
    icon: "📖",
    label: "API Documentation",
    desc: "Full REST API reference for all endpoints",
    href: "https://github.com/adabhade087/Cloud-Deployment-codebase/blob/main/backend/API.md",
  },
  {
    icon: "🐛",
    label: "Report a Bug",
    desc: "Open a GitHub issue for any problem",
    href: "https://github.com/adabhade087/Cloud-Deployment-codebase/issues/new",
  },
  {
    icon: "💻",
    label: "Source Code",
    desc: "View the full project on GitHub",
    href: "https://github.com/adabhade087/Cloud-Deployment-codebase",
  },
  {
    icon: "📋",
    label: "Changelog",
    desc: "See all recent updates and changes",
    href: "https://github.com/adabhade087/Cloud-Deployment-codebase/commits/main",
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = {
  card: {
    background: "#13131a",
    border: "1px solid #2a2a35",
    borderRadius: "12px",
    padding: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#f8fafc",
    marginBottom: "16px",
  },
  mutedText: { fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "40px",
    padding: "0 20px",
    background: "#6366f1",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    height: "40px",
    padding: "0 20px",
    background: "transparent",
    border: "1px solid #2a2a35",
    color: "#94a3b8",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "14px",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SystemStatus() {
  const [status, setStatus] = useState("checking"); // checking | online | offline
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("online");
          setInfo(data);
        } else {
          setStatus("offline");
        }
      })
      .catch(() => setStatus("offline"));
  }, []);

  const dot = {
    checking: { color: "#f59e0b", label: "Checking..." },
    online:   { color: "#22c55e", label: "All Systems Operational" },
    offline:  { color: "#ef4444", label: "Backend Offline" },
  }[status];

  return (
    <div style={{ ...s.card, marginBottom: "32px" }}>
      <h2 style={s.sectionTitle}>System Status</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: dot.color,
            boxShadow: `0 0 6px ${dot.color}`,
            display: "inline-block",
          }}
        />
        <span style={{ fontWeight: 600, fontSize: "14px", color: dot.color }}>
          {dot.label}
        </span>
      </div>

      {status === "online" && info && (
        <p style={{ ...s.mutedText, marginTop: "8px" }}>
          Backend last checked:{" "}
          <strong style={{ color: "#cbd5e1" }}>
            {new Date(info.timestamp).toLocaleTimeString()}
          </strong>
        </p>
      )}

      {status === "offline" && (
        <p style={{ ...s.mutedText, marginTop: "8px" }}>
          Could not reach the backend at{" "}
          <code style={{ color: "#f87171" }}>localhost:5000</code>. Make sure
          the backend is running:{" "}
          <code style={{ color: "#94a3b8" }}>cd backend &amp;&amp; npm start</code>
        </p>
      )}
    </div>
  );
}

function QuickLinks() {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={s.sectionTitle}>Quick Links</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
          gap: "12px",
        }}
      >
        {QUICK_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              background: "#13131a",
              border: "1px solid #2a2a35",
              borderRadius: "12px",
              padding: "18px",
              textDecoration: "none",
              transition: "border-color 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#2a2a35";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{link.icon}</div>
            <div style={{ fontWeight: 600, fontSize: "14px", color: "#f8fafc", marginBottom: "4px" }}>
              {link.label}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>{link.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function FaqAccordion({ search }) {
  const [openKey, setOpenKey] = useState(null);

  const filtered = FAQS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  const toggle = (key) => setOpenKey(openKey === key ? null : key);

  if (filtered.length === 0) {
    return (
      <div style={{ ...s.card, textAlign: "center", color: "#64748b" }}>
        No results found for &quot;{search}&quot;
      </div>
    );
  }

  return (
    <>
      {filtered.map((cat) => (
        <div key={cat.category} style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6366f1",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            {cat.category}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {cat.items.map((item, i) => {
              const key = `${cat.category}-${i}`;
              const isOpen = openKey === key;

              return (
                <div
                  key={key}
                  style={{
                    background: "#13131a",
                    border: `1px solid ${isOpen ? "#6366f1" : "#2a2a35"}`,
                    borderRadius: "10px",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#f8fafc", flex: 1 }}>
                      {item.q}
                    </span>
                    <span
                      style={{
                        color: "#6366f1",
                        fontSize: "20px",
                        fontWeight: 300,
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "14px 18px 16px",
                        fontSize: "13px",
                        color: "#94a3b8",
                        lineHeight: "1.7",
                        borderTop: "1px solid #2a2a35",
                      }}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Help() {
  const [search, setSearch] = useState("");

  return (
    <div style={{ padding: "32px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#f8fafc", margin: "0 0 8px 0" }}>
          Help &amp; Support
        </h1>
        <p style={{ ...s.mutedText, fontSize: "15px", margin: 0 }}>
          Find answers, documentation, and ways to get in touch with the team.
        </p>
      </div>

      {/* Live system status from backend */}
      <SystemStatus />

      {/* Quick links to GitHub */}
      <QuickLinks />

      {/* FAQ with search */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={s.sectionTitle}>Frequently Asked Questions</h2>
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            height: "44px",
            padding: "0 16px",
            background: "#13131a",
            border: "1px solid #2a2a35",
            borderRadius: "10px",
            color: "#f8fafc",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: "16px",
          }}
        />
        <FaqAccordion search={search} />
      </div>

      {/* Contact */}
      <div style={s.card}>
        <h2 style={s.sectionTitle}>Still need help?</h2>
        <p style={{ ...s.mutedText, marginBottom: "20px" }}>
          CloudForge is an internal developer platform. For bugs, feature requests,
          or questions, open a GitHub issue or reach out to the project maintainer directly.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href="https://github.com/adabhade087/Cloud-Deployment-codebase/issues/new"
            target="_blank"
            rel="noreferrer"
            style={s.btnPrimary}
          >
            🐛 Open an Issue
          </a>
          <a
            href="https://github.com/adabhade087"
            target="_blank"
            rel="noreferrer"
            style={s.btnOutline}
          >
            👤 GitHub Profile
          </a>
        </div>
      </div>
    </div>
  );
}
