class ClassEmpty  {
  




}

class ClassEmptyLinesAtBeginning {





  int i;
}

class ClassEmptyLinesAtEnd {
  int i;




}

class ClassEmptyLinesBetween {
  
  int i;


  
  int j;

}

class ClassEmptyLinesInFrontOfMethod {
  

  void doSomething() {}
}

class ClassEmptyLinesAfterOfMethod {
  void doSomething() {}



}

class ClassNoEmptyLinesBetweenTwoMethods {
  void doSomething() {}
  void doElse() {}
}

class ClassNoEmptyLinesBetweenFieldDeclarationAndMethod {
  int i;
  void doElse() {}
}

class ClassEmptyLinesBetweenFieldDeclarationAndMethod {

  int i;


  
  void doElse() {}
}

class ClassMethodEmpty  {
  
  void method() {




  }

}

class ClassMethodEmptyLinesAtBeginning {

  void method() {



    int i;
  }
}

class ClassMethodEmptyLinesAtEnd {

  void method() {
    int i;


  }

}

class ClassMethodEmptyLinesBetween {

  void method() {
  
    int i;


    
    int j;

  }

}

interface InterfaceEmpty  {
  




}

interface InterfaceEmptyLinesAtBeginning {





  int i = 1;
}

interface InterfaceEmptyLinesAtEnd {
  int i = 1;




}

interface InterfaceEmptyLinesBetween {
  
  int i = 1;


  
  int j = 2;

}

interface InterfaceEmptyLinesInFrontOfMethod {
  

  void doSomething();
}

interface InterfaceEmptyLinesAfterOfMethod {
  void doSomething();



}

interface InterfaceNoEmptyLinesBetweenTwoMethods {
  void doSomething();
  void doElse();
}

interface InterfaceNoEmptyLinesBetweenFieldDeclarationAndMethod {
  int i = 1;
  void doElse();
}

interface InterfaceEmptyLinesBetweenFieldDeclarationAndMethod {

  int i = 1;


  
  void doElse();
}

interface InterfaceMethodEmpty  {
  
  default void method() {




  }

}

interface InterfaceMethodEmptyLinesAtBeginning {

  default void method() {



    int i;
  }
}

interface InterfaceMethodEmptyLinesAtEnd {

  default void method() {
    int i;


  }

}

interface InterfaceMethodEmptyLinesBetween {

  default void method() {
  
    int i;


    
    int j;

  }

}

