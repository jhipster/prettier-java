/* eslint-disable no-console */
import cp from "child_process";
import path from "path";
import fs from "fs-extra";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const samplesDir = path.resolve(__dirname, "../samples");

const sampleRepos = [
  {
    repoUrl: "https://github.com/iluwatar/java-design-patterns.git",
    branch: "1.25.0"
  },
  {
    repoUrl: "https://github.com/spring-projects/spring-boot.git",
    branch: "v3.1.5"
  },
  {
    repoUrl: "https://github.com/google/guava.git",
    branch: "v32.1.3"
  },
  {
    repoUrl: "https://github.com/spring-projects/spring-framework.git",
    branch: "v6.0.13"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-bom",
    branch: "8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-online",
    branch: "v2.25.0"
  },
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
  },

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
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-gradle",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/jhipster/jhipster-sample-app-react",
    branch: "v8.0.0-rc.1"
  },
  {
    repoUrl: "https://github.com/nipafx/demo-java-x",
    branch: "main",
    commitHash: "b9facd7bae57512793af4e197446d8064318bf04"
  }
];

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
