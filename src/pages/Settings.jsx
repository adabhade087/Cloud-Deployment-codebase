import { useEffect, useState } from "react";
import { api } from "../services/api";

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

  const clearStatus = () => {
    setMessage("");
    setError("");
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    clearStatus();
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
          This section will be connected to the CloudForge
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
      <p>Customize your CloudForge experience.</p>
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
            Receive updates about CloudForge system events.
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
            Receive selected CloudForge notifications by email.
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
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <h2>GitHub</h2>
        <p>Connect your GitHub account with CloudForge.</p>
      </div>

      <div className="settings-placeholder">
        <p>
          Connect GitHub to manage repositories and deployments.
        </p>

        <button
  type="button"
  className="settings-button"
  onClick={async () => {
    try {
      const authData = localStorage.getItem("nexuscloud_auth");
      const token = authData ? JSON.parse(authData).token : null;
      
      const response = await fetch(
        "http://localhost:5000/api/users/github/connect",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }}
>
  Connect GitHub
</button>
      </div>
    </section>
  );

      case "api":
        return renderComingSoon(
          "API",
          "Manage API access and developer integrations.",
        );

      case "danger":
        return renderComingSoon(
          "Danger Zone",
          "Account deletion and other irreversible account actions.",
        );

      default:
        return renderProfile();
    }
  };

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