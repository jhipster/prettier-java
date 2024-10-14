public class BinaryOperations {

  public void binaryOperation() {
    int alpha = (left) << right;
    boolean beta = (left) < right;
  }

  @Annotation(
    "This operation with two very long string should break" +
    "in a very nice way"
  )
  public String binaryOperationThatShouldBreak() {
    System.out.println(
      "This operation with two very long string should break" +
      "in a very nice way"
    );
    return (
      "This operation with two very long string should break" +
      "in a very nice way"
    );
  }

  @Annotation("This operation should" + "not break")
  public String binaryOperationThatShouldNotBreak() {
    System.out.println("This operation should" + "not break");
    return "This operation should" + "not break";
  }

  public int ternaryOperationThatShouldBreak() {
    int shortInteger = thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne
      ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne
      : thisIsAShortInteger;
    return thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne
      ? thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne
      : thisIsAShortInteger;
  }

  public int ternaryOperationThatShouldBreak2() {
    int shortInteger = thisIsAVeryLongInteger
      ? thisIsAnotherVeryLongOne
      : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
    return thisIsAVeryLongInteger
      ? thisIsAnotherVeryLongOne
      : thisIsAnotherVeryLongIntegerThatIsEvenLongerThanFirstOne;
  }

  public int ternaryOperationThatShouldNotBreak() {
    int a = b ? b : c;
    return b ? b : c;
  }

  public boolean binaryOperationWithComments() {
    boolean a =
      one ||
      two >> 1 || // one
      // five
      // two
      // three
      // four
      three;

    boolean b =
      one ||
      two >> 1 || // one
      // two
      // three
      three;

    boolean c =
      one ||
      two >> 1 || // one
      // two
      // three
      three;

    return a || b || c;
  }

  public void method() {
    new Foo(stuff, thing, "auaaaaaaaaa some very long stuff", "some more").bar(
      10
    );
    foo(stuff, thing, "some very longuuuuuuuuuuuuuu stuff", "some more").bar(
      10
    );
  }

  public void binaryExpressionWithCast() {
    double availability12 =
      (double) successfulCount / (successfulCount + failureCount);
    availability12 =
      (double) successfulCount / (successfulCount + failureCount);
  }

  void declarationVsAssignment() {
    var lineLengthInAssignmentMoreThanPrintWidth =
      "1234567890" +
      "1234567890" +
      "1234567890" +
      "1234567890" +
      "1234567890" +
      "1234567890";
    lineLengthInAssignmentMoreThanPrintWidth =
      "1234567890" +
      "1234567890" +
      "1234567890" +
      "1234567890" +
      "1234567890" +
      "1234567890";

    aaaaaaaaaa +=
      bbbbbbbbbbb +
      ccccccccccc +
      ddddddddddd +
      eeeeeeeeee +
      ffffffffff +
      gggggggggg;
    aaaaaaaaaa %=
      bbbbbbbbbbb +
      ccccccccccc +
      ddddddddddd +
      eeeeeeeeee +
      ffffffffff +
      gggggggggg;
    aaaaaaaaaa <<=
      bbbbbbbbbbb +
      ccccccccccc +
      ddddddddddd +
      eeeeeeeeee +
      ffffffffff +
      gggggggggg;
    aaaaaaaaaa &=
      bbbbbbbbbbb +
      ccccccccccc +
      ddddddddddd +
      eeeeeeeeee +
      ffffffffff +
      gggggggggg;

    var aaaaaaaaaa = bbbbbbbbbb || cccccccccc
      ? dddddddddd + eeeeeeeeee
      : ffffffffff + gggggggggg;
    aaaaaaaaaa = bbbbbbbbbb || cccccccccc
      ? dddddddddd + eeeeeeeeee
      : ffffffffff + gggggggggg;

    var something = MyClass.staticFunction(
      aaaaaaaaaa,
      bbbbbbbbbbb,
      ccccccccccc,
      ddddddddddd
    );
    something = MyClass.staticFunction(
      aaaaaaaaaa,
      bbbbbbbbbbb,
      ccccccccccc,
      ddddddddddd
    );

    var something =
      MyClass.staticFunction(
        aaaaaaaaaa,
        bbbbbbbbbbb,
        ccccccccccc,
        ddddddddddd
      ) +
      0;
    something =
      MyClass.staticFunction(
        aaaaaaaaaa,
        bbbbbbbbbbb,
        ccccccccccc,
        ddddddddddd
      ) +
      0;

    var something12 = new MyClass(
      aaaaaaaaaa,
      bbbbbbbbbbb,
      ccccccccccc,
      ddddddddddd
    );
    something12 = new MyClass(
      aaaaaaaaaa,
      bbbbbbbbbbb,
      ccccccccccc,
      ddddddddddd
    );
  }

  void parentheses() {
    var result = (a + b) >>> 1;
    var sizeIndex = ((index - 1) >>> level) & MASK;
    var from = offset > left ? 0 : (left - offset) >> level;
    var to = (right - offset) >> (level + 1);
    if (rawIndex < 1 << (list._level + SHIFT)) {}
    var res = size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
    sign = (1 - 2 * b[3]) >> 7;
    exponent = ((b[3] << 1) & 0xff) | (b[2] >> (7 - 127));
    mantissa = (b[2] & (0x7f << 16)) | (b[1] << 8) | b[0];

    ((2 / 3) * 10) / 2 + 2;
    (2 * 3 * 10) / 2 + 2;
    var rotateX =
      (RANGE / rect.height) * refY -
      (RANGE / 2) * getXMultiplication(rect.width);
    var rotateY =
      (RANGE / rect.width) * refX -
      (RANGE / 2) * getYMultiplication(rect.width);

    (a % 10) - 5;
    a - (10 % 5);
    (a * b) % 10;
    (a % b) * 10;
    a % 10 > 5;
    a % 10 == 0;

    ((1 << 2) >>> 3) >> 4;
    ((1 >>> 2) >> 3) << 4;

    1 << (2 + 3);
    1 >> (2 - 3);
    1 >>> (2 * 3);
    (1 / 2) << 3;
    (1 + 2) >> 3;
    (1 - 2) >>> 3;

    (x == y) == z;
    (x != y) == z;
    (x == y) != z;
    (x != y) != z;

    1 & (2 == 3);

    if (
      (aaaaaaaaaa + bbbbbbbbbb == cccccccccc + dddddddddd &&
        eeeeeeeeee + ffffffffff == gggggggggg + hhhhhhhhhh) ||
      iiiiiiiiii
    ) {}

    if (
      (((((a * b + c) << d < e == f) & g) ^ h) | i && j) ||
      (k && l | (m ^ (n & (o != p > q >> (r - s / t)))))
    ) {}

    if (
      (aaaaaaaaaa + bbbbbbbbbb == cccccccccc + dddddddddd &&
        eeeeeeeeee + ffffffffff == gggggggggg + hhhhhhhhhh) ||
      (iiiiiiiiii + jjjjjjjjjj == kkkkkkkkkk + llllllllll &&
        mmmmmmmmmm + nnnnnnnnnn == oooooooooo + pppppppppp) ||
      (qqqqqqqqqq + rrrrrrrrrr == ssssssssss + tttttttttt &&
        uuuuuuuuuu + vvvvvvvvvv == wwwwwwwwww + xxxxxxxxxxx)
    ) {}
  }
}
