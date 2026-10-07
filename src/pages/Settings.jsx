import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const sections = [
  {
    title: "Account",
    items: [
      { id: "profile", label: "Profile" },
      { id: "security", label: "Security" },
    ],
  },
  {
    title: "Workspace",
    items: [
      { id: "preferences", label: "Preferences" },
      { id: "notifications", label: "Notifications" },
    ],
  },
  {
    title: "Developer",
    items: [
      { id: "github", label: "GitHub" },
      { id: "api", label: "API" },
    ],
  },
  {
    title: "Account Management",
    items: [
      { id: "danger", label: "Danger Zone" },
    ],
  },
];

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");
  const [preferences, setPreferences] = useState({
  theme: "dark",
  language: "en",
  timezone: "Asia/Kolkata",
  default_landing_page: "dashboard",
});

const [preferencesLoading, setPreferencesLoading] = useState(false);
const [preferencesSaving, setPreferencesSaving] = useState(false);
const [preferencesMessage, setPreferencesMessage] = useState("");
const [notifications, setNotifications] = useState({
  deployment_notifications: true,
  pipeline_notifications: true,
  security_notifications: true,
  system_notifications: true,
  email_notifications: false,
});

const [notificationsLoading, setNotificationsLoading] = useState(false);
const [notificationsSaving, setNotificationsSaving] = useState(false);
const [notificationsMessage, setNotificationsMessage] = useState("");

  // GitHub state
  const [githubData, setGithubData] = useState({ connected: false, github: null });
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubMessage, setGithubMessage] = useState("");

  // API tokens state
  const [apiTokens, setApiTokens] = useState([]);
  const [apiTokensLoading, setApiTokensLoading] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [generatingToken, setGeneratingToken] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState(null);
  const [apiMessage, setApiMessage] = useState("");

  // Danger Zone state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [dangerMessage, setDangerMessage] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api.getProfile();

        setProfile({
          name: data.user.name,
          email: data.user.email,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);
  useEffect(() => {
  const loadPreferences = async () => {
    try {
      setPreferencesLoading(true);

      const data = await api.getPreferences();

      setPreferences({
        theme: data.preferences.theme,
        language: data.preferences.language,
        timezone: data.preferences.timezone,
        default_landing_page: data.preferences.default_landing_page,
      });
      if (data.preferences.theme === "light") {
  document.documentElement.classList.add("light");
} else {
  document.documentElement.classList.remove("light");
}
    } catch (err) {
      setPreferencesMessage(err.message);
    } finally {
      setPreferencesLoading(false);
    }
  };

  loadPreferences();
}, []);
useEffect(() => {
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const data = await api.getNotificationPreferences();

      setNotifications({
        deployment_notifications:
          Boolean(data.notifications.deployment_notifications),
        pipeline_notifications:
          Boolean(data.notifications.pipeline_notifications),
        security_notifications:
          Boolean(data.notifications.security_notifications),
        system_notifications:
          Boolean(data.notifications.system_notifications),
        email_notifications:
          Boolean(data.notifications.email_notifications),
      });
    } catch (err) {
      setNotificationsMessage(err.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  loadNotifications();
}, []);

  const loadGitHub = async () => {
    try {
      setGithubLoading(true);
      const data = await api.getGitHubConnection();
      setGithubData(data);
    } catch (err) {
      console.warn("GitHub load error:", err.message);
    } finally {
      setGithubLoading(false);
    }
  };

  const loadApiTokens = async () => {
    try {
      setApiTokensLoading(true);
      const data = await api.getApiTokens();
      setApiTokens(data.tokens || []);
    } catch (err) {
      console.warn("API tokens load error:", err.message);
    } finally {
      setApiTokensLoading(false);
    }
  };

  useEffect(() => {
    loadGitHub();
    loadApiTokens();
  }, []);

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    clearStatus();
    if (section === "github") loadGitHub();
    if (section === "api") loadApiTokens();
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    clearStatus();

    try {
      setSavingProfile(true);

      const data = await api.updateProfile(
        profile.name,
        profile.email,
      );

      setProfile({
        name: data.user.name,
        email: data.user.email,
      });

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    clearStatus();

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password.",
      );
      return;
    }

    try {
      setChangingPassword(true);

      const data = await api.changePassword(
        currentPassword,
        newPassword,
      );

      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const renderProfile = () => (
    <section className="settings-card">
      <div className="settings-card-header">
        <h2>Profile</h2>
        <p>Manage your personal account information.</p>
      </div>

      <form onSubmit={handleProfileUpdate}>
        <div className="settings-field">
          <label htmlFor="settings-name">Name</label>

          <input
            id="settings-name"
            type="text"
            value={profile.name}
            onChange={(e) =>
              setProfile({
                ...profile,
                name: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="settings-field">
          <label htmlFor="settings-email">Email</label>

          <input
            id="settings-email"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile({
                ...profile,
                email: e.target.value,
              })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="settings-button"
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );

  const renderSecurity = () => (
    <section className="settings-card">
      <div className="settings-card-header">
        <h2>Security</h2>
        <p>Update your password and protect your account.</p>
      </div>

      <form onSubmit={handleChangePassword}>
        <div className="settings-field">
          <label htmlFor="current-password">
            Current Password
          </label>

          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            required
          />
        </div>

        <div className="settings-field">
          <label htmlFor="new-password">
            New Password
          </label>

          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            minLength={8}
            required
          />

          <small>
            Password must contain at least 8 characters.
          </small>
        </div>

        <button
          type="submit"
          className="settings-button"
          disabled={changingPassword}
        >
          {changingPassword
            ? "Changing..."
            : "Change Password"}
        </button>
      </form>
    </section>
  );

  const renderComingSoon = (title, description) => (
    <section className="settings-card">
      <div className="settings-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="settings-placeholder">
        <span>Coming soon</span>
        <p>
          This section will be connected to the NexusCloud
          backend when its functionality is implemented.
        </p>
      </div>
    </section>
  );
  const renderPreferences = () => (
  <section className="settings-card">
    {preferencesLoading && (
  <p className="settings-message">
    Loading preferences...
  </p>
)}
    <div className="settings-card-header">
      <h2>Preferences</h2>
      <p>Customize your NexusCloud experience.</p>
    </div>

    <div className="settings-field">
      <label htmlFor="theme">Theme</label>

      <select
        id="theme"
        className="settings-select"
        value={preferences.theme}
        onChange={(e) =>
          setPreferences({
            ...preferences,
            theme: e.target.value,
          })
        }
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>

    <div className="settings-field">
      <label htmlFor="language">Language</label>

      <select
        id="language"
        className="settings-select"
        value={preferences.language}
        onChange={(e) =>
          setPreferences({
            ...preferences,
            language: e.target.value,
          })
        }
      >
        <option value="en">English</option>
      </select>
    </div>

    <div className="settings-field">
      <label htmlFor="timezone">Timezone</label>

      <select
        id="timezone"
        className="settings-select"
        value={preferences.timezone}
        onChange={(e) =>
          setPreferences({
            ...preferences,
            timezone: e.target.value,
          })
        }
      >
        <option value="Asia/Kolkata">
          India Standard Time (Asia/Kolkata)
        </option>
        <option value="UTC">UTC</option>
        <option value="Europe/London">
          Europe/London
        </option>
        <option value="America/New_York">
          America/New_York
        </option>
      </select>
    </div>

    <div className="settings-field">
      <label htmlFor="landing-page">
        Default Landing Page
      </label>

      <select
        id="landing-page"
        className="settings-select"
        value={preferences.default_landing_page}
        onChange={(e) =>
          setPreferences({
            ...preferences,
            default_landing_page: e.target.value,
          })
        }
      >
        <option value="dashboard">Dashboard</option>
        <option value="repositories">Repositories</option>
      </select>
    </div>

    {preferencesMessage && (
      <p className="settings-message">
        {preferencesMessage}
      </p>
    )}

    <button
  type="button"
  className="settings-button"
  disabled={preferencesSaving}
  onClick={async () => {
    try {
      setPreferencesSaving(true);
      setPreferencesMessage("");

      await api.updatePreferences({
  theme: preferences.theme,
  language: preferences.language,
  timezone: preferences.timezone,
  defaultLandingPage: preferences.default_landing_page,
});
if (preferences.theme === "light") {
  document.documentElement.classList.add("light");
} else {
  document.documentElement.classList.remove("light");
}

      setPreferencesMessage("Preferences saved successfully.");
    } catch (error) {
      setPreferencesMessage(
        error.message || "Failed to save preferences.",
      );
    } finally {
      setPreferencesSaving(false);
    }
  }}
>
  {preferencesSaving ? "Saving..." : "Save Preferences"}
</button>
  </section>
);
const renderNotifications = () => (
  <section className="settings-card">
    {notificationsLoading && (
      <p className="settings-message">
        Loading notification preferences...
      </p>
    )}

    <div className="settings-card-header">
      <h2>Notifications</h2>
      <p>Choose which notifications you want to receive.</p>
    </div>

    <div className="notification-settings">
      <div className="notification-item">
        <div className="notification-info">
          <span className="notification-title">
            Deployment notifications
          </span>
          <p className="notification-description">
            Get notified when deployments are completed or fail.
          </p>
        </div>

        <label className="notification-toggle">
          <input
            type="checkbox"
            checked={notifications.deployment_notifications}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                deployment_notifications: e.target.checked,
              })
            }
          />
          <span className="notification-slider"></span>
        </label>
      </div>

      <div className="notification-item">
        <div className="notification-info">
          <span className="notification-title">
            Pipeline notifications
          </span>
          <p className="notification-description">
            Get updates about pipeline runs and failures.
          </p>
        </div>

        <label className="notification-toggle">
          <input
            type="checkbox"
            checked={notifications.pipeline_notifications}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                pipeline_notifications: e.target.checked,
              })
            }
          />
          <span className="notification-slider"></span>
        </label>
      </div>

      <div className="notification-item">
        <div className="notification-info">
          <span className="notification-title">
            Security notifications
          </span>
          <p className="notification-description">
            Receive important security-related alerts.
          </p>
        </div>

        <label className="notification-toggle">
          <input
            type="checkbox"
            checked={notifications.security_notifications}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                security_notifications: e.target.checked,
              })
            }
          />
          <span className="notification-slider"></span>
        </label>
      </div>

      <div className="notification-item">
        <div className="notification-info">
          <span className="notification-title">
            System notifications
          </span>
          <p className="notification-description">
            Receive updates about NexusCloud system events.
          </p>
        </div>

        <label className="notification-toggle">
          <input
            type="checkbox"
            checked={notifications.system_notifications}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                system_notifications: e.target.checked,
              })
            }
          />
          <span className="notification-slider"></span>
        </label>
      </div>

      <div className="notification-item">
        <div className="notification-info">
          <span className="notification-title">
            Email notifications
          </span>
          <p className="notification-description">
            Receive selected NexusCloud notifications by email.
          </p>
        </div>

        <label className="notification-toggle">
          <input
            type="checkbox"
            checked={notifications.email_notifications}
            onChange={(e) =>
              setNotifications({
                ...notifications,
                email_notifications: e.target.checked,
              })
            }
          />
          <span className="notification-slider"></span>
        </label>
      </div>
    </div>

    {notificationsMessage && (
      <p className="settings-message">
        {notificationsMessage}
      </p>
    )}

    <button
      type="button"
      className="settings-button"
      disabled={notificationsSaving}
      onClick={async () => {
        try {
          setNotificationsSaving(true);
          setNotificationsMessage("");

          await api.updateNotificationPreferences({
            deploymentNotifications:
              notifications.deployment_notifications,
            pipelineNotifications:
              notifications.pipeline_notifications,
            securityNotifications:
              notifications.security_notifications,
            systemNotifications:
              notifications.system_notifications,
            emailNotifications:
              notifications.email_notifications,
          });

          setNotificationsMessage(
            "Notification preferences saved successfully.",
          );
        } catch (error) {
          setNotificationsMessage(
            error.message ||
              "Failed to save notification preferences.",
          );
        } finally {
          setNotificationsSaving(false);
        }
      }}
    >
      {notificationsSaving
        ? "Saving..."
        : "Save Notification Preferences"}
    </button>
  </section>
);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfile();

      case "security":
        return renderSecurity();

      case "preferences":
  return renderPreferences();

      case "notifications":
  return renderNotifications();

      case "github":
        return renderGitHub();

      case "api":
        return renderApi();

      case "danger":
        return renderDanger();

      default:
        return renderProfile();
    }
  };

  const renderGitHub = () => (
    <section className="settings-card">
      <div className="settings-card-header">
        <h2>GitHub</h2>
        <p>Connect your GitHub account to manage repositories and deployments.</p>
      </div>

      {githubMessage && <div className="settings-alert settings-success">{githubMessage}</div>}

      {githubData.connected ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#101017", padding: "16px", borderRadius: "10px", border: "1px solid #2a2a35" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: 600, fontSize: "16px", color: "#f8fafc" }}>
                  @{githubData.github?.github_username || "Connected"}
                </span>
                <span style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
                  Connected
                </span>
              </div>
              <small style={{ color: "#94a3b8", display: "block", marginTop: "4px" }}>
                Connected on {githubData.github?.connected_at ? new Date(githubData.github.connected_at).toLocaleDateString() : "Active"}
              </small>
            </div>
            <button
              type="button"
              className="settings-button"
              style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444" }}
              disabled={githubLoading}
              onClick={async () => {
                if (window.confirm("Are you sure you want to disconnect your GitHub account?")) {
                  try {
                    setGithubLoading(true);
                    await api.disconnectGitHub();
                    setGithubData({ connected: false, github: null });
                    setGithubMessage("GitHub account disconnected successfully.");
                  } catch (err) {
                    setGithubMessage(err.message || "Failed to disconnect.");
                  } finally {
                    setGithubLoading(false);
                  }
                }
              }}
            >
              {githubLoading ? "Disconnecting..." : "Disconnect"}
            </button>
          </div>
        </div>
      ) : (
        <div className="settings-placeholder">
          <p>Connect your GitHub account to import repositories and enable automated CI/CD deployments.</p>
          <button
            type="button"
            className="settings-button"
            disabled={githubLoading}
            onClick={async () => {
              try {
                const authData = localStorage.getItem("nexuscloud_auth");
                const token = authData ? JSON.parse(authData).token : null;
                const response = await fetch("http://localhost:5000/api/users/github/connect", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                window.location.href = data.url;
              } catch (error) {
                alert(error.message);
              }
            }}
          >
            Connect GitHub
          </button>
        </div>
      )}
    </section>
  );

  const renderApi = () => (
    <section className="settings-card">
      <div className="settings-card-header">
        <h2>Personal API Access Tokens</h2>
        <p>Generate API tokens to authenticate with the NexusCloud CLI, SDK, and CI/CD pipelines.</p>
      </div>

      {apiMessage && <div className="settings-alert settings-success">{apiMessage}</div>}

      <div style={{ marginBottom: "24px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px", color: "#cbd5e1" }}>
          Generate New API Token
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="e.g. CI/CD Pipeline, CLI Token"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            style={{
              flex: 1,
              height: "40px",
              padding: "0 12px",
              background: "#101017",
              border: "1px solid #2a2a35",
              borderRadius: "8px",
              color: "#f8fafc",
            }}
          />
          <button
            type="button"
            className="settings-button"
            disabled={generatingToken || !tokenName.trim()}
            onClick={async () => {
              try {
                setGeneratingToken(true);
                const res = await api.createApiToken(tokenName.trim());
                setNewlyCreatedToken(res.token);
                setTokenName("");
                await loadApiTokens();
                setApiMessage("New API token generated successfully!");
              } catch (err) {
                setApiMessage(err.message || "Failed to generate token.");
              } finally {
                setGeneratingToken(false);
              }
            }}
          >
            {generatingToken ? "Generating..." : "Generate Token"}
          </button>
        </div>
      </div>

      {newlyCreatedToken && (
        <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", padding: "14px", borderRadius: "8px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <strong style={{ color: "#22c55e", fontSize: "14px" }}>Make sure to copy your new personal access token now:</strong>
            <button
              type="button"
              className="settings-button"
              style={{ height: "30px", fontSize: "12px", padding: "0 12px" }}
              onClick={() => {
                navigator.clipboard.writeText(newlyCreatedToken.token);
                alert("Token copied to clipboard!");
              }}
            >
              Copy Token
            </button>
          </div>
          <code style={{ display: "block", wordBreak: "break-all", background: "#0b0b10", padding: "8px 12px", borderRadius: "6px", color: "#a7f3d0", fontSize: "13px" }}>
            {newlyCreatedToken.token}
          </code>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: "15px", marginBottom: "12px", color: "#f8fafc" }}>Active API Tokens</h3>
        {apiTokensLoading ? (
          <p style={{ color: "#94a3b8" }}>Loading tokens...</p>
        ) : apiTokens.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>No personal API tokens generated yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {apiTokens.map((tok) => (
              <div key={tok.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#101017", padding: "12px 16px", borderRadius: "8px", border: "1px solid #2a2a35" }}>
                <div>
                  <strong style={{ fontSize: "14px", display: "block", color: "#f8fafc" }}>{tok.name}</strong>
                  <code style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {tok.token ? `${tok.token.substring(0, 12)}••••••••••••••••` : "••••••••••••••••"}
                  </code>
                </div>
                <button
                  type="button"
                  style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                  onClick={async () => {
                    if (window.confirm(`Revoke token "${tok.name}"?`)) {
                      await api.revokeApiToken(tok.id);
                      await loadApiTokens();
                      setApiMessage("Token revoked.");
                    }
                  }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );


  const renderDanger = () => (
    <section className="settings-card" style={{ borderColor: "#ef4444" }}>
      <div className="settings-card-header">
        <h2 style={{ color: "#ef4444" }}>Danger Zone</h2>
        <p>Irreversible actions for your account and workspace data.</p>
      </div>

      {dangerMessage && <div className="settings-alert settings-error">{dangerMessage}</div>}

      <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "18px" }}>
        <h3 style={{ fontSize: "16px", color: "#ef4444", margin: "0 0 8px 0" }}>Delete NexusCloud Account</h3>
        <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
          Once you delete your account, there is no going back. All your connected repositories, deployment history, preferences, and API access tokens will be permanently removed.
        </p>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", color: "#cbd5e1" }}>
            Please type <strong style={{ color: "#ef4444" }}>DELETE</strong> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            style={{
              width: "100%",
              maxWidth: "280px",
              height: "38px",
              padding: "0 12px",
              background: "#101017",
              border: "1px solid #2a2a35",
              borderRadius: "6px",
              color: "#f8fafc",
            }}
          />
        </div>

        <button
          type="button"
          disabled={deleteConfirmation !== "DELETE" || deletingAccount}
          style={{
            height: "40px",
            padding: "0 20px",
            background: deleteConfirmation === "DELETE" ? "#ef4444" : "#451a1a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: deleteConfirmation === "DELETE" ? "pointer" : "not-allowed",
            opacity: deleteConfirmation === "DELETE" ? 1 : 0.6,
          }}
          onClick={async () => {
            if (window.confirm("FINAL CONFIRMATION: Are you completely sure you want to permanently delete your account?")) {
              try {
                setDeletingAccount(true);
                await api.deleteAccount();
                logout();
                navigate("/login");
              } catch (err) {
                setDangerMessage(err.message || "Failed to delete account.");
                setDeletingAccount(false);
              }
            }
          }}
        >
          {deletingAccount ? "Deleting..." : "Permanently Delete Account"}
        </button>
      </div>
    </section>
  );

  if (loadingProfile) {
    return (
      <div className="settings-page">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>
          Manage your account, workspace, and developer
          preferences.
        </p>
      </div>

      {message && (
        <div className="settings-alert settings-success">
          {message}
        </div>
      )}

      {error && (
        <div className="settings-alert settings-error">
          {error}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {sections.map((group) => (
            <div className="settings-nav-group" key={group.title}>
              <div className="settings-nav-title">
                {group.title}
              </div>

              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`settings-nav-item ${
                    activeSection === item.id ? "active" : ""
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="settings-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}