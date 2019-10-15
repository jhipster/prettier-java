public abstract class Return {

  Object returnThis() {
    return this;
  }

  Object returnNull() {
    return null;
  }

  void exit() {
    return;
  }

  Object returnCast() {
    return (BeanItemContainer<BEANTYPE>) super.getContainerDataSource();
  }

  Object returnSomethingWhichDoNotBreak() {
    return oneVariable + secondVariable;
  }

  Object returnSomethingWhichBreak() {
    return oneVariable + secondVariable + thirdVariable + fourthVariable + fifthVariable + sixthVariable + seventhVariable;
  }

  Object returnSomethingWhichBreakAndAlreadyInParenthesis() {
    return (
        oneVariable +
            secondVariable +
            thirdVariable +
            fourthVariable +
            fifthVariable +
            sixthVariable +
            seventhVariable
    );
  }

}
