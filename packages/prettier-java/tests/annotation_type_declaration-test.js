const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `public @interface AnnotationTypeDeclaration {
    public String value() default "";
}`;

  const expectedOutput = `public @interface AnnotationTypeDeclaration {
  public String value() default "";
}
`;

  it("can format annotation_type_declaration", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
