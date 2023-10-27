/* eslint-disable no-console */
"use strict";
const cp = require("child_process");
const path = require("path");
const fs = require("fs-extra");

const samplesDir = path.resolve(__dirname, "../samples");

const core = [
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-bom",
    branch: "8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/spring-projects/spring-boot.git",
    branch: "v3.1.5"
  },
  {
    repoUrl: "https://github.com/iluwatar/java-design-patterns.git",
    branch: "1.25.0"
  }
];

const jhipster1 = [
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-microservice",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-oauth2",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-websocket",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-noi18n",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-hazelcast",
    branch: "v8.0.0-rc.1"
  }
];

const jhipster2 = [
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-elasticsearch",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-dto",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-cassandra",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-mongodb",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-react",
    branch: "v8.0.0-rc.1"
  }
];

let sampleRepos = core;
if (process.argv.length === 3) {
  switch (process.argv[2]) {
    case "e2e-core":
      break;
    case "e2e-jhipster1":
      sampleRepos = jhipster1;
      break;
    case "e2e-jhipster2":
      sampleRepos = jhipster2;
      break;
  }
}

fs.emptyDirSync(samplesDir);

sampleRepos.forEach(cloneRepo);

function cloneRepo({ repoUrl, branch, commitHash }) {
  console.log(`cloning ${repoUrl}`);
  if (commitHash) {
    cp.execSync(`git clone ${repoUrl} --branch ${branch}`, {
      cwd: samplesDir,
      stdio: [0, 1, 2]
    });
    cp.execSync(`git checkout ${commitHash}`, {
      cwd: path.resolve(samplesDir, repoUrl.split("/").pop()),
      stdio: [0, 1, 2]
    });
  } else {
    cp.execSync(`git clone ${repoUrl} --branch ${branch} --depth 1`, {
      cwd: samplesDir,
      stdio: [0, 1, 2]
    });
  }
}
