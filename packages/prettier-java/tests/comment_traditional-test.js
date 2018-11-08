const prettier = require("prettier");
const { expect } = require("chai");

describe("prettier-java", () => {
  const input = `/* PACKAGE 
   Another line
*/
package comments;

/* ABC */
class EmptyComment {
  /* */
}

/* BLUB */
class MultiComments {
  /* */
  /* Abc */
  /* XYZ */
  /* Something
     on two lines */
}

class MultiCommentsWithEmptyLines {
  /* Abc */

  /* XYZ */

  /* Something */
}

class MultiCommentsWithDeclarationsAfter {
  /* Abc */int i;
  
  /* XYZ */public void doSomething(int j) {
    System.out.println("do");
  }

  /* Something */
}

class MethodComment {
  public void doSomething1(int j) {
    /* Abc */
    System.out.println("do");



    /* XYZ */
    System.out.println("do");


    
  }

  public void doSomething2(int j) {



    /* Abc */
    System.out.println("do");



    /* XYZ */
    System.out.println("do");


    /* Something */ 
  }
}

/* Some
   comment */
interface InterfaceComment {
  /* comment */
  void doSomething();
}
`;

  const expectedOutput = `/* PACKAGE 
   Another line
*/
package comments;

/* ABC */
class EmptyComment {}

/* BLUB */
class MultiComments {
  /* Something
     on two lines */
}

class MultiCommentsWithEmptyLines {
  /* Abc */

  /* XYZ */

  /* Something */
}

class MultiCommentsWithDeclarationsAfter {
  /* Abc */
  int i;

  /* XYZ */
  public void doSomething(int j) {
    System.out.println("do");
  }

  /* Something */
}

class MethodComment {

  public void doSomething1(int j) {
    /* Abc */
    System.out.println("do");

    /* XYZ */
    System.out.println("do");
  }

  public void doSomething2(int j) {
    /* Abc */
    System.out.println("do");

    /* XYZ */
    System.out.println("do");

    /* Something */
  }

}

/* Some
   comment */
interface InterfaceComment {

  /* comment */
  void doSomething();

}

`;

  it("can format comment_traditional", () => {
    const actual = prettier.format(input, {
      parser: "java",
      plugins: ["./packages/prettier-java"]
    });

    expect(actual).to.deep.equal(expectedOutput);
  });
});
