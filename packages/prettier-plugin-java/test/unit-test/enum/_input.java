public enum Enum {

  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM;

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
