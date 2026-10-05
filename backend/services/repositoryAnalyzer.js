const getGitHubRepositoryInfo = (url) => {
  const parsedUrl = new URL(url);
  const parts = parsedUrl.pathname.split("/").filter(Boolean);

  return {
    owner: parts[0],
    repo: parts[1],
  };
};

const getGitHubContents = async (url, branch) => {
  const { owner, repo } = getGitHubRepositoryInfo(url);

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}/contents?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to read GitHub repository contents (${response.status})`
    );
  }

  return response.json();
};

const getGitHubFile = async (url, branch, fileName) => {
  const { owner, repo } = getGitHubRepositoryInfo(url);

  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(
      owner
    )}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(
      fileName
    )}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (!data.content) {
    return null;
  }

  return Buffer.from(data.content, "base64").toString("utf-8");
};

const detectProject = async (url, branch) => {
  const contents = await getGitHubContents(url, branch);

  const files = contents
    .filter((item) => item.type === "file")
    .map((item) => item.name.toLowerCase());

  // Java
  if (
    files.includes("pom.xml") ||
    files.includes("build.gradle") ||
    files.includes("build.gradle.kts")
  ) {
    let framework = "Java";

    const pomContent = await getGitHubFile(url, branch, "pom.xml");

    if (
      pomContent &&
      (
        pomContent.includes("spring-boot") ||
        pomContent.includes("springframework")
      )
    ) {
      framework = "Spring Boot";
    }

    return {
      language: "Java",
      framework,
      buildTool: files.includes("pom.xml") ? "Maven" : "Gradle",
      template: "java",
    };
  }

  // Node.js / React
  if (files.includes("package.json")) {
    let framework = "Node.js";

    const packageContent = await getGitHubFile(
      url,
      branch,
      "package.json"
    );

    if (packageContent) {
      try {
        const packageJson = JSON.parse(packageContent);

        const dependencies = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {}),
        };

        if (dependencies.react) {
          framework = "React";
        } else if (dependencies.express) {
          framework = "Node.js / Express";
        } else if (dependencies.next) {
          framework = "Next.js";
        }
      } catch (error) {
        console.error("package.json parsing error:", error.message);
      }
    }

    return {
      language: "JavaScript",
      framework,
      buildTool: "npm",
      template: "node",
    };
  }

  // Python
  if (
    files.includes("requirements.txt") ||
    files.includes("pyproject.toml")
  ) {
    let framework = "Python";

    const requirements = await getGitHubFile(
      url,
      branch,
      "requirements.txt"
    );

    if (requirements) {
      const lowerRequirements = requirements.toLowerCase();

      if (lowerRequirements.includes("django")) {
        framework = "Django";
      } else if (lowerRequirements.includes("flask")) {
        framework = "Flask";
      } else if (lowerRequirements.includes("fastapi")) {
        framework = "FastAPI";
      }
    }

    return {
      language: "Python",
      framework,
      buildTool: "pip",
      template: "python",
    };
  }

  // Go
  if (files.includes("go.mod")) {
    return {
      language: "Go",
      framework: "Go",
      buildTool: "Go Modules",
      template: "go",
    };
  }

  return {
    language: "Unknown",
    framework: "Unknown",
    buildTool: "Unknown",
    template: null,
  };
};

module.exports = {
  detectProject,
};