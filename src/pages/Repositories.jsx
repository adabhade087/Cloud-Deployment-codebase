import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  Plus,
  GitBranch,
  Trash2,
  ExternalLink,
  RefreshCw,
  Pencil,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Rocket,
  Layers,
  Box,
  Terminal,
  Check,
  X,
  FileCode,
  Folder,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function Repositories() {
  const { user, loading: authLoading } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState("");
  const [editingRepo, setEditingRepo] = useState(null);
  const [editUrl, setEditUrl] = useState("");
  const [editBranch, setEditBranch] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Analysis & selection state
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRepoId, setSelectedRepoId] = useState(null);
  const [analyzingRepoId, setAnalyzingRepoId] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisMap, setAnalysisMap] = useState({});
  const [analysisErrorMap, setAnalysisErrorMap] = useState({});
  const [deployNotification, setDeployNotification] = useState("");

  const navigate = useNavigate();
  const stepTimerRef = useRef(null);

  const analysisSteps = [
    "Analyzing repository...",
    "Inspecting project files",
    "Detecting framework",
    "Generating deployment configuration",
  ];

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getRepositories();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch repositories");
      }

      const repos = Array.isArray(data.repositories)
        ? data.repositories
        : Array.isArray(data.data)
        ? data.data
        : [];
      setRepositories(repos);
      setHasFetched(true);

      // Pre-populate analysis cache from persisted repository fields
      const existingAnalysis = {};
      repos.forEach((repo) => {
        if (repo.analysis_status === "analyzed" || repo.detected_language) {
          existingAnalysis[repo.id] = {
            language: repo.detected_language || "Unknown",
            framework: repo.detected_framework || "Unknown",
            projectType: repo.project_type || "backend",
            packageManager: repo.package_manager,
            installCommand: repo.install_command,
            buildCommand: repo.build_command,
            startCommand: repo.start_command,
            outputDirectory: repo.output_directory,
            hasDockerfile: Boolean(repo.has_dockerfile),
            deployable: Boolean(repo.deployable),
          };
        }
      });
      setAnalysisMap((prev) => ({ ...existingAnalysis, ...prev }));

      return repos;
    } catch (err) {
      console.error("Repository error:", err);
      setError(err.message);
      setHasFetched(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Perform repository analysis
  const handleAnalyze = async (repoId) => {
    if (!repoId) return;

    try {
      setAnalyzingRepoId(repoId);
      setAnalysisStep(0);
      setDeployNotification("");
      setAnalysisErrorMap((prev) => {
        const next = { ...prev };
        delete next[repoId];
        return next;
      });

      // Progressively advance through the 4 analysis steps
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      stepTimerRef.current = setInterval(() => {
        setAnalysisStep((prev) => {
          if (prev < analysisSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 450);

      const res = await api.analyzeRepository(repoId);

      if (stepTimerRef.current) clearInterval(stepTimerRef.current);

      if (res && res.success && res.analysis) {
        setAnalysisMap((prev) => ({
          ...prev,
          [repoId]: res.analysis,
        }));

        // Update repository item in list as well
        setRepositories((prev) =>
          prev.map((repo) =>
            repo.id === repoId
              ? {
                  ...repo,
                  detected_language: res.analysis.language,
                  detected_framework: res.analysis.framework,
                  project_type: res.analysis.projectType,
                  package_manager: res.analysis.packageManager,
                  install_command: res.analysis.installCommand,
                  build_command: res.analysis.buildCommand,
                  start_command: res.analysis.startCommand,
                  output_directory: res.analysis.outputDirectory,
                  has_dockerfile: res.analysis.hasDockerfile ? 1 : 0,
                  deployable: res.analysis.deployable ? 1 : 0,
                  analysis_status: res.analysis.deployable ? "analyzed" : "unsupported",
                }
              : repo
          )
        );
      } else {
        throw new Error(res.message || "Failed to analyze repository");
      }
    } catch (err) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      console.error("Analysis error:", err);
      setAnalysisErrorMap((prev) => ({
        ...prev,
        [repoId]: {
          message: err.message || "Analysis failure",
          code: err.code || (err.status === 401 || err.status === 403 ? "ACCESS_DENIED" : "ANALYSIS_FAILURE"),
          status: err.status,
        },
      }));
    } finally {
      setAnalyzingRepoId(null);
    }
  };

  // Initial load and URL param handling (?selected=...&analyze=true)
  useEffect(() => {
    let isMounted = true;

    if (authLoading) {
      return;
    }

    if (!user || !user.id) {
      setRepositories([]);
      setSelectedRepoId(null);
      setAnalysisMap({});
      setAnalysisErrorMap({});
      setLoading(false);
      return;
    }

    fetchRepositories().then((repos) => {
      if (!isMounted) return;

      const selectedParam = searchParams.get("selected");
      const analyzeParam = searchParams.get("analyze");

      if (selectedParam) {
        const idNum = Number(selectedParam);
        const match = repos.find((r) => r.id === idNum);
        if (match) {
          setSelectedRepoId(idNum);
          if (analyzeParam === "true") {
            handleAnalyze(idNum);
            // Clean up url parameters without navigation
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("analyze");
            setSearchParams(newParams, { replace: true });
          }
        } else if (repos.length > 0) {
          setSelectedRepoId(repos[0].id);
        } else {
          setSelectedRepoId(null);
        }
      } else if (repos.length > 0) {
        // Auto-select first repo for preview
        setSelectedRepoId(repos[0].id);
      } else {
        setSelectedRepoId(null);
      }
    });

    return () => {
      isMounted = false;
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [user?.id, user?.email, authLoading]);

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

      const data = await api.updateRepository(editingRepo.id, {
        url: editUrl.trim(),
        branch: editBranch.trim(),
      });

      if (!data.success) {
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
            : repo
        )
      );

      setEditingRepo(null);
      setEditUrl("");
      setEditBranch("");
    } catch (err) {
      console.error("Edit repository error:", err);
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddRepository = () => {
    navigate("/repositories/add");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this repository?"
    );

    if (!confirmDelete) return;

    try {
      const data = await api.deleteRepository(id);

      if (!data.success) {
        throw new Error(data.message || "Failed to delete repository");
      }

      setRepositories((prev) => prev.filter((repo) => repo.id !== id));
      if (selectedRepoId === id) {
        setSelectedRepoId(null);
      }
    } catch (err) {
      console.error("Delete repository error:", err);
      setError(err.message);
    }
  };

  const handleDeploy = (repo) => {
    const repoName = getRepoName(repo.url);
    setDeployNotification(
      `Deployment configuration for "${repoName}" is ready and prepared for the deployment engine!`
    );
  };

  // Extract clean project name from GitHub URL
  const getRepoName = (url) => {
    if (!url) return "project";
    try {
      const parts = url.split("/").filter(Boolean);
      return parts[parts.length - 1].replace(/\.git$/i, "");
    } catch {
      return url;
    }
  };

  const selectedRepo = repositories.find((r) => r.id === selectedRepoId);
  const selectedAnalysis = selectedRepoId
    ? analysisMap[selectedRepoId] ||
      (selectedRepo && (selectedRepo.detected_language || selectedRepo.analysis_status === "analyzed")
        ? {
            language: selectedRepo.detected_language || "Unknown",
            framework: selectedRepo.detected_framework || "Unknown",
            projectType: selectedRepo.project_type || "backend",
            packageManager: selectedRepo.package_manager,
            installCommand: selectedRepo.install_command,
            buildCommand: selectedRepo.build_command,
            startCommand: selectedRepo.start_command,
            outputDirectory: selectedRepo.output_directory,
            hasDockerfile: Boolean(selectedRepo.has_dockerfile),
            deployable: Boolean(selectedRepo.deployable),
          }
        : null)
    : null;
  const selectedError = selectedRepoId ? analysisErrorMap[selectedRepoId] : null;
  const isSelectedAnalyzing = analyzingRepoId === selectedRepoId;

  return (
    <div
      style={{
        width: "100%",
        color: "var(--text-primary)",
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
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            Repositories
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            Manage and automatically analyze repositories connected to CloudForge.
          </p>
        </div>

        {/* ADD BUTTON */}
        <button
          type="button"
          onClick={handleAddRepository}
          className="btn btn-primary"
          style={{
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.25)",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={18} />
          Add Repository
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div
          className="alert alert-error"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <span>{error}</span>

          <button
            onClick={fetchRepositories}
            className="btn btn-sm"
            style={{
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "var(--accent-red)",
            }}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* REPOSITORY ANALYSIS CARD */}
      {selectedRepo && (
        <div
          className="card"
          style={{
            marginBottom: "28px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-medium)",
            boxShadow: "var(--shadow-md)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Card Top Banner / Header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "18px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "var(--accent-blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Repository Analysis
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  {getRepoName(selectedRepo.url)}
                </span>
                <span style={{ color: "var(--text-muted)" }}>•</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                >
                  <GitBranch size={13} />
                  {selectedRepo.branch || "main"}
                </span>
              </div>
            </div>

            {/* Top Right Action & Status Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {isSelectedAnalyzing ? (
                <span className="badge badge-info badge-dot">
                  Analyzing
                </span>
              ) : selectedAnalysis?.deployable ? (
                <span className="badge badge-success badge-dot">
                  Ready to deploy
                </span>
              ) : selectedAnalysis && !selectedAnalysis.deployable ? (
                <span className="badge badge-warning badge-dot">
                  Configuration Needed
                </span>
              ) : selectedError ? (
                <span className="badge badge-error badge-dot">
                  Analysis Error
                </span>
              ) : (
                <span className="badge badge-neutral badge-dot">
                  Unanalyzed
                </span>
              )}

              <button
                type="button"
                onClick={() => handleAnalyze(selectedRepo.id)}
                disabled={isSelectedAnalyzing}
                className="btn btn-secondary btn-sm"
                title="Run fresh analysis"
              >
                <RefreshCw
                  size={14}
                  className={isSelectedAnalyzing ? "spinner" : ""}
                />
                {isSelectedAnalyzing ? "Analyzing..." : "Re-analyze"}
              </button>
            </div>
          </div>

          {/* DEPLOY NOTIFICATION BANNER */}
          {deployNotification && (
            <div
              className="alert alert-success"
              style={{
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} />
                <span>{deployNotification}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => navigate("/deployment")}
                style={{ color: "var(--accent-green)", fontWeight: "600" }}
              >
                View Deployments <ArrowRight size={14} style={{ marginLeft: "4px" }} />
              </button>
            </div>
          )}

          {/* STATE 1: LOADING STATE */}
          {isSelectedAnalyzing && (
            <div
              style={{
                padding: "36px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "18px",
              }}
            >
              <div className="spinner spinner-lg" />

              <div style={{ maxWidth: "420px", width: "100%" }}>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "16px",
                  }}
                >
                  {analysisSteps[analysisStep]}
                </div>

                {/* Progressive step indicator list */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    textAlign: "left",
                    background: "var(--bg-secondary)",
                    padding: "16px 20px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {analysisSteps.map((stepText, idx) => {
                    const isDone = idx < analysisStep;
                    const isCurrent = idx === analysisStep;
                    return (
                      <div
                        key={stepText}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontSize: "13px",
                          color: isDone
                            ? "var(--accent-green)"
                            : isCurrent
                            ? "var(--accent-blue)"
                            : "var(--text-muted)",
                          fontWeight: isCurrent ? "600" : "400",
                        }}
                      >
                        {isDone ? (
                          <Check size={14} />
                        ) : isCurrent ? (
                          <div
                            className="spinner"
                            style={{ width: "14px", height: "14px", borderWidth: "2px" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              border: "1px solid var(--border-medium)",
                            }}
                          />
                        )}
                        <span>{stepText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: ERROR STATE */}
          {!isSelectedAnalyzing && selectedError && (
            <div style={{ padding: "10px 0" }}>
              <div
                className="alert alert-error"
                style={{
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    Analysis Failed
                  </div>
                  <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
                    {selectedError.message}
                  </div>
                </div>
              </div>

              {/* Helpful actionable hints for specific error states */}
              {selectedError.code === "GITHUB_NOT_CONNECTED" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "var(--bg-secondary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Connect your GitHub OAuth account to allow CloudForge to inspect project files.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/settings")}
                  >
                    Go to Settings
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAnalyze(selectedRepo.id)}
                >
                  <RefreshCw size={14} /> Retry Analysis
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESSFUL ANALYSIS RESULT */}
          {!isSelectedAnalyzing && !selectedError && selectedAnalysis && (
            <div>
              {/* Parameter Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {/* Language */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Language
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedAnalysis.language || "Unknown"}
                  </div>
                </div>

                {/* Framework */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Framework
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedAnalysis.framework || "Unknown"}
                  </div>
                </div>

                {/* Package Manager */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Package Manager
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedAnalysis.packageManager || "None"}
                  </div>
                </div>

                {/* Build Command */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Build Command
                  </div>
                  <div>
                    {selectedAnalysis.buildCommand ? (
                      <code
                        style={{
                          fontSize: "13px",
                          fontFamily: "monospace",
                          color: "var(--accent-blue)",
                          background: "var(--bg-elevated)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {selectedAnalysis.buildCommand}
                      </code>
                    ) : (
                      <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                        None required
                      </span>
                    )}
                  </div>
                </div>

                {/* Output Directory */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Output Directory
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {selectedAnalysis.outputDirectory ? (
                      <code
                        style={{
                          fontSize: "13px",
                          fontFamily: "monospace",
                          background: "var(--bg-elevated)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {selectedAnalysis.outputDirectory}
                      </code>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>None (Root / Server)</span>
                    )}
                  </div>
                </div>

                {/* Docker */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Docker
                  </div>
                  <div>
                    {selectedAnalysis.hasDockerfile ? (
                      <span className="badge badge-success">
                        <Check size={12} /> Detected
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Not detected</span>
                    )}
                  </div>
                </div>

                {/* Start Command (if applicable) */}
                {selectedAnalysis.startCommand && (
                  <div
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "6px",
                      }}
                    >
                      Start Command
                    </div>
                    <div>
                      <code
                        style={{
                          fontSize: "13px",
                          fontFamily: "monospace",
                          color: "var(--accent-purple)",
                          background: "var(--bg-elevated)",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {selectedAnalysis.startCommand}
                      </code>
                    </div>
                  </div>
                )}

                {/* Deployment Status */}
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "6px",
                    }}
                  >
                    Deployment Status
                  </div>
                  <div>
                    {selectedAnalysis.deployable ? (
                      <span
                        className="badge badge-success"
                        style={{ fontWeight: "600" }}
                      >
                        <CheckCircle2 size={13} /> Ready to deploy
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        Configuration needed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason note if unsupported */}
              {selectedAnalysis.reason && !selectedAnalysis.deployable && (
                <div
                  className="alert alert-info"
                  style={{ marginBottom: "20px", fontSize: "13px" }}
                >
                  <AlertCircle size={16} />
                  <span>{selectedAnalysis.reason}</span>
                </div>
              )}

              {/* Action Buttons: Deploy and Re-analyze */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "18px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {selectedAnalysis.deployable ? (
                    <span>
                      Automatic detection complete. Review configuration above and proceed with deployment.
                    </span>
                  ) : (
                    <span>
                      Manual configuration or Dockerfile may be required before deploying.
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => handleDeploy(selectedRepo)}
                    disabled={!selectedAnalysis.deployable}
                    className="btn btn-primary"
                    style={{
                      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
                    }}
                  >
                    <Rocket size={16} />
                    Deploy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: PROMPT TO ANALYZE (If not yet analyzed) */}
          {!isSelectedAnalyzing && !selectedError && !selectedAnalysis && (
            <div
              style={{
                padding: "30px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "var(--accent-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={22} />
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                Analyze {getRepoName(selectedRepo.url)}
              </div>
              <p
                style={{
                  maxWidth: "460px",
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                CloudForge will automatically detect the language, framework, package manager, and build configuration.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAnalyze(selectedRepo.id)}
                style={{ marginTop: "6px" }}
              >
                <Sparkles size={16} /> Run Automatic Analysis
              </button>
            </div>
          )}
        </div>
      )}

      {/* LOADING REPOSITORIES */}
      {loading && (
        <div
          className="card"
          style={{
            padding: "50px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <div className="spinner spinner-lg" style={{ margin: "0 auto 16px" }} />
          Loading repositories...
        </div>
      )}

      {/* REPOSITORY LIST */}
      {!loading && hasFetched && repositories.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Connected Repositories ({repositories.length})
            </h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Select a repository to inspect and deploy
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {repositories.map((repo) => {
              const isSelected = repo.id === selectedRepoId;
              const repoAnalysis = analysisMap[repo.id];
              const repoError = analysisErrorMap[repo.id];
              const isAnalyzingThis = analyzingRepoId === repo.id;

              return (
                <div
                  key={repo.id}
                  onClick={() => setSelectedRepoId(repo.id)}
                  className="card card-hover"
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    borderColor: isSelected ? "var(--accent-blue)" : "var(--border-subtle)",
                    boxShadow: isSelected
                      ? "0 0 0 1px var(--accent-blue), 0 4px 20px rgba(99, 102, 241, 0.15)"
                      : "none",
                    background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* LEFT INFO */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          minWidth: "42px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isSelected
                            ? "rgba(99, 102, 241, 0.2)"
                            : "rgba(99, 102, 241, 0.1)",
                          border: "1px solid rgba(99, 102, 241, 0.25)",
                          borderRadius: "10px",
                          color: "var(--accent-blue)",
                        }}
                      >
                        <GitBranch size={20} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "var(--text-primary)",
                              wordBreak: "break-all",
                            }}
                          >
                            {getRepoName(repo.url)}
                          </h3>

                          {/* Framework badge if detected */}
                          {repoAnalysis?.framework && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                background: "rgba(99, 102, 241, 0.12)",
                                color: "var(--accent-blue)",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "600",
                              }}
                            >
                              <Layers size={11} />
                              {repoAnalysis.framework}
                            </span>
                          )}

                          {/* Language tag */}
                          {repoAnalysis?.language && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-subtle)",
                                color: "var(--text-secondary)",
                                borderRadius: "4px",
                                fontSize: "11px",
                              }}
                            >
                              {repoAnalysis.language}
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 6px",
                              background: "rgba(99, 102, 241, 0.1)",
                              color: "var(--accent-blue)",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "500",
                            }}
                          >
                            <GitBranch size={11} />
                            {repo.branch || "main"}
                          </span>

                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {repo.url}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexShrink: 0,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Analysis Status / Trigger Button */}
                      {isAnalyzingThis ? (
                        <span className="badge badge-info badge-dot">
                          Analyzing...
                        </span>
                      ) : repoAnalysis ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRepoId(repo.id);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{
                            color: "var(--accent-green)",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          <CheckCircle2 size={14} /> Ready to deploy
                        </button>
                      ) : repoError ? (
                        <button
                          type="button"
                          onClick={() => handleAnalyze(repo.id)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            color: "var(--accent-red)",
                            fontSize: "12px",
                          }}
                        >
                          <AlertCircle size={14} /> Retry Analysis
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRepoId(repo.id);
                            handleAnalyze(repo.id);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "12px" }}
                        >
                          <Sparkles size={13} /> Analyze
                        </button>
                      )}

                      {/* OPEN REPO ON GITHUB */}
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-icon btn-ghost"
                        style={{
                          width: "34px",
                          height: "34px",
                          border: "1px solid var(--border-subtle)",
                        }}
                        title="Open on GitHub"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => handleEdit(repo)}
                        className="btn btn-icon btn-ghost"
                        style={{
                          width: "34px",
                          height: "34px",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--accent-blue)",
                        }}
                        title="Edit repository"
                      >
                        <Pencil size={15} />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => handleDelete(repo.id)}
                        className="btn btn-icon btn-ghost"
                        style={{
                          width: "34px",
                          height: "34px",
                          border: "1px solid var(--border-subtle)",
                          color: "var(--accent-red)",
                        }}
                        title="Delete repository"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPTY REPOSITORIES */}
      {!loading && hasFetched && !error && repositories.length === 0 && (
        <div
          className="card"
          style={{
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
              color: "var(--accent-blue)",
            }}
          >
            <GitBranch size={24} />
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            No repositories connected
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            Connect your first repository to automatically detect framework settings and start deploying.
          </p>

          <button
            type="button"
            onClick={handleAddRepository}
            className="btn btn-primary"
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
            className="card"
            style={{
              width: "100%",
              maxWidth: "500px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h2
              style={{
                margin: "0 0 6px",
                color: "var(--text-primary)",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Edit Repository
            </h2>

            <p
              style={{
                margin: "0 0 24px",
                color: "var(--text-secondary)",
                fontSize: "13px",
              }}
            >
              Update your repository connection details.
            </p>

            <label className="form-label">Repository URL</label>
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              className="form-input"
              style={{ marginBottom: "18px" }}
            />

            <label className="form-label">Branch</label>
            <input
              type="text"
              value={editBranch}
              onChange={(e) => setEditBranch(e.target.value)}
              placeholder="main"
              className="form-input"
              style={{ marginBottom: "24px" }}
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
                className="btn btn-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="btn btn-primary"
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
