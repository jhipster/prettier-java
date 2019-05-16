public class BinaryOperations {

  public void binaryOperationThatShouldBreak() {
    System.out.println("This operation with two very long string should break" + "in a very nice way");
  }

  public void binaryOperationThatShouldNotBreak() {
    System.out.println("This operation should" + "not break");
  }

  public void ternaryOperationThatShouldBreak() {
    int shortInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
  }

  public void ternaryOperationThatShouldNotBreak() {
    int a = b ? b : c;
  }
}
