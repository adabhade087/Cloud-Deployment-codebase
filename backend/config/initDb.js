const db = require("./db");

async function initDb() {
  try {
    // 1. Ensure 'role' column exists in 'users' table
    try {
      const [columns] = await db.query(
        "SHOW COLUMNS FROM users LIKE 'role'"
      );
      if (columns.length === 0) {
        await db.query(
          "ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'developer'"
        );
        console.log("Added 'role' column to users table");
      }
    } catch (colErr) {
      console.warn("Notice checking users table role column:", colErr.message);
    }

    // 2. Deployments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS deployments (
        id VARCHAR(64) PRIMARY KEY,
        user_id INT NULL,
        project VARCHAR(100) NOT NULL,
        environment VARCHAR(50) NOT NULL,
        version VARCHAR(50) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'deploying',
        deployed_at VARCHAR(100) NOT NULL,
        deployed_by VARCHAR(100) NOT NULL DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Deployment logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS deployment_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        deployment_id VARCHAR(64) NOT NULL,
        timestamp VARCHAR(100) NOT NULL,
        level VARCHAR(20) NOT NULL DEFAULT 'INFO',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_deployment (deployment_id)
      )
    `);

    // 4. Deployment environments
    await db.query(`
      CREATE TABLE IF NOT EXISTS deployment_environments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'healthy',
        deployments INT NOT NULL DEFAULT 0,
        url VARCHAR(255) NOT NULL,
        last_deploy VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Software releases
    await db.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id VARCHAR(64) PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        project VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'released',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Rollback versions
    await db.query(`
      CREATE TABLE IF NOT EXISTS rollback_versions (
        id VARCHAR(64) PRIMARY KEY,
        project VARCHAR(100) NOT NULL,
        current_version VARCHAR(50) NOT NULL,
        previous_version VARCHAR(50) NOT NULL,
        environment VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. CI/CD Pipelines
    await db.query(`
      CREATE TABLE IF NOT EXISTS pipelines (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'running',
        last_run VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        stages JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 8. Pipeline runs
    await db.query(`
      CREATE TABLE IF NOT EXISTS pipeline_runs (
        id VARCHAR(64) PRIMARY KEY,
        pipeline_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'success',
        branch VARCHAR(100) NOT NULL,
        commit_hash VARCHAR(50) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        date VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Build history
    await db.query(`
      CREATE TABLE IF NOT EXISTS build_history (
        id VARCHAR(64) PRIMARY KEY,
        commit_hash VARCHAR(50) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'success',
        duration VARCHAR(50) NOT NULL,
        date VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Infrastructure resources
    await db.query(`
      CREATE TABLE IF NOT EXISTS infrastructure_resources (
        id VARCHAR(64) PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'running',
        region VARCHAR(50) NOT NULL,
        cpu INT NOT NULL DEFAULT 0,
        memory INT NOT NULL DEFAULT 0,
        cost INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 11. Terraform configs
    await db.query(`
      CREATE TABLE IF NOT EXISTS terraform_configs (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'applied',
        last_plan VARCHAR(100) NOT NULL,
        resources INT NOT NULL DEFAULT 0,
        plan_output TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Kubernetes clusters & nodes
    await db.query(`
      CREATE TABLE IF NOT EXISTS kubernetes_clusters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        nodes INT NOT NULL DEFAULT 0,
        pods INT NOT NULL DEFAULT 0,
        services INT NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'healthy',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS kubernetes_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cluster_id INT NULL,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ready',
        cpu INT NOT NULL DEFAULT 0,
        memory INT NOT NULL DEFAULT 0,
        pods INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 13. Cost budgets & overview
    await db.query(`
      CREATE TABLE IF NOT EXISTS cost_budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        budget INT NOT NULL DEFAULT 50000,
        current INT NOT NULL DEFAULT 42580,
        estimated INT NOT NULL DEFAULT 48200,
        previous INT NOT NULL DEFAULT 45100,
        daily INT NOT NULL DEFAULT 1420,
        trend DECIMAL(5, 2) NOT NULL DEFAULT -5.2,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS optimization_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        savings INT NOT NULL DEFAULT 0,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 14. System logs
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp VARCHAR(100) NOT NULL,
        service VARCHAR(100) NOT NULL,
        level VARCHAR(20) NOT NULL DEFAULT 'INFO',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 15. Alerts
    await db.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(64) PRIMARY KEY,
        severity VARCHAR(20) NOT NULL,
        service VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        time VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 16. User API tokens
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_api_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        token VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 17. GitHub OAuth states
    await db.query(`
      CREATE TABLE IF NOT EXISTS github_oauth_states (
        state VARCHAR(128) PRIMARY KEY,
        user_id INT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 18. User GitHub connections
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_github_connections (
        user_id INT PRIMARY KEY,
        github_username VARCHAR(100) NOT NULL,
        github_access_token VARCHAR(255) NOT NULL,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 19. User preferences
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INT PRIMARY KEY,
        theme VARCHAR(20) DEFAULT 'dark',
        language VARCHAR(10) DEFAULT 'en',
        timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
        default_landing_page VARCHAR(50) DEFAULT 'dashboard',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 20. User notification preferences
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_notification_preferences (
        user_id INT PRIMARY KEY,
        deployment_notifications BOOLEAN DEFAULT TRUE,
        pipeline_notifications BOOLEAN DEFAULT TRUE,
        security_notifications BOOLEAN DEFAULT TRUE,
        system_notifications BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ==========================================
    // SEED DEFAULT DEMO DATA IF TABLES ARE EMPTY
    // ==========================================

    // Deployments
    const [depRows] = await db.query("SELECT COUNT(*) AS cnt FROM deployments");
    if (depRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO deployments (id, project, environment, version, branch, status, deployed_at, deployed_by) VALUES
        ('dep-001', 'api-gateway', 'Production', 'v2.4.1', 'main', 'success', '2026-08-13 10:30', 'Aditya D.'),
        ('dep-002', 'frontend-app', 'Staging', 'v3.1.0', 'develop', 'success', '2026-08-13 09:15', 'Aditya D.'),
        ('dep-003', 'user-service', 'Production', 'v1.9.2', 'release/1.9', 'deploying', '2026-08-13 11:00', 'Aditya D.'),
        ('dep-004', 'payment-api', 'Development', 'v0.8.5', 'feature/payments', 'failed', '2026-08-12 16:45', 'Aditya D.')
      `);

      await db.query(`
        INSERT INTO deployment_logs (deployment_id, timestamp, level, message) VALUES
        ('dep-001', '2026-08-13 10:28:10', 'INFO', 'Initializing deployment for api-gateway v2.4.1 on Production'),
        ('dep-001', '2026-08-13 10:28:30', 'INFO', 'Pulling Docker image nexuscloud/api-gateway:v2.4.1'),
        ('dep-001', '2026-08-13 10:29:10', 'INFO', 'Rolling update triggered on Kubernetes cluster'),
        ('dep-001', '2026-08-13 10:29:50', 'INFO', 'Health checks passing: 3/3 pods ready'),
        ('dep-001', '2026-08-13 10:30:00', 'SUCCESS', 'Deployment finished successfully'),
        ('dep-003', '2026-08-13 11:00:00', 'INFO', 'Deployment initiated for user-service v1.9.2'),
        ('dep-003', '2026-08-13 11:00:20', 'INFO', 'Running pre-deployment database migrations...'),
        ('dep-004', '2026-08-12 16:44:00', 'INFO', 'Starting deployment for payment-api v0.8.5'),
        ('dep-004', '2026-08-12 16:45:00', 'ERROR', 'Integration tests failed on test runner: Stripe webhook signature mismatch')
      `);
    }

    // Environments
    const [envRows] = await db.query("SELECT COUNT(*) AS cnt FROM deployment_environments");
    if (envRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO deployment_environments (id, name, status, deployments, url, last_deploy) VALUES
        ('dev', 'Development', 'healthy', 8, 'dev.nexuscloud.io', '2 hrs ago'),
        ('staging', 'Staging', 'healthy', 12, 'staging.nexuscloud.io', '45 min ago'),
        ('prod', 'Production', 'healthy', 24, 'app.nexuscloud.io', '15 min ago')
      `);
    }

    // Releases
    const [relRows] = await db.query("SELECT COUNT(*) AS cnt FROM releases");
    if (relRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO releases (id, version, project, date, notes, status) VALUES
        ('rel-001', 'v2.4.1', 'api-gateway', '2026-08-13', 'Performance improvements, bug fixes', 'released'),
        ('rel-002', 'v3.1.0', 'frontend-app', '2026-08-12', 'New dashboard UI, auth improvements', 'released'),
        ('rel-003', 'v1.9.2', 'user-service', '2026-08-13', 'OAuth2 integration', 'pending'),
        ('rel-004', 'v0.8.5', 'payment-api', '2026-08-11', 'Stripe webhook support', 'released')
      `);
    }

    // Rollback versions
    const [rbRows] = await db.query("SELECT COUNT(*) AS cnt FROM rollback_versions");
    if (rbRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO rollback_versions (id, project, current_version, previous_version, environment, date) VALUES
        ('rb-001', 'api-gateway', 'v2.4.1', 'v2.4.0', 'Production', '2026-08-13'),
        ('rb-002', 'user-service', 'v1.9.2', 'v1.9.1', 'Production', '2026-08-12'),
        ('rb-003', 'frontend-app', 'v3.1.0', 'v3.0.8', 'Staging', '2026-08-11')
      `);
    }

    // Pipelines
    const [pipeRows] = await db.query("SELECT COUNT(*) AS cnt FROM pipelines");
    if (pipeRows[0].cnt === 0) {
      const p1Stages = JSON.stringify([
        { name: "GitHub", status: "success", duration: "12s" },
        { name: "Build", status: "success", duration: "1m 45s" },
        { name: "Test", status: "success", duration: "58s" },
        { name: "Docker", status: "success", duration: "45s" },
        { name: "Deploy", status: "success", duration: "52s" },
        { name: "Kubernetes", status: "success", duration: "40s" },
      ]);
      const p2Stages = JSON.stringify([
        { name: "GitHub", status: "success", duration: "10s" },
        { name: "Build", status: "success", duration: "55s" },
        { name: "Test", status: "running", duration: "—" },
        { name: "Docker", status: "queued", duration: "—" },
        { name: "Deploy", status: "queued", duration: "—" },
        { name: "Kubernetes", status: "queued", duration: "—" },
      ]);
      const p3Stages = JSON.stringify([
        { name: "GitHub", status: "success", duration: "8s" },
        { name: "Build", status: "success", duration: "2m 10s" },
        { name: "Test", status: "failed", duration: "1m 20s" },
        { name: "Docker", status: "skipped", duration: "—" },
        { name: "Deploy", status: "skipped", duration: "—" },
        { name: "Kubernetes", status: "skipped", duration: "—" },
      ]);

      await db.query(
        `INSERT INTO pipelines (id, name, status, last_run, duration, stages) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
        [
          "pipe-001", "Frontend CI/CD", "success", "2026-08-13 10:00", "4m 32s", p1Stages,
          "pipe-002", "API Gateway Pipeline", "running", "2026-08-13 11:00", "2m 15s", p2Stages,
          "pipe-003", "Infrastructure Deploy", "failed", "2026-08-12 18:30", "6m 10s", p3Stages,
        ]
      );
    }

    // Pipeline Runs
    const [runRows] = await db.query("SELECT COUNT(*) AS cnt FROM pipeline_runs");
    if (runRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO pipeline_runs (id, pipeline_name, status, branch, commit_hash, duration, date) VALUES
        ('run-001', 'Frontend CI/CD', 'success', 'main', 'a3f2b1c', '4m 32s', '2026-08-13 10:00'),
        ('run-002', 'API Gateway Pipeline', 'running', 'release/2.4', 'd7e4f9a', '2m 15s', '2026-08-13 11:00'),
        ('run-003', 'Infrastructure Deploy', 'failed', 'infra/update', 'b2c8d1e', '6m 10s', '2026-08-12 18:30'),
        ('run-004', 'Frontend CI/CD', 'success', 'develop', 'f1a9c3b', '3m 58s', '2026-08-12 14:20')
      `);
    }

    // Build history
    const [buildRows] = await db.query("SELECT COUNT(*) AS cnt FROM build_history");
    if (buildRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO build_history (id, commit_hash, branch, status, duration, date) VALUES
        ('build-1847', 'a3f2b1c', 'main', 'success', '4m 32s', '2026-08-13 10:00'),
        ('build-1846', 'd7e4f9a', 'release/2.4', 'running', '2m 15s', '2026-08-13 11:00'),
        ('build-1845', 'b2c8d1e', 'infra/update', 'failed', '6m 10s', '2026-08-12 18:30'),
        ('build-1844', 'f1a9c3b', 'develop', 'success', '3m 58s', '2026-08-12 14:20'),
        ('build-1843', 'e5d2a7f', 'main', 'success', '4m 01s', '2026-08-11 16:45')
      `);
    }

    // Infrastructure Resources
    const [infraRows] = await db.query("SELECT COUNT(*) AS cnt FROM infrastructure_resources");
    if (infraRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO infrastructure_resources (id, name, type, status, region, cpu, memory, cost) VALUES
        ('res-001', 'prod-api-server', 'EC2', 'running', 'ap-south-1', 45, 62, 4200),
        ('res-002', 'k8s-prod-cluster', 'Kubernetes', 'running', 'ap-south-1', 58, 71, 8500),
        ('res-003', 'api-gateway-container', 'Docker', 'running', 'ap-south-1', 22, 38, 1800),
        ('res-004', 'main-vpc', 'VPC', 'active', 'ap-south-1', 0, 0, 500),
        ('res-005', 'prod-alb', 'Load Balancer', 'active', 'ap-south-1', 15, 0, 2200),
        ('res-006', 'postgres-primary', 'Database', 'running', 'ap-south-1', 35, 55, 6800)
      `);
    }

    // Terraform configs
    const [tfRows] = await db.query("SELECT COUNT(*) AS cnt FROM terraform_configs");
    if (tfRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO terraform_configs (id, name, status, last_plan, resources, plan_output) VALUES
        ('tf-001', 'vpc-network', 'applied', '2026-08-12', 12, 'Terraform will perform actions: aws_vpc.main created.'),
        ('tf-002', 'k8s-cluster', 'applied', '2026-08-11', 28, 'Terraform cluster configuration verified. 0 changes.'),
        ('tf-003', 'rds-database', 'pending', '2026-08-13', 8, 'Terraform will perform the following actions: + aws_db_instance.postgres-primary')
      `);
    }

    // Kubernetes clusters & nodes
    const [k8sRows] = await db.query("SELECT COUNT(*) AS cnt FROM kubernetes_clusters");
    if (k8sRows[0].cnt === 0) {
      const [cRes] = await db.query(`
        INSERT INTO kubernetes_clusters (name, nodes, pods, services, status) VALUES
        ('prod-cluster', 6, 48, 12, 'healthy'),
        ('staging-cluster', 3, 22, 8, 'healthy')
      `);
      const prodClusterId = cRes.insertId;
      await db.query(`
        INSERT INTO kubernetes_nodes (cluster_id, name, status, cpu, memory, pods) VALUES
        (?, 'node-1', 'ready', 62, 74, 8),
        (?, 'node-2', 'ready', 55, 68, 7),
        (?, 'node-3', 'ready', 48, 61, 9)
      `, [prodClusterId, prodClusterId, prodClusterId]);
    }

    // Cost Budgets
    const [budgetRows] = await db.query("SELECT COUNT(*) AS cnt FROM cost_budgets");
    if (budgetRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO cost_budgets (budget, current, estimated, previous, daily, trend) VALUES
        (50000, 42580, 48200, 45100, 1420, -5.20)
      `);
    }

    // Optimization recommendations
    const [optRows] = await db.query("SELECT COUNT(*) AS cnt FROM optimization_recommendations");
    if (optRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO optimization_recommendations (id, title, description, savings, priority, status) VALUES
        ('opt-001', 'Stop unused EC2 instances', '3 instances idle for 30+ days', 8400, 'high', 'active'),
        ('opt-002', 'Reduce oversized resources', '2 instances running at <20% CPU', 5200, 'medium', 'active'),
        ('opt-003', 'Remove unused storage volumes', '5 unattached EBS volumes detected', 2100, 'medium', 'active'),
        ('opt-004', 'Optimize Kubernetes workloads', 'Right-size 8 over-provisioned pods', 3800, 'low', 'active')
      `);
    }

    // System logs
    const [logRows] = await db.query("SELECT COUNT(*) AS cnt FROM system_logs");
    if (logRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO system_logs (timestamp, service, level, message) VALUES
        ('2026-08-13 11:02:15', 'api-gateway', 'INFO', 'Request processed successfully — GET /api/v1/users'),
        ('2026-08-13 11:02:10', 'user-service', 'WARNING', 'Connection pool nearing capacity (85%)'),
        ('2026-08-13 11:01:55', 'payment-api', 'ERROR', 'Payment gateway timeout — retry attempt 2/3'),
        ('2026-08-13 11:01:40', 'k8s-prod-cluster', 'INFO', 'Pod frontend-app-7d4f scaled to 3 replicas'),
        ('2026-08-13 11:01:22', 'api-gateway', 'INFO', 'Health check passed — all endpoints responsive'),
        ('2026-08-13 11:00:58', 'postgres-primary', 'WARNING', 'Slow query detected — duration 2.4s'),
        ('2026-08-13 11:00:30', 'frontend-app', 'ERROR', 'Uncaught TypeError in dashboard component')
      `);
    }

    // Alerts
    const [alertRows] = await db.query("SELECT COUNT(*) AS cnt FROM alerts");
    if (alertRows[0].cnt === 0) {
      await db.query(`
        INSERT INTO alerts (id, severity, service, message, time, status) VALUES
        ('alert-001', 'critical', 'prod-cluster', 'High CPU usage detected', '22 min ago', 'active'),
        ('alert-002', 'warning', 'k8s-prod-cluster', 'Pod restart detected', '45 min ago', 'active'),
        ('alert-003', 'warning', 'api-gateway', 'API response time increased', '1 hr ago', 'active'),
        ('alert-004', 'info', 'payment-api', 'Scheduled maintenance in 2 hours', '2 hr ago', 'acknowledged')
      `);
    }

    console.log("Database schema initialization and baseline verification complete.");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

module.exports = initDb;
