"use strict";

const _ = require("lodash");
const path = require("path");
const klawSync = require("klaw-sync");
const { expect } = require("chai");
const fs = require("fs");
const javaParser = require("../src/index");

describe("The Java Parser", () => {
  createSampleSpecs("java-design-patterns");
  createSampleSpecs("spring-boot");
  createFailingSampleSpec("guava", 22, 0);
});

function createSampleSpecs(sampleName) {
  context(sampleName + " samples", () => {
    const samplesDir = path.resolve(__dirname, "../samples/" + sampleName);
    const sampleFiles = klawSync(samplesDir, { nodir: true });
    const javaSampleFiles = sampleFiles.filter(fileDesc =>
      fileDesc.path.endsWith(".java")
    );

    if (_.isEmpty(sampleFiles)) {
      throw `Missing sample-dir: <${samplesDir}> did you forget to clone the samples?`;
    }
    _.forEach(javaSampleFiles, fileDesc => {
      const relativePath = path.relative(__dirname, fileDesc.path);
      it(`Can Parse <${relativePath}>`, () => {
        const sampleText = fs.readFileSync(fileDesc.path, "utf8");
        expect(() => javaParser.parse(sampleText)).to.not.throw();
      });
    });
  });
}

function createFailingSampleSpec(sampleName, failAllowed, timeout) {
  context(sampleName + " samples", () => {
    const samplesDir = path.resolve(__dirname, "../samples/" + sampleName);
    const sampleFiles = klawSync(samplesDir, { nodir: true });
    const javaSampleFiles = sampleFiles.filter(fileDesc =>
      fileDesc.path.endsWith(".java")
    );

    if (_.isEmpty(sampleFiles)) {
      throw `Missing sample-dir: <${samplesDir}> did you forget to clone the samples?`;
    }

    const errors = [];
    it(`Can Parse ${sampleName} repository`, function() {
      if (timeout !== undefined) {
        this.timeout(timeout);
      }

      _.forEach(javaSampleFiles, fileDesc => {
        const relativePath = path.relative(__dirname, fileDesc.path);
        const sampleText = fs.readFileSync(fileDesc.path, "utf8");

        try {
          javaParser.parse(sampleText);
        } catch (error) {
          errors.push(relativePath);
        }
      });

      expect(errors.length, `Can not Parse ${errors}`).to.equal(failAllowed);
    });
  });
}
