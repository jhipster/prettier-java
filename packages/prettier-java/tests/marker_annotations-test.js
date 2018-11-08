const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `@SingleMemberAnnotation2(
  name = "Something much long that breaks",
  date = "01/01/2018"
)
@SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
@NormalAnnotation("value")
@MarkerAnnotation
public class MarkerAnnotations {

  @SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
  )
  @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
  @NormalAnnotation("value")
  @MarkerAnnotation
  SomeService service;

  @SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
  )
  @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
  @NormalAnnotation("value")
  @MarkerAnnotation
  public void postConstruct() {
    System.out.println("post construct");
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  @SuppressWarnings2({ "rawtypes", "unchecked", "something", "something2", "something3", "something4" })
  public void elementValueArrayInitializer(){
    System.out.println("element value array initializer");
  }

  @ArrayInitializersWithKey(key = { "abc", "def" }, key2 = { "ghi", "jkl" }, key3 = { "mno", "pqr" })
  public void arrayInitializerWithKey(){
    System.out.println("element value array initializer with key");
  }

}
`;

  const expectedOutput = `@MarkerAnnotation
@NormalAnnotation("value")
@SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
@SingleMemberAnnotation2(
  name = "Something much long that breaks",
  date = "01/01/2018"
)
public class MarkerAnnotations {
  @MarkerAnnotation
  @NormalAnnotation("value")
  @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
  @SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
  )
  SomeService service;

  @MarkerAnnotation
  @NormalAnnotation("value")
  @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
  @SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
  )
  public void postConstruct() {
    System.out.println("post construct");
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  @SuppressWarnings2(
    {
      "rawtypes",
      "unchecked",
      "something",
      "something2",
      "something3",
      "something4"
    }
  )
  public void elementValueArrayInitializer() {
    System.out.println("element value array initializer");
  }

  @ArrayInitializersWithKey(
    key = { "abc", "def"
    },
    key2 = { "ghi", "jkl"
    },
    key3 = { "mno", "pqr"
    }
  )
  public void arrayInitializerWithKey() {
    System.out.println("element value array initializer with key");
  }

}

`;

  it("can format marker_annotations", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
