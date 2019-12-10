/* eslint no-console: 0 */
"use strict";
const cp = require("child_process");
const path = require("path");
const fs = require("fs-extra");

const samplesDir = path.resolve(__dirname, "../samples");

const core = [
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/spring-projects/spring-boot.git",
    branch: "v2.1.0.RELEASE"
  },
  {
    repoUrl: "https://github.com/iluwatar/java-design-patterns.git",
    branch: "1.20.0"
  }
];

const jhipster1 = [
  {
    repoUrl: "https://github.com/jhipster/jhipster-online",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-microservice",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-gateway",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-oauth2",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-websocket",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-noi18n",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-nocache",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-hazelcast",
    branch: "master"
  }
];

const jhipster2 = [
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-elasticsearch",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-dto",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-couchbase",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-cassandra",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-mongodb",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-gradle",
    branch: "master"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-react",
    branch: "master"
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

function cloneRepo({ repoUrl, branch }) {
  console.log(`cloning ${repoUrl}`);
  cp.execSync(`git clone ${repoUrl} --branch ${branch} --depth 1`, {
    cwd: samplesDir,
    stdio: [0, 1, 2]
  });
}
