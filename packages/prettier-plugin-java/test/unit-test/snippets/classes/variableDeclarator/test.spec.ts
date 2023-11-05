import { expect } from "chai";
import { formatJavaSnippet } from "../../../../test-utils.js";

describe("VariableDeclarator", () => {
  it("should format a variable declaration", async () => {
    const snippet = "i=1";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "i = 1";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format a variable declaration with an array initialisation", async () => {
    const snippet = "i={alpha}";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "i = { alpha }";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should not add a blank line with an array initialisation that break", async () => {
    const snippet =
      "i={alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa, lambda, mu, nu, xi}";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents =
      "i = {\n  alpha,\n  beta,\n  gamma,\n  delta,\n  epsilon,\n  zeta,\n  eta,\n  theta,\n  iota,\n  kappa,\n  lambda,\n  mu,\n  nu,\n  xi\n}";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format a variable declaration with a lambda", async () => {
    const snippet = "lambda= test -> {}";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "lambda = test -> {}";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should not add a blank line with a lambda that break", async () => {
    const snippet = "lambda= test -> {int i;}";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "lambda = test -> {\n  int i;\n}";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format a variable declaration with a ternary expression", async () => {
    const snippet = "value= bool ? one : two";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "value = bool ? one : two";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should not add a blank line with a ternary expression that break", async () => {
    const snippet =
      "value = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents =
      "value = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne\n  ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne\n  : thisIsAShortInteger";
    expect(formattedText).to.equal(expectedContents);
  });
  it("should format comment on its own line between equal and variable initializer", async () => {
    const snippet = "value = \n// comment2\n 1";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "value =\n  // comment2\n  1";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format comments on several lines between equal and variable initializer", async () => {
    const snippet = "value = // comment1\n// comment2\n 1";
    const entryPoint = "variableDeclarator";

    const formattedText = await formatJavaSnippet({ snippet, entryPoint });
    const expectedContents = "value = // comment1\n  // comment2\n  1";
    expect(formattedText).to.equal(expectedContents);
  });
});
