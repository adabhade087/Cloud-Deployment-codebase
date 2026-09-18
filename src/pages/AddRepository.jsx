import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function AddRepository() {
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim() || !branch.trim()) {
      setError("Repository URL and branch are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await api.addRepository({
        url: url.trim(),
        branch: branch.trim(),
      });

      setSuccess("Repository added successfully!");

      setTimeout(() => {
        navigate("/repositories");
      }, 800);
    } catch (error) {
      console.error("Add repository error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add Repository</h1>

        <p className="page-subtitle">
          Connect a GitHub repository to CloudForge.
        </p>
      </div>

      <div
        className="card"
        style={{
          maxWidth: "650px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Repository URL
            </label>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Branch
            </label>

            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="form-input"
            />
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: "20px" }}>
              {error}
            </div>
          )}

          {success && (
            <div
              className="alert"
              style={{
                marginBottom: "20px",
                color: "#34d399",
              }}
            >
              {success}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              className="btn"
              onClick={() => navigate("/repositories")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Repository"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
