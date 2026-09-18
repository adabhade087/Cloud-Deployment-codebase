// API service layer — mock implementations ready for backend replacement

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAuthHeaders = () => {
  const stored = localStorage.getItem("nexuscloud_auth");

  if (!stored) {
    return {};
  }

  try {
    const auth = JSON.parse(stored);

    if (!auth.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${auth.token}`,
    };
  } catch {
    return {};
  }
};

export const api = {
  async login(email, password) {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  },

  async signup(data) {
    const { firstName, lastName, email, password, confirmPassword } = data;

    if (!firstName || !lastName || !email || !password) {
      throw new Error("All fields are required");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }

    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registration failed");
    }

    // Register, then immediately log the user in
    return await this.login(email, password);
  },
  async getRepositories() {
    const response = await fetch("http://localhost:5000/api/repositories", {
      headers: {
        ...getAuthHeaders(),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch repositories");
    }

    return data;
  },
  async addRepository({ url, branch }) {
    const response = await fetch("http://localhost:5000/api/repositories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        url,
        branch,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to add repository");
    }

    return data;
  },

  async deploy(config) {
    await delay(2000);
    return {
      success: true,
      deployment: {
        id: `dep-${Date.now()}`,
        project: config.project,
        environment: config.environment,
        version: config.version,
        branch: config.branch,
        status: "success",
        deployedAt: new Date().toLocaleString(),
        deployedBy: "Anuj M.",
      },
    };
  },

  async rollback(project, version) {
    await delay(1500);
    return { success: true, message: `Rolled back ${project} to ${version}` };
  },

  async runPipeline(pipelineId) {
    await delay(500);
    return { success: true, pipelineId, status: "running" };
  },

  async advancePipelineStage(stageIndex) {
    await delay(800);
    return { success: true, stageIndex, status: "success" };
  },

  async provisionInfrastructure(config) {
    await delay(2500);
    return {
      success: true,
      resource: {
        id: `res-${Date.now()}`,
        name: `${config.environment.toLowerCase()}-${config.type.toLowerCase().replace(/\s/g, "-")}`,
        type: config.type,
        status: "running",
        region: config.region,
        cpu: Math.floor(Math.random() * 40) + 10,
        memory: Math.floor(Math.random() * 50) + 20,
        cost: Math.floor(Math.random() * 5000) + 1000,
      },
    };
  },

  async terraformPlan(configName) {
    await delay(1800);
    return {
      success: true,
      output: `Terraform will perform the following actions:\n\n  # ${configName}\n  ~ aws_instance.main\n      ~ instance_type: "t3.small" -> "t3.medium"\n\nPlan: 0 to add, 1 to change, 0 to destroy.`,
    };
  },

  async terraformApply(configName) {
    await delay(2500);
    return {
      success: true,
      message: `Terraform apply completed for ${configName}`,
    };
  },

  async acknowledgeAlert(alertId) {
    await delay(600);
    return { success: true, alertId, status: "acknowledged" };
  },

  calculateCost(config) {
    const {
      provider,
      region,
      compute,
      storage,
      database,
      network,
      instanceSize,
    } = config;
    const pricing = {
      aws: {
        compute: { small: 3500, medium: 7200, large: 14500 },
        storage: 800,
        database: 4500,
        network: 1200,
      },
      gcp: {
        compute: { small: 3200, medium: 6800, large: 13800 },
        storage: 750,
        database: 4200,
        network: 1100,
      },
      azure: {
        compute: { small: 3400, medium: 7000, large: 14200 },
        storage: 780,
        database: 4400,
        network: 1150,
      },
    };
    const regionMultiplier = {
      "ap-south-1": 1.0,
      "us-east-1": 0.95,
      "eu-west-1": 1.05,
      "ap-southeast-1": 1.02,
    };
    const p = pricing[provider] || pricing.aws;
    const mult = regionMultiplier[region] || 1.0;

    let total = 0;
    if (compute) total += p.compute[instanceSize || "medium"];
    if (storage) total += p.storage;
    if (database) total += p.database;
    if (network) total += p.network;

    return Math.round(total * mult);
  },

  async setBudget(amount) {
    await delay(800);
    return { success: true, budget: amount };
  },
};
