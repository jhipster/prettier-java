"use strict";

const { execSync } = require("child_process");
const { entrypoint } = require("./packages/prettier-plugin-java/src/options");
const tasks = arr => arr.join(" && ");

function checkEntrypointOptions() {
  const missingRules = [];
  const rules = execSync(
    `sed -nE 's/.*RULE\\("([^"]+)".*/\\1/p' $(ls packages/java-parser/src/productions/*)`
  )
    .toString()
    .split("\n");
  const optionRules = [];
  entrypoint.choices.forEach(wrappedRule =>
    optionRules.push(wrappedRule.value)
  );
  rules.forEach(rule => {
    if (!optionRules.includes(rule) && rule !== "") {
      missingRules.push(rule);
    }
  });
  if (missingRules.length === 0) return `echo No entrypoint rule is missing.`;
  return `echo "\\e[31mMissing rule(s) in entrypoint options ${JSON.stringify(
    missingRules
  )}.\\e[0m" && false`;
}

module.exports = {
  hooks: {
    "pre-commit": tasks(["lint-staged", checkEntrypointOptions()])
  }
};
