public class BinaryOperations {

  public void binaryOperationThatShouldBreak() {
    System.out.println("This operation with two very long string should break" + "in a very nice way");
  }

  public void binaryOperationThatShouldNotBreak() {
    System.out.println("This operation should" + "not break");
  }

  public void assigmentOperationThatShouldBreak() {
    thisIsAVeryVeryLongInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne + thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;

    thisIsAVeryVeryLongInteger = a + thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
  }

  public void assigmentOperationThatShouldNotBreak() {
    shortInteger = thisIsAShortInteger;
  }

  public void variableDeclaratorThatShouldBreak() {
    int thisIsAVeryVeryLongInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne + thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne + thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;

    int thisIsAVeryVeryLongInteger = a + thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
  }

  public void variableDeclaratorThatShouldNotBreak() {
    int shortInteger = thisIsAShortInteger;
  }

  public void ternaryOperationThatShouldBreak() {
    int shortInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
  }

  public void ternaryOperationThatShouldNotBreak() {
    int a = b ? b : c;
  }
}
