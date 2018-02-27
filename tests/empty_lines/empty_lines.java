class EmptyClass  {
  




}

class EmptyLinesAtBeginning {





  int i;
}

class EmptyLinesAtEnd {
  int i;




}

class EmptyLinesBetween {
  
  int i;


  
  int j;

}

class EmptyLinesInFrontOfMethod {
  

  void doSomething() {}
}

class EmptyLinesAfterOfMethod {
  void doSomething() {}



}

class NoEmptyLinesBetweenTwoMethods {
  void doSomething() {}
  void doElse() {}
}

class NoEmptyLinesBetweenFieldDeclarationAndMethod {
  int i;
  void doElse() {}
}

class EmptyLinesBetweenFieldDeclarationAndMethod {

  int i;


  
  void doElse() {}
}

class MethodEmptyClass  {
  
  void method() {




  }

}

class MethodEmptyLinesAtBeginning {

  void method() {



    int i;
  }
}

class MethodEmptyLinesAtEnd {

  void method() {
    int i;


  }

}

class MethodEmptyLinesBetween {

  void method() {
  
    int i;


    
    int j;

  }

}
