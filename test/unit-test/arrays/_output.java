class Array {

  boolean[] skip = new boolean[candidates.length];

  Class<?> aaaaaaaaaaaaaaaa =
    new Aaaaaaaaaaaaaaaa<Bbbbbbbbbbbbbbbb>[1].getClass();
  Class<?> aaaaaaaaaaaaaaaa =
    new Aaaaaaaaaaaaaaaa[1111111111111111111].getClass();
  Class<?> aaaaaaaaaaaaaaaa = new Aaaaaaaaaaaaaaaa[] {
    new Aaaaaaaaaaaaaaaa(),
  }.getClass();

  String[] DATA = {
    // nothing yet
  };

  Weather currentWeather = enumValues[
    (currentWeather.ordinal() + 1) % enumValues.length
  ];

  int @Nullable [] array;

  int[] empty = {};

  int[] emptyWithComments = {
    // dangling comment
  };

  int[] shortArray = { 1, 2, 3, 4, 5 };

  int[] longArray = {
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25,
  };

  int[] variousBases = {
    0b1010, 0xFF, 0123, 3.14159f, 2.71828d, 100L, 0b1101, 0xABC, 0456, 1.41421f,
    1.61803d, 200L, 0b1111, 0x7F, 0777, 9.80665f, 6.62607d, 300L,
  };

  int[] signedNumbers = {
    -1, +2, -42, +100, -3.14, -500, +600, -7000, +80, -90, +101, -202, +303,
    -404, +505, -606,
  };

  int[] signedWithComment = {
    -1,
    -(/* negative two */ 2),
    +3,
    -4,
    +5,
    -6,
    +7,
    -8,
    +9,
    -10,
  };

  int[] withBlankLines = {
    1, 2, 3, 4, 5,

    6, 7, 8, 9, 10,

    11, 12, 13, 14, 15,
  };

  int[] withTrailingComments = {
    1, // comment on one
    2, // comment on two
    3,
  };

  int[] withLeadingComments = {
    1,
    // comment before 3
    3, 4,
  };

  Object[] mixedArray = {
    1,
    "hello",
    true,
    null,
    2,
    "world",
    false,
    3,
    "foo",
    true,
    4,
    "bar",
    false,
  };

  int[] expressionArray = {
    1 + 1,
    2 * 3,
    getValue(),
    4 + 4,
    5 * 5,
    getData(),
    6 + 6,
    7 * 7,
    compute(),
  };

  int[][] nestedSingular = { { 1 }, { 2 }, { 3 } };

  int[][] nestedMultiple = {
    { 1, 2 },
    { 3, 4 },
    { 5, 6 },
  };

  int[] arrayWithInternalNodeComment = {
    1, 2, 3,
    // internal node comment
  };
}
