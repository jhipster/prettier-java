/*eslint no-console: ["error", { allow: ["error"] }] */

import { expect } from "chai";
import { readFileSync, existsSync, removeSync, copySync } from "fs-extra";
import { resolve, relative, basename } from "path";
import klawSync from "klaw-sync";
import { spawnSync } from "child_process";

import { createPrettierDoc } from "../src/cst-printer";
import { parse } from "java-parser";
import { format, doc } from "prettier";

const { printDocToString } = doc.printer;

const pluginPath = resolve(__dirname, "../dist/index.js");
export function testSampleWithOptions({
  testFolder,
  exclusive,
  prettierOptions = {}
}: {
  testFolder: string;
  exclusive?: boolean;
  prettierOptions?: any;
}) {
  const itOrItOnly = exclusive ? it.only : it;
  const inputPath = resolve(testFolder, "_input.java");
  const expectedPath = resolve(testFolder, "_output.java");
  const relativeInputPath = relative(__dirname, inputPath);

  let inputContents: string;
  let expectedContents: string;

  // @ts-ignore
  before(() => {
    inputContents = readFileSync(inputPath, "utf8");
    expectedContents = readFileSync(expectedPath, "utf8");
  });

  itOrItOnly(`can format <${relativeInputPath}>`, async () => {
    const actual = await format(inputContents, {
      parser: "java",
      plugins: [pluginPath],
      ...prettierOptions
    });

    expect(actual).to.equal(expectedContents);
  });

  it(`Performs a stable formatting for <${relativeInputPath}>`, async () => {
    const onePass = await format(inputContents, {
      parser: "java",
      plugins: [pluginPath],
      ...prettierOptions
    });

    const secondPass = await format(onePass, {
      parser: "java",
      plugins: [pluginPath],
      ...prettierOptions
    });
    expect(onePass).to.equal(secondPass);
  });
}

export function testSample(testFolder: string, exclusive?: boolean) {
  testSampleWithOptions({ testFolder, exclusive });
}

export function testRepositorySample(
  testFolder: string,
  command: string,
  args: string[]
) {
  describe(`Prettify the repository <${testFolder}>`, function () {
    this.timeout(0);

    const testsamples = resolve(__dirname, "../test-samples");
    const samplesDir = resolve(testsamples, basename(testFolder));

    if (existsSync(samplesDir)) {
      removeSync(samplesDir);
    }
    copySync(testFolder, samplesDir);

    const sampleFiles = klawSync(resolve(__dirname, samplesDir), {
      nodir: true
    });
    const javaSampleFiles = sampleFiles.filter(fileDesc =>
      fileDesc.path.endsWith(".java")
    );

    javaSampleFiles.forEach(fileDesc => {
      it(`Performs a stable formatting for <${relative(
        samplesDir,
        fileDesc.path
      )}>`, async () => {
        const javaFileText = readFileSync(fileDesc.path, "utf8");

        const onePass = await format(javaFileText, {
          parser: "java",
          plugins: [pluginPath]
        });
        const secondPass = await format(onePass, {
          parser: "java",
          plugins: [pluginPath]
        });
        expect(onePass).to.equal(secondPass);
      });
    });

    it(`verify semantic validity ${testFolder}`, function () {
      const code = spawnSync(command, args, {
        cwd: samplesDir,
        maxBuffer: Infinity
      });
      if (code.status !== 0) {
        expect.fail(
          `Cannot build ${testFolder}, please check the output below:\n` +
            code.error ?? code.stderr
        );
      }
    });
  });
}

export async function formatJavaSnippet({
  snippet,
  entryPoint,
  prettierOptions = {}
}: {
  snippet: string;
  entryPoint: string;
  prettierOptions?: any;
}) {
  const node = parse(snippet, entryPoint);
  const options = {
    printWidth: 80,
    tabWidth: 2,
    trailingComma: "none",
    useTabs: false,
    ...prettierOptions
  };
  const doc = await createPrettierDoc(node, options);
  return await printDocToString(doc, options).formatted;
}

export async function expectSnippetToBeFormatted({
  snippet,
  expectedOutput,
  entryPoint,
  prettierOptions = {}
}: {
  snippet: string;
  expectedOutput: string;
  entryPoint: string;
  prettierOptions?: any;
}) {
  const onePass = await formatJavaSnippet({
    snippet,
    entryPoint,
    prettierOptions
  });
  const secondPass = await formatJavaSnippet({
    snippet: onePass,
    entryPoint,
    prettierOptions
  });

  expect(onePass).to.equal(expectedOutput);
  expect(secondPass).to.equal(expectedOutput);
}
