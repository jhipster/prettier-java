public enum EnumWhichNotBreak {

  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM

}

public enum EnumWhichNotBreakWithExtraSemicolon {

  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM;

}

public enum EnumWhichBreak {

  ONE_VALUE, TWO_VALUE, THREE_VALUE, FOUR_VALUE, FIVE_VALUE, SIX_VALUE, SEVEN_VALUE, EIGTH_VALUE, NINE_VALUE,
  TEN_VALUE

}

public enum EnumWhichBreakWithExtraSemicolon {

  ONE_VALUE, TWO_VALUE, THREE_VALUE, FOUR_VALUE, FIVE_VALUE, SIX_VALUE, SEVEN_VALUE, EIGTH_VALUE, NINE_VALUE,
  TEN_VALUE;

}

public enum Enum {

  THIS_IS_GOOD("abc"), THIS_IS_FINE("abc");

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

    FIRST, SECOND

  }

}
