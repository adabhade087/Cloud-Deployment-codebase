export default function AddRepository() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add Repository</h1>
        <p className="page-subtitle">
          Connect a GitHub repository to start deploying your application.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <h2 className="section-title">Repository Details</h2>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          Enter the GitHub repository you want to deploy.
        </p>

        <div className="form-group">
          <label className="form-label">GitHub Repository URL</label>

          <input
            type="url"
            className="form-input"
            placeholder="https://github.com/username/project"
          />

          <p
            style={{
              marginTop: 6,
              color: "var(--text-muted)",
              fontSize: 12,
            }}
          >
            Make sure the repository is accessible to CloudForge.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">Branch</label>

          <input
            type="text"
            className="form-input"
            defaultValue="main"
            placeholder="main"
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <button className="btn btn-primary">Add Repository</button>
        </div>
      </div>
    </div>
  );
}
