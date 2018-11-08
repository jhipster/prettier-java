const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `// ABC
class EmptyComment {
  //    
}

// BLUB
class MultiComments {
  //
  // Abc
  // XYZ
  // Something
}

class MultiCommentsWithEmptyLines {
  // Abc

  // XYZ

  // Something
}

class MultiCommentsWithDeclarationsAfter {
  // Abc
  int i;



  // XYZ
  public void doSomething(int j) {
    System.out.println("do");
  }

  
  // Something
}

class MethodComment {
  public void doSomething1(int j) {
    // Abc
    System.out.println("do");



    // XYZ
    System.out.println("do");


    
  }

  public void doSomething2(int j) {



    // Abc
    System.out.println("do");



    // XYZ
    System.out.println("do");


    // Something    
  }
}

// Some comment
interface InterfaceComment {
  // comment
  void doSomething();
}

class IfStatementInlineComment {
  void testMethod() throws Exception {
    String x;
    if (true
        // this is a sample comment
        || true) {
      x = "foo";
    }
  }
}
`;

  const expectedOutput = `// ABC
class EmptyComment {}

// BLUB
class MultiComments {
  // Something
}

class MultiCommentsWithEmptyLines {
  // Abc

  // XYZ

  // Something
}

class MultiCommentsWithDeclarationsAfter {
  // Abc
  int i;

  // XYZ
  public void doSomething(int j) {
    System.out.println("do");
  }

  // Something
}

class MethodComment {

  public void doSomething1(int j) {
    // Abc
    System.out.println("do");

    // XYZ
    System.out.println("do");
  }

  public void doSomething2(int j) {
    // Abc
    System.out.println("do");

    // XYZ
    System.out.println("do");

    // Something
  }

}

// Some comment
interface InterfaceComment {

  // comment
  void doSomething();

}

class IfStatementInlineComment {

  void testMethod() throws Exception {
    String x;
    if (true // this is a sample comment
    || true) {
      x = "foo";
    }
  }

}

`;

  it("can format comment_line", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
