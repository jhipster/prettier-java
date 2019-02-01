/* eslint no-console: 0 */
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
