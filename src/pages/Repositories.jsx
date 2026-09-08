import { useEffect, useState } from "react";

export default function Repositories() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/repositories");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch repositories");
        }

        setRepositories(data.repositories || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Repositories</h1>
        <p className="page-subtitle">
          Manage repositories connected to CloudForge.
        </p>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Loading repositories...</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && repositories.length === 0 && (
        <div className="card">
          <h2 className="section-title">No repositories</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            No repositories have been connected yet.
          </p>
        </div>
      )}

      {!loading && repositories.length > 0 && (
        <div className="grid-auto">
          {repositories.map((repo) => (
            <div className="card card-hover" key={repo.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "16px",
                      marginBottom: "8px",
                      wordBreak: "break-word",
                    }}
                  >
                    {repo.url}
                  </h2>

                  <span className="badge badge-info">{repo.branch}</span>
                </div>

                <span className="badge badge-success">Connected</span>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                Repository ID: #{repo.id}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
