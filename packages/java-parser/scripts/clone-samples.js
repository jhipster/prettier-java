/* eslint-disable no-console */
"use strict";
const cp = require("child_process");
const path = require("path");
const fs = require("fs-extra");

const samplesDir = path.resolve(__dirname, "../samples");

const sampleRepos = [
  {
    repoUrl: "https://github.com/iluwatar/java-design-patterns.git",
    branch: "1.20.0"
  },
  {
    repoUrl: "https://github.com/spring-projects/spring-boot.git",
    branch: "v2.1.0.RELEASE"
  },
  {
    repoUrl: "https://github.com/google/guava.git",
    branch: "v27.0.1"
  },
  {
    repoUrl: "https://github.com/spring-projects/spring-framework.git",
    branch: "v5.1.5.RELEASE"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-online",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-microservice",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-gateway",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-oauth2",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-websocket",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-noi18n",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-nocache",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-hazelcast",
    branch: "main"
  },

  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-elasticsearch",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-dto",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-couchbase",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-cassandra",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-mongodb",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-gradle",
    branch: "main"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-react",
    branch: "main"
  }
];

fs.emptyDirSync(samplesDir);

sampleRepos.forEach(cloneRepo);

function cloneRepo({ repoUrl, branch }) {
  console.log(`cloning ${repoUrl}`);
  cp.execSync(`git clone ${repoUrl} --branch ${branch} --depth 1`, {
    cwd: samplesDir,
    stdio: [0, 1, 2]
  });
}
