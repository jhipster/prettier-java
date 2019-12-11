public class BinaryOperations {

  @Annotation("This operation with two very long string should break" + "in a very nice way")
  public String binaryOperationThatShouldBreak() {
    System.out.println("This operation with two very long string should break" + "in a very nice way");
    return "This operation with two very long string should break" + "in a very nice way";
  }

  @Annotation("This operation should" + "not break")
  public String binaryOperationThatShouldNotBreak() {
    System.out.println("This operation should" + "not break");
    return "This operation should" + "not break";
  }

  public int ternaryOperationThatShouldBreak() {
    int shortInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
    return thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne : thisIsAShortInteger;
  }

  public int ternaryOperationThatShouldBreak2() {
    int shortInteger = thisIsAVeryLongInteger ? thisIsAnotherVeryLongOne : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
    return thisIsAVeryLongInteger ? thisIsAnotherVeryLongOne : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
  }

  public int ternaryOperationThatShouldNotBreak() {
    int a = b ? b : c;
    return b ? b : c;
  }
}
