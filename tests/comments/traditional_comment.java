class EmptyComment {
  /**/
}

class MultiComments {
  /* Abc */
  /* XYZ */
  /* Something */
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
