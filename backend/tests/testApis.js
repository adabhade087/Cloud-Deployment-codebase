/**
 * Comprehensive CloudForge API Test Suite
 */
require("dotenv").config();
const http = require("http");
const app = require("../src/server");
const initDb = require("../config/initDb");

let server;
let baseUrl;
let authToken = "";

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (authToken && !Object.prototype.hasOwnProperty.call(reqHeaders, "Authorization")) {
      reqHeaders.Authorization = `Bearer ${authToken}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, body: json });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING CLOUDFORGE BACKEND API TESTS ===\n");
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} - ${details}`);
      failed++;
    }
  }

  try {
    await initDb();

    // Start ephemeral test server on random port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server running at ${baseUrl}\n`);
        resolve();
      });
    });

    // 1. Health & DB
    const healthRes = await request("GET", "/api/health");
    assert("GET /api/health", healthRes.status === 200 && healthRes.body.success === true);

    const dbRes = await request("GET", "/api/db-test");
    assert("GET /api/db-test", dbRes.status === 200 && dbRes.body.success === true);

    // 2. Authentication
    const testEmail = `test_${Date.now()}@example.com`;
    const regRes = await request("POST", "/api/auth/register", {
      name: "API Tester",
      email: testEmail,
      password: "TestPassword@123",
      role: "developer",
    });
    assert("POST /api/auth/register (success)", regRes.status === 201 && regRes.body.success === true);

    // Duplicate register
    const dupRes = await request("POST", "/api/auth/register", {
      name: "API Tester",
      email: testEmail,
      password: "TestPassword@123",
    });
    assert("POST /api/auth/register (409 conflict)", dupRes.status === 409);

    // Login with wrong password
    const wrongLogin = await request("POST", "/api/auth/login", {
      email: testEmail,
      password: "WrongPassword@999",
    });
    assert("POST /api/auth/login (401 invalid creds)", wrongLogin.status === 401);

    // Login success
    const loginRes = await request("POST", "/api/auth/login", {
      email: testEmail,
      password: "TestPassword@123",
    });
    assert("POST /api/auth/login (200 success)", loginRes.status === 200 && !!loginRes.body.token);
    authToken = loginRes.body.token;

    // Logout
    const logoutRes = await request("POST", "/api/auth/logout");
    assert("POST /api/auth/logout (200 success)", logoutRes.status === 200 && logoutRes.body.success === true);

    // 3. User Profile & Preferences
    const profileRes = await request("GET", "/api/users/me");
    assert("GET /api/users/me (authenticated)", profileRes.status === 200 && profileRes.body.user.email === testEmail);

    const prefRes = await request("PUT", "/api/users/preferences", {
      theme: "dark",
      language: "en",
      timezone: "Asia/Kolkata",
      defaultLandingPage: "dashboard",
    });
    assert("PUT /api/users/preferences", prefRes.status === 200 && prefRes.body.success === true);

    // 4. Repositories
    const reposRes = await request("GET", "/api/repositories");
    assert("GET /api/repositories", reposRes.status === 200 && Array.isArray(reposRes.body.repositories));

    // 5. Deployments
    const depListRes = await request("GET", "/api/deployments");
    assert("GET /api/deployments", depListRes.status === 200 && Array.isArray(depListRes.body.deployments));

    const depCreateRes = await request("POST", "/api/deployments", {
      project: "api-gateway",
      environment: "Production",
      version: "v2.5.0",
      branch: "main",
    });
    assert("POST /api/deployments", depCreateRes.status === 201 && depCreateRes.body.deployment.project === "api-gateway");
    const createdDepId = depCreateRes.body.deployment.id;

    const depLogsRes = await request("GET", `/api/deployments/${createdDepId}/logs`);
    assert("GET /api/deployments/:id/logs", depLogsRes.status === 200 && depLogsRes.body.logs.length > 0);

    const envRes = await request("GET", "/api/deployments/environments");
    assert("GET /api/deployments/environments", envRes.status === 200 && Array.isArray(envRes.body.environments));

    const relRes = await request("GET", "/api/deployments/releases");
    assert("GET /api/deployments/releases", relRes.status === 200 && Array.isArray(relRes.body.releases));

    const rbRes = await request("POST", "/api/deployments/rollback", {
      project: "api-gateway",
      version: "v2.4.0",
    });
    assert("POST /api/deployments/rollback", rbRes.status === 200 && rbRes.body.success === true);

    // 6. Pipelines & CI/CD
    const pipeListRes = await request("GET", "/api/pipelines");
    assert("GET /api/pipelines", pipeListRes.status === 200 && Array.isArray(pipeListRes.body.pipelines));

    const pipeRunsRes = await request("GET", "/api/pipelines/runs");
    assert("GET /api/pipelines/runs", pipeRunsRes.status === 200 && Array.isArray(pipeRunsRes.body.runs));

    const buildsRes = await request("GET", "/api/pipelines/builds");
    assert("GET /api/pipelines/builds", buildsRes.status === 200 && Array.isArray(buildsRes.body.builds));

    const triggerBuildRes = await request("POST", "/api/pipelines/builds", {
      branch: "develop",
    });
    assert("POST /api/pipelines/builds", triggerBuildRes.status === 201 && !!triggerBuildRes.body.build.id);

    const pipeRunRes = await request("POST", "/api/pipelines/pipe-001/run");
    assert("POST /api/pipelines/:id/run", pipeRunRes.status === 200 && pipeRunRes.body.status === "running");

    const stageAdvanceRes = await request("POST", "/api/pipelines/pipe-001/stages/1/advance");
    assert("POST /api/pipelines/:id/stages/:index/advance", stageAdvanceRes.status === 200 && stageAdvanceRes.body.status === "success");

    // 7. Infrastructure & Kubernetes
    const infraRes = await request("GET", "/api/infrastructure/resources");
    assert("GET /api/infrastructure/resources", infraRes.status === 200 && Array.isArray(infraRes.body.resources));

    const provRes = await request("POST", "/api/infrastructure/resources", {
      type: "EC2",
      environment: "Staging",
      region: "ap-south-1",
    });
    assert("POST /api/infrastructure/resources", provRes.status === 201 && !!provRes.body.resource.id);
    const newResourceId = provRes.body.resource.id;

    const deprovRes = await request("DELETE", `/api/infrastructure/resources/${newResourceId}`);
    assert("DELETE /api/infrastructure/resources/:id", deprovRes.status === 200 && deprovRes.body.success === true);

    const tfListRes = await request("GET", "/api/infrastructure/terraform");
    assert("GET /api/infrastructure/terraform", tfListRes.status === 200 && Array.isArray(tfListRes.body.configs));

    const tfPlanRes = await request("POST", "/api/infrastructure/terraform/plan", {
      configName: "vpc-network",
    });
    assert("POST /api/infrastructure/terraform/plan", tfPlanRes.status === 200 && !!tfPlanRes.body.output);

    const tfApplyRes = await request("POST", "/api/infrastructure/terraform/apply", {
      configName: "vpc-network",
    });
    assert("POST /api/infrastructure/terraform/apply", tfApplyRes.status === 200 && tfApplyRes.body.success === true);

    const k8sClustersRes = await request("GET", "/api/infrastructure/kubernetes/clusters");
    assert("GET /api/infrastructure/kubernetes/clusters", k8sClustersRes.status === 200 && Array.isArray(k8sClustersRes.body.clusters));

    const k8sNodesRes = await request("GET", "/api/infrastructure/kubernetes/nodes");
    assert("GET /api/infrastructure/kubernetes/nodes", k8sNodesRes.status === 200 && Array.isArray(k8sNodesRes.body.nodes));

    // 8. Cost Management
    const costOverviewRes = await request("GET", "/api/cost/overview");
    assert("GET /api/cost/overview", costOverviewRes.status === 200 && !!costOverviewRes.body.cloudCostData);

    const costCalcRes = await request("POST", "/api/cost/calculate", {
      provider: "aws",
      region: "ap-south-1",
      compute: true,
      instanceSize: "large",
      storage: true,
      database: true,
      network: true,
    });
    assert("POST /api/cost/calculate", costCalcRes.status === 200 && costCalcRes.body.estimatedCost > 0);

    const getBudgetRes = await request("GET", "/api/cost/budget");
    assert("GET /api/cost/budget", getBudgetRes.status === 200 && getBudgetRes.body.budget > 0);

    const setBudgetRes = await request("POST", "/api/cost/budget", { amount: 65000 });
    assert("POST /api/cost/budget", setBudgetRes.status === 200 && setBudgetRes.body.budget === 65000);

    const optRes = await request("GET", "/api/cost/recommendations");
    assert("GET /api/cost/recommendations", optRes.status === 200 && Array.isArray(optRes.body.recommendations));

    // 9. Monitoring & Logs & Alerts
    const metricsRes = await request("GET", "/api/monitoring/metrics");
    assert("GET /api/monitoring/metrics", metricsRes.status === 200 && !!metricsRes.body.metrics.system);

    const logsRes = await request("GET", "/api/monitoring/logs");
    assert("GET /api/monitoring/logs", logsRes.status === 200 && Array.isArray(logsRes.body.logs));

    const postLogRes = await request("POST", "/api/monitoring/logs", {
      service: "api-test-service",
      level: "INFO",
      message: "Automated test log message",
    });
    assert("POST /api/monitoring/logs", postLogRes.status === 201 && postLogRes.body.success === true);

    const alertsRes = await request("GET", "/api/monitoring/alerts");
    assert("GET /api/monitoring/alerts", alertsRes.status === 200 && Array.isArray(alertsRes.body.alerts));

    const ackRes = await request("PUT", "/api/monitoring/alerts/alert-001/acknowledge");
    assert("PUT /api/monitoring/alerts/:id/acknowledge", ackRes.status === 200 && ackRes.body.status === "acknowledged");

    const monHealthRes = await request("GET", "/api/monitoring/health");
    assert("GET /api/monitoring/health", monHealthRes.status === 200 && Array.isArray(monHealthRes.body.healthChecks));

    // 10. Dashboard
    const dashRes = await request("GET", "/api/dashboard/summary");
    assert("GET /api/dashboard/summary", dashRes.status === 200 && !!dashRes.body.metrics.deployments);

    // 11. Security & Edge Cases
    const unauthRes = await request("GET", "/api/deployments", null, { Authorization: "" });
    assert("GET without token (401)", unauthRes.status === 401);

    const badTokenRes = await request("GET", "/api/deployments", null, { Authorization: "Bearer bogus-token" });
    assert("GET with bad token (401)", badTokenRes.status === 401);

    const notFoundRes = await request("GET", "/api/unknown-endpoint-xyz");
    assert("GET unknown endpoint (404)", notFoundRes.status === 404);

    console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    if (server) {
      server.close();
    }
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
