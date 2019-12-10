public enum Enum {
  SOME_ENUM,
  ANOTHER_ENUM,
  LAST_ENUM
}

public enum EnumWithExtraSemicolon {
  SOME_ENUM,
  ANOTHER_ENUM,
  LAST_ENUM
}

public enum EnumWithExtraComma {
  SOME_ENUM,
  ANOTHER_ENUM,
  LAST_ENUM
}

public enum EnumWithExtraCommaAndExtraSemicolon {
  SOME_ENUM,
  ANOTHER_ENUM,
  LAST_ENUM
}

public enum EnumWithExtraCommaAndComment {
  SOME_ENUM,
  ANOTHER_ENUM,
  LAST_ENUM/* comment */
}

public enum EnumWithExtraSemicolonAndComment {
  SOME_ENUM,
  ANOTHER_ENUM,
  LAST_ENUM/* comment */
}

public enum EnumWithManyValues {
  ONE_VALUE,
  TWO_VALUE,
  THREE_VALUE,
  FOUR_VALUE,
  FIVE_VALUE,
  SIX_VALUE,
  SEVEN_VALUE,
  EIGTH_VALUE,
  NINE_VALUE,
  TEN_VALUE
}

public enum EnumWithManyValuesWithExtraSemicolon {
  ONE_VALUE,
  TWO_VALUE,
  THREE_VALUE,
  FOUR_VALUE,
  FIVE_VALUE,
  SIX_VALUE,
  SEVEN_VALUE,
  EIGTH_VALUE,
  NINE_VALUE,
  TEN_VALUE
}

public enum EnumWithManyValuesWithExtraComma {
  ONE_VALUE,
  TWO_VALUE,
  THREE_VALUE,
  FOUR_VALUE,
  FIVE_VALUE,
  SIX_VALUE,
  SEVEN_VALUE,
  EIGTH_VALUE,
  NINE_VALUE,
  TEN_VALUE
}

public enum EnumWithManyValuesWithExtraCommaAndExtraSemicolon {
  ONE_VALUE,
  TWO_VALUE,
  THREE_VALUE,
  FOUR_VALUE,
  FIVE_VALUE,
  SIX_VALUE,
  SEVEN_VALUE,
  EIGTH_VALUE,
  NINE_VALUE,
  TEN_VALUE
}

public enum EnumWithExtraCommaAndEnumBodyDeclarations {
  THIS_IS_GOOD("abc"),
  THIS_IS_FINE("abc");
  public static final String thisWillBeDeleted = "DELETED";
}

public enum Enum {
  THIS_IS_GOOD("abc"),
  THIS_IS_FINE("abc");
  public static final String thisWillBeDeleted = "DELETED";

  private final String value;

  public Enum(String value) {
    this.value = value;
  }

  public String toString() {
    return "STRING";
  }
}

class CLassWithEnum {

  public static enum VALID_THINGS {
    FIRST,
    SECOND
  }
}
