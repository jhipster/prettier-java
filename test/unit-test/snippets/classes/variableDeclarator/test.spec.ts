import { expect } from "chai";
import { formatJavaSnippet } from "../../../../test-utils.js";

describe("VariableDeclarator", () => {
  it("should format a variable declaration", async () => {
    const snippet = "int i=1;";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents = "int i = 1;\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format a variable declaration with an array initialisation", async () => {
    const snippet = "int[]i={alpha};";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents = "int[] i = {alpha};\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should not add a blank line with an array initialisation that break", async () => {
    const snippet =
      "int[]i={alpha, beta, gamma, delta, epsilon, zeta, eta, theta, iota, kappa, lambda, mu, nu, xi};";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents =
      "int[] i = {\n  alpha,\n  beta,\n  gamma,\n  delta,\n  epsilon,\n  zeta,\n  eta,\n  theta,\n  iota,\n  kappa,\n  lambda,\n  mu,\n  nu,\n  xi,\n};\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format a variable declaration with a lambda", async () => {
    const snippet = "Function<Void>lambda= test -> {};";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents = "Function<Void> lambda = test -> {};\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should not add a blank line with a lambda that break", async () => {
    const snippet = "Function<Void>lambda= test -> {int i;};";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents =
      "Function<Void> lambda = test -> {\n  int i;\n};\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format a variable declaration with a ternary expression", async () => {
    const snippet = "int value= bool ? one : two;";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents = "int value = bool ? one : two;\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should not add a blank line with a ternary expression that break", async () => {
    const snippet =
      "int value = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents =
      "int value = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne\n  ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne\n  : thisIsAShortInteger;\n";
    expect(formattedText).to.equal(expectedContents);
  });
  it("should format comment on its own line between equal and variable initializer", async () => {
    const snippet = "int value = \n// comment2\n 1;";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents = "int value =\n  // comment2\n  1;\n";
    expect(formattedText).to.equal(expectedContents);
  });

  it("should format comments on several lines between equal and variable initializer", async () => {
    const snippet = "int value = // comment1\n// comment2\n 1;";

    const formattedText = await formatJavaSnippet({ snippet });
    const expectedContents = "int value = // comment1\n  // comment2\n  1;\n";
    expect(formattedText).to.equal(expectedContents);
  });
});
