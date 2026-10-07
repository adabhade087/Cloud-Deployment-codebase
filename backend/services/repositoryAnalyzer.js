/**
 * Repository Analyzer Service for CloudForge / NexusCloud
 *
 * Inspects GitHub repositories using the GitHub API to detect:
 * - Programming language
 * - Framework
 * - Project type (frontend, backend, fullstack, container, etc.)
 * - Package manager
 * - Build command
 * - Start command
 * - Output directory
 * - Dockerfile availability
 * - Deployment readiness
 */

/**
 * Extracts owner and repository name from GitHub URLs.
 * Handles HTTPS, SSH, and URLs with or without .git extension.
 */
function parseGitHubUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const trimmed = url.trim().replace(/\/+$/, "");

    // Handle SSH format: git@github.com:owner/repo(.git)
    const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
    if (sshMatch) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }

    // Handle HTTPS format: https://github.com/owner/repo(.git)
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase().includes("github.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/i, "");
        return { owner, repo };
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Analyzes repository file list and file contents to detect project architecture.
 * This core engine is pure and can run with live GitHub contents or mock test files.
 *
 * @param {Array<string|object>} files - Array of filenames or file objects ({ name, type })
 * @param {Function} [fetchFileContent] - Async function (filename) => Promise<string|null>
 * @returns {Promise<object>} Structured analysis result
 */
async function analyzeRepositoryContents(files, fetchFileContent = async () => null) {
  const fileMap = new Map();
  for (const item of files) {
    const name = typeof item === "string" ? item : item.name;
    if (name) {
      fileMap.set(name.toLowerCase(), name);
    }
  }

  const hasDockerfile = fileMap.has("dockerfile");

  // -------------------------------------------------------------
  // 1. NODE.JS / JAVASCRIPT / TYPESCRIPT
  // -------------------------------------------------------------
  if (fileMap.has("package.json")) {
    let pkg = {};
    const pkgRaw = await fetchFileContent(fileMap.get("package.json"));
    if (pkgRaw) {
      try {
        pkg = typeof pkgRaw === "string" ? JSON.parse(pkgRaw) : pkgRaw;
      } catch (e) {
        console.warn("Failed to parse package.json:", e.message);
      }
    }

    // Lockfile detection
    let packageManager = "npm";
    if (fileMap.has("pnpm-lock.yaml")) {
      packageManager = "pnpm";
    } else if (fileMap.has("yarn.lock")) {
      packageManager = "yarn";
    } else if (fileMap.has("bun.lockb") || fileMap.has("bun.lock")) {
      packageManager = "bun";
    } else if (fileMap.has("package-lock.json")) {
      packageManager = "npm";
    } else if (pkg.packageManager && typeof pkg.packageManager === "string") {
      const pm = pkg.packageManager.toLowerCase();
      if (pm.startsWith("pnpm")) packageManager = "pnpm";
      else if (pm.startsWith("yarn")) packageManager = "yarn";
      else if (pm.startsWith("bun")) packageManager = "bun";
      else packageManager = "npm";
    }

    const installCommand = `${packageManager} install`;
    const scripts = pkg.scripts || {};
    const deps = pkg.dependencies || {};
    const devDeps = pkg.devDependencies || {};
    const allDeps = { ...deps, ...devDeps };

    const isTypeScript = Boolean(
      allDeps["typescript"] ||
      fileMap.has("tsconfig.json") ||
      fileMap.has("tsconfig.app.json")
    );
    const language = isTypeScript ? "TypeScript" : "JavaScript";

    // Framework detection
    let framework = "Node.js";
    let projectType = "backend";
    let outputDirectory = null;
    let buildCommand = scripts.build ? `${packageManager} run build` : null;
    let startCommand = scripts.start ? `${packageManager} start` : null;
    let deployable = true;

    // React + Vite
    if (allDeps["vite"] && (allDeps["react"] || allDeps["react-dom"])) {
      framework = "React + Vite";
      projectType = "frontend";
      outputDirectory = "dist";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = null;
      deployable = true;
    }
    // Vue + Vite
    else if (allDeps["vite"] && allDeps["vue"]) {
      framework = "Vue + Vite";
      projectType = "frontend";
      outputDirectory = "dist";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = null;
      deployable = true;
    }
    // Next.js
    else if (allDeps["next"]) {
      framework = "Next.js";
      projectType = "fullstack";
      outputDirectory = ".next";
      buildCommand = scripts.build ? `${packageManager} run build` : `${packageManager} run build`;
      startCommand = scripts.start ? `${packageManager} start` : `${packageManager} start`;
      deployable = true;
    }
    // Generic Vite
    else if (allDeps["vite"]) {
      framework = "Vite";
      projectType = "frontend";
      outputDirectory = "dist";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = null;
      deployable = true;
    }
    // Create React App
    else if (allDeps["react-scripts"]) {
      framework = "React (Create React App)";
      projectType = "frontend";
      outputDirectory = "build";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = null;
      deployable = true;
    }
    // Standalone React
    else if (allDeps["react"] || allDeps["react-dom"]) {
      framework = "React";
      projectType = "frontend";
      outputDirectory = scripts.build ? "dist" : null;
      buildCommand = scripts.build ? `${packageManager} run build` : null;
      startCommand = null;
      deployable = true;
    }
    // Express
    else if (allDeps["express"]) {
      framework = "Express";
      projectType = "backend";
      outputDirectory = null;
      buildCommand = scripts.build ? `${packageManager} run build` : null;
      startCommand = scripts.start
        ? `${packageManager} start`
        : (pkg.main ? `node ${pkg.main}` : "node index.js");
      deployable = true;
    }
    // NestJS
    else if (allDeps["@nestjs/core"]) {
      framework = "NestJS";
      projectType = "backend";
      outputDirectory = "dist";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = scripts["start:prod"]
        ? `${packageManager} run start:prod`
        : (scripts.start ? `${packageManager} start` : "node dist/main.js");
      deployable = true;
    }
    // Nuxt.js
    else if (allDeps["nuxt"] || allDeps["nuxt3"]) {
      framework = "Nuxt.js";
      projectType = "fullstack";
      outputDirectory = ".output";
      buildCommand = scripts.build ? `${packageManager} run build` : `${packageManager} run build`;
      startCommand = scripts.start ? `${packageManager} start` : "node .output/server/index.mjs";
      deployable = true;
    }
    // Svelte / SvelteKit
    else if (allDeps["@sveltejs/kit"]) {
      framework = "SvelteKit";
      projectType = "fullstack";
      outputDirectory = ".svelte-kit";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = scripts.start ? `${packageManager} start` : null;
      deployable = true;
    }
    // Astro
    else if (allDeps["astro"]) {
      framework = "Astro";
      projectType = "frontend";
      outputDirectory = "dist";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = null;
      deployable = true;
    }
    // Remix
    else if (allDeps["@remix-run/react"] || allDeps["@remix-run/node"]) {
      framework = "Remix";
      projectType = "fullstack";
      outputDirectory = "build";
      buildCommand = scripts.build ? `${packageManager} run build` : "npm run build";
      startCommand = scripts.start ? `${packageManager} start` : "npm start";
      deployable = true;
    }
    // Fastify
    else if (allDeps["fastify"]) {
      framework = "Fastify";
      projectType = "backend";
      outputDirectory = null;
      buildCommand = scripts.build ? `${packageManager} run build` : null;
      startCommand = scripts.start ? `${packageManager} start` : (pkg.main ? `node ${pkg.main}` : "node server.js");
      deployable = true;
    }
    // Koa
    else if (allDeps["koa"]) {
      framework = "Koa";
      projectType = "backend";
      outputDirectory = null;
      buildCommand = scripts.build ? `${packageManager} run build` : null;
      startCommand = scripts.start ? `${packageManager} start` : (pkg.main ? `node ${pkg.main}` : "node app.js");
      deployable = true;
    }
    // Generic Node
    else {
      framework = "Node.js";
      projectType = scripts.build && !scripts.start ? "frontend" : "backend";
      outputDirectory = scripts.build ? "dist" : null;
      buildCommand = scripts.build ? `${packageManager} run build` : null;
      startCommand = scripts.start
        ? `${packageManager} start`
        : (pkg.main ? `node ${pkg.main}` : null);
      deployable = Boolean(scripts.build || scripts.start || pkg.main);
    }

    return {
      language,
      framework,
      projectType,
      packageManager,
      installCommand,
      buildCommand,
      startCommand,
      outputDirectory,
      hasDockerfile,
      deployable,
    };
  }

  // -------------------------------------------------------------
  // 2. PYTHON (manage.py, requirements.txt, pyproject.toml)
  // -------------------------------------------------------------
  if (
    fileMap.has("manage.py") ||
    fileMap.has("requirements.txt") ||
    fileMap.has("pyproject.toml") ||
    fileMap.has("pipfile")
  ) {
    const isPoetry = fileMap.has("poetry.lock");
    const isPipenv = fileMap.has("pipfile.lock");
    const packageManager = isPoetry ? "poetry" : (isPipenv ? "pipenv" : "pip");

    let installCommand = "pip install -r requirements.txt";
    if (isPoetry) installCommand = "poetry install";
    else if (isPipenv) installCommand = "pipenv install";
    else if (!fileMap.has("requirements.txt") && fileMap.has("pyproject.toml")) {
      installCommand = "pip install .";
    }

    // Django check: manage.py presence is authoritative
    if (fileMap.has("manage.py")) {
      return {
        language: "Python",
        framework: "Django",
        projectType: "backend",
        packageManager,
        installCommand,
        buildCommand: "python manage.py collectstatic --noinput",
        startCommand: "python manage.py runserver 0.0.0.0:8000",
        outputDirectory: null,
        hasDockerfile,
        deployable: true,
      };
    }

    // Check requirements or pyproject content for FastAPI / Flask
    let reqContent = "";
    if (fileMap.has("requirements.txt")) {
      reqContent = (await fetchFileContent(fileMap.get("requirements.txt"))) || "";
    } else if (fileMap.has("pyproject.toml")) {
      reqContent = (await fetchFileContent(fileMap.get("pyproject.toml"))) || "";
    }

    const lowerReq = String(reqContent).toLowerCase();
    let framework = "Python";
    let startCommand = "python main.py";

    if (lowerReq.includes("fastapi")) {
      framework = "FastAPI";
      startCommand = "uvicorn main:app --host 0.0.0.0 --port 8000";
    } else if (lowerReq.includes("flask")) {
      framework = "Flask";
      startCommand = "python app.py";
    } else if (lowerReq.includes("django")) {
      framework = "Django";
      startCommand = "python manage.py runserver 0.0.0.0:8000";
    }

    return {
      language: "Python",
      framework,
      projectType: "backend",
      packageManager,
      installCommand,
      buildCommand: null,
      startCommand,
      outputDirectory: null,
      hasDockerfile,
      deployable: true,
    };
  }

  // -------------------------------------------------------------
  // 3. JAVA (pom.xml, build.gradle, build.gradle.kts)
  // -------------------------------------------------------------
  if (fileMap.has("pom.xml")) {
    const pomContent = (await fetchFileContent(fileMap.get("pom.xml"))) || "";
    const isSpringBoot = String(pomContent).toLowerCase().includes("spring-boot");

    return {
      language: "Java",
      framework: isSpringBoot ? "Spring Boot" : "Java (Maven)",
      projectType: "backend",
      packageManager: "Maven",
      installCommand: "mvn clean install -DskipTests",
      buildCommand: "mvn package -DskipTests",
      startCommand: "java -jar target/*.jar",
      outputDirectory: "target",
      hasDockerfile,
      deployable: true,
    };
  }

  if (fileMap.has("build.gradle") || fileMap.has("build.gradle.kts")) {
    const gradleFile = fileMap.get("build.gradle") || fileMap.get("build.gradle.kts");
    const gradleContent = (await fetchFileContent(gradleFile)) || "";
    const isSpringBoot = String(gradleContent).toLowerCase().includes("spring-boot");

    return {
      language: "Java",
      framework: isSpringBoot ? "Spring Boot" : "Java (Gradle)",
      projectType: "backend",
      packageManager: "Gradle",
      installCommand: "./gradlew build -x test",
      buildCommand: "./gradlew build",
      startCommand: "java -jar build/libs/*.jar",
      outputDirectory: "build/libs",
      hasDockerfile,
      deployable: true,
    };
  }

  // -------------------------------------------------------------
  // 4. GO (go.mod)
  // -------------------------------------------------------------
  if (fileMap.has("go.mod")) {
    const modContent = (await fetchFileContent(fileMap.get("go.mod"))) || "";
    const lower = String(modContent).toLowerCase();
    let framework = "Go";
    if (lower.includes("github.com/gin-gonic/gin")) {
      framework = "Gin";
    } else if (lower.includes("github.com/gofiber/fiber")) {
      framework = "Fiber";
    } else if (lower.includes("github.com/labstack/echo")) {
      framework = "Echo";
    }

    return {
      language: "Go",
      framework,
      projectType: "backend",
      packageManager: "go modules",
      installCommand: "go mod download",
      buildCommand: "go build -o app",
      startCommand: "./app",
      outputDirectory: null,
      hasDockerfile,
      deployable: true,
    };
  }

  // -------------------------------------------------------------
  // 5. RUST (Cargo.toml)
  // -------------------------------------------------------------
  if (fileMap.has("cargo.toml")) {
    const cargoContent = (await fetchFileContent(fileMap.get("cargo.toml"))) || "";
    const lower = String(cargoContent).toLowerCase();
    let framework = "Rust (Cargo)";
    if (lower.includes("actix-web")) {
      framework = "Actix Web";
    } else if (lower.includes("axum")) {
      framework = "Axum";
    } else if (lower.includes("rocket")) {
      framework = "Rocket";
    }

    return {
      language: "Rust",
      framework,
      projectType: "backend",
      packageManager: "cargo",
      installCommand: "cargo fetch",
      buildCommand: "cargo build --release",
      startCommand: "./target/release/app",
      outputDirectory: "target/release",
      hasDockerfile,
      deployable: true,
    };
  }

  // -------------------------------------------------------------
  // 6. DOCKERFILE ONLY
  // -------------------------------------------------------------
  if (hasDockerfile) {
    return {
      language: "Docker",
      framework: "Docker Container",
      projectType: "container",
      packageManager: null,
      installCommand: null,
      buildCommand: "docker build -t app .",
      startCommand: "docker run -p 8080:8080 app",
      outputDirectory: null,
      hasDockerfile: true,
      deployable: true,
    };
  }

  // -------------------------------------------------------------
  // 7. UNSUPPORTED / UNKNOWN
  // -------------------------------------------------------------
  return {
    language: "Unknown",
    framework: "Unknown",
    projectType: "unknown",
    packageManager: null,
    installCommand: null,
    buildCommand: null,
    startCommand: null,
    outputDirectory: null,
    hasDockerfile: false,
    deployable: false,
    reason:
      "No supported project configuration files found (package.json, requirements.txt, manage.py, pom.xml, go.mod, Cargo.toml, or Dockerfile).",
  };
}

/**
 * Connects to GitHub API using user's OAuth access token,
 * fetches repository contents, and executes the analyzer.
 *
 * @param {object} params
 * @param {string} params.url - GitHub repository URL
 * @param {string} [params.branch='main'] - Git branch name
 * @param {string} params.accessToken - GitHub OAuth access token
 * @returns {Promise<object>} Result { success: true, analysis } or { success: false, error, message }
 */
async function analyzeGitHubRepository({ url, branch = "main", accessToken }) {
  if (!accessToken) {
    return {
      success: false,
      error: "GITHUB_NOT_CONNECTED",
      message: "GitHub account not connected. Please connect your GitHub account in Settings.",
    };
  }

  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return {
      success: false,
      error: "INVALID_URL",
      message: "Invalid GitHub repository URL format.",
    };
  }

  const { owner, repo } = parsed;
  const targetBranch = branch || "main";

  // Common headers for GitHub REST API
  const baseHeaders = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "NexusCloud-CloudForge",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  try {
    // 1. Fetch root directory contents
    const contentsUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents?ref=${encodeURIComponent(targetBranch)}`;
    const res = await fetch(contentsUrl, { headers: baseHeaders });

    // Handle GitHub API errors
    if (!res.ok) {
      const remainingRate = res.headers.get("x-ratelimit-remaining");
      if (res.status === 403 && (remainingRate === "0" || res.statusText.toLowerCase().includes("rate limit"))) {
        return {
          success: false,
          error: "GITHUB_RATE_LIMIT",
          message: "GitHub API rate limit exceeded. Please try again later.",
        };
      }

      if (res.status === 401 || res.status === 403) {
        return {
          success: false,
          error: "REPOSITORY_ACCESS_DENIED",
          message: "Access to repository denied by GitHub. Please verify your permissions.",
        };
      }

      if (res.status === 404) {
        return {
          success: false,
          error: "REPOSITORY_NOT_FOUND",
          message: `GitHub repository '${owner}/${repo}' on branch '${targetBranch}' not found.`,
        };
      }

      if (res.status >= 500) {
        return {
          success: false,
          error: "GITHUB_API_FAILURE",
          message: "GitHub API service is currently unavailable.",
        };
      }

      let errBody;
      try {
        errBody = await res.json();
      } catch {
        errBody = {};
      }

      return {
        success: false,
        error: "ANALYSIS_FAILURE",
        message: errBody.message || `GitHub returned status ${res.status}`,
      };
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      return {
        success: false,
        error: "UNSUPPORTED_REPOSITORY",
        message: "Repository contents could not be retrieved as a directory listing.",
      };
    }

    // Helper to fetch file content on demand (e.g. package.json, requirements.txt)
    const fetchFileContent = async (fileName) => {
      try {
        const fileUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(fileName)}?ref=${encodeURIComponent(targetBranch)}`;
        const fileRes = await fetch(fileUrl, {
          headers: {
            ...baseHeaders,
            Accept: "application/vnd.github.raw+json",
          },
        });

        if (!fileRes.ok) {
          return null;
        }

        const text = await fileRes.text();
        return text;
      } catch (err) {
        console.warn(`Could not fetch file ${fileName}:`, err.message);
        return null;
      }
    };

    // Run core analysis
    const analysis = await analyzeRepositoryContents(items, fetchFileContent);

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error("Repository analysis error:", error);
    return {
      success: false,
      error: "ANALYSIS_FAILURE",
      message: error.message || "An unexpected error occurred during repository analysis.",
    };
  }
}

module.exports = {
  parseGitHubUrl,
  analyzeRepositoryContents,
  analyzeGitHubRepository,
};
