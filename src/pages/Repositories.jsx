import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  Plus,
  GitBranch,
  Trash2,
  ExternalLink,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Repositories() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRepo, setEditingRepo] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const navigate = useNavigate();

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getRepositories();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch repositories");
      }

      setRepositories(data.repositories || []);
    } catch (error) {
      console.error("Repository error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleEdit = (repo) => {
    setEditingRepo(repo);
    setEditUrl(repo.url);
    setEditBranch(repo.branch || "main");
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editUrl.trim() || !editBranch.trim()) {
      setError("Repository URL and branch are required");
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/repositories/${editingRepo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: editUrl.trim(),
            branch: editBranch.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update repository");
      }

      setRepositories((prev) =>
        prev.map((repo) =>
          repo.id === editingRepo.id
            ? {
                ...repo,
                url: editUrl.trim(),
                branch: editBranch.trim(),
              }
            : repo,
        ),
      );

      setEditingRepo(null);
      setEditUrl("");
      setEditBranch("");
    } catch (error) {
      console.error("Edit repository error:", error);
      setError(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddRepository = () => {
    console.log("Add Repository clicked");
    navigate("/repositories/add");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this repository?",
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/repositories/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete repository");
      }

      setRepositories((prev) =>
        prev.filter((repository) => repository.id !== id),
      );
    } catch (error) {
      console.error("Delete repository error:", error);
      setError(error.message);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        color: "#f4f4f5",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "32px",
              fontWeight: "700",
              color: "#f4f4f5",
              letterSpacing: "-0.5px",
            }}
          >
            Repositories
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "#a1a1aa",
            }}
          >
            Manage repositories connected to CloudForge.
          </p>
        </div>

        {/* ADD BUTTON */}
        <button
          type="button"
          onClick={() => {
            console.log("ADD BUTTON CLICKED");
            window.location.href = "/repositories/add";
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "11px 18px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={18} />
          Add Repository
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "14px 16px",
            marginBottom: "20px",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#f87171",
            fontSize: "14px",
          }}
        >
          <span>{error}</span>

          <button
            onClick={fetchRepositories}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "7px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          style={{
            background: "#101014",
            border: "1px solid #24242b",
            borderRadius: "12px",
            padding: "50px",
            textAlign: "center",
            color: "#a1a1aa",
          }}
        >
          Loading repositories...
        </div>
      )}

      {/* REPOSITORY LIST */}
      {!loading && !error && repositories.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {repositories.map((repo) => (
            <div
              key={repo.id}
              style={{
                background: "#101014",
                border: "1px solid #24242b",
                borderRadius: "12px",
                padding: "20px",
                transition: "border-color 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                }}
              >
                {/* LEFT */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    minWidth: 0,
                  }}
                >
                  {/* ICON */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      minWidth: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: "10px",
                      color: "#818cf8",
                    }}
                  >
                    <GitBranch size={21} />
                  </div>

                  {/* INFO */}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "7px",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#f4f4f5",
                          wordBreak: "break-all",
                        }}
                      >
                        {repo.url}
                      </h2>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "4px 8px",
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "#a5b4fc",
                          borderRadius: "5px",
                          fontSize: "11px",
                          fontWeight: "600",
                        }}
                      >
                        <GitBranch size={12} />
                        {repo.branch || "main"}
                      </span>

                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#52525b",
                        }}
                      />

                      <span
                        style={{
                          fontSize: "11px",
                          color: "#71717a",
                        }}
                      >
                        ID #{repo.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexShrink: 0,
                  }}
                >
                  {/* CONNECTED */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 10px",
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.18)",
                      color: "#34d399",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#34d399",
                      }}
                    />
                    Connected
                  </span>
                  {/* OPEN */}
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "34px",
                      height: "34px",
                      color: "#a1a1aa",
                      border: "1px solid #2a2a32",
                      borderRadius: "7px",
                      textDecoration: "none",
                    }}
                    title="Open repository"
                  >
                    <ExternalLink size={15} />
                  </a>

                  {/* EDIT */}
                  <button
                    type="button"
                    onClick={() => handleEdit(repo)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "34px",
                      height: "34px",
                      color: "#a5b4fc",
                      background: "transparent",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                    title="Edit repository"
                  >
                    <Pencil size={15} />
                  </button>

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() => handleDelete(repo.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "34px",
                      height: "34px",
                      color: "#f87171",
                      background: "transparent",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      borderRadius: "7px",
                      cursor: "pointer",
                    }}
                    title="Delete repository"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && repositories.length === 0 && (
        <div
          style={{
            background: "#101014",
            border: "1px solid #24242b",
            borderRadius: "12px",
            padding: "60px 30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(99, 102, 241, 0.1)",
              borderRadius: "12px",
              color: "#818cf8",
            }}
          >
            <GitBranch size={24} />
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#f4f4f5",
            }}
          >
            No repositories
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "#71717a",
              fontSize: "13px",
            }}
          >
            Connect your first repository to start deploying with CloudForge.
          </p>

          <button
            type="button"
            onClick={handleAddRepository}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "10px 16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              border: "none",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Connect Repository
          </button>
        </div>
      )}
      {/* EDIT MODAL */}
      {editingRepo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#101014",
              border: "1px solid #2a2a32",
              borderRadius: "14px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h2
              style={{
                margin: "0 0 6px",
                color: "#f4f4f5",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Edit Repository
            </h2>

            <p
              style={{
                margin: "0 0 24px",
                color: "#71717a",
                fontSize: "13px",
              }}
            >
              Update your repository connection details.
            </p>

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#d4d4d8",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Repository URL
            </label>

            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                marginBottom: "18px",
                background: "#09090b",
                border: "1px solid #2a2a32",
                borderRadius: "8px",
                color: "#f4f4f5",
                fontSize: "13px",
                outline: "none",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#d4d4d8",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              Branch
            </label>

            <input
              type="text"
              value={editBranch}
              onChange={(e) => setEditBranch(e.target.value)}
              placeholder="main"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                marginBottom: "24px",
                background: "#09090b",
                border: "1px solid #2a2a32",
                borderRadius: "8px",
                color: "#f4f4f5",
                fontSize: "13px",
                outline: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={() => setEditingRepo(null)}
                disabled={savingEdit}
                style={{
                  padding: "10px 16px",
                  background: "transparent",
                  border: "1px solid #2a2a32",
                  borderRadius: "7px",
                  color: "#a1a1aa",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  borderRadius: "7px",
                  color: "#ffffff",
                  cursor: savingEdit ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  opacity: savingEdit ? 0.7 : 1,
                }}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
