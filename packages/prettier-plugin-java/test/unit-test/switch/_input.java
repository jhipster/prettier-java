class Switch {

    void simple(Answer answer) {
        switch (answer) {
            case YES:
                System.out.println("YES");
                break;
            case NO:
                System.out.println("NO");
                break;
            default:
                break;
        }
    }

    // Bug fix: #276
    public int method() {
      switch ("abc") {
        case "a":
          return 1;
        case "b":
          return 2;
        case "c":
          return 3;
        // default case
        default:
          return 3;
      }
    }

    // Bug fix: #276
    public int method2() {
      switch ("abc") {
        case "a":
          return 1;
        case "b":
          return 2;
        // case c
        case "c":
          return 3;
        default:
          return 3;
      }
  }

  // Bug fix: #357
  public String shouldWrapEvenForSmallSwitchCases() {
    switch (answer) { case "YES": return "YES"; default: return "NO"; }
  }

  void switchCaseWithBlock1() {
    switch (a) {
      case 0: {}
      default: {}
    }
  }

  void switchCaseWithBlock2() {
    switch (a) {
      case 0: { b(); }
      default: { c(); }
    }
  }

  void switchCaseWithBlock3() {
    switch (a) {
      case 0: { b(); } { c(); }
      default: { d(); } { e(); }
    }
  }

  void switchCaseWithBlock4() {
    switch (a) {
      case 0: b(); { c(); }
      default: d(); { e(); }
    }
  }

  void switchCaseWithBlock5() {
    switch (a) {
      case 0: { b(); } c();
      default: { d(); } e();
    }
  }

  // Switch rules
  static void howManyAgain(int k) {
        switch (k) {
      case 1 -> System.out.println("one");
      case 2 -> {System.out.println("two");}
      case 3 -> throw new Exception(e);
      default -> throw new Exception(e);
    }
    }


    public Location getAdjacentLocation(Direction direction) {
    switch (direction) {
      case NORTH:
        return new Location(this.x, this.y - SnakeUtils.GRID_SIZE);
      case SOUTH:
        return new Location(this.x, this.y + SnakeUtils.GRID_SIZE);
      case EAST:
        return new Location(this.x + SnakeUtils.GRID_SIZE, this.y);
      case WEST:
        return new Location(this.x - SnakeUtils.GRID_SIZE, this.y);
      case NONE:
      // fall through
      default:
        return this;
    }
  }

  public void multipleCaseConstants(TestEnum testEnum) {
    switch (testEnum) {
      case FOO -> System.out.println("Foo!");
        case BAR, BAZ -> System.out.println("Not Foo!");
      case BAR, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ, BAZ -> System.out.println("Not Foo!");

    }
  }

  public void caseConstantsWithComments(TestEnum testEnum) {
    switch (testEnum) {
        case BAR /* foo */, BAZ -> System.out.println("Not Foo!");
        case BAR /* foo */, /* bar */ BAZ -> System.out.println("Not Foo!");
        case BAR, /* bar */ BAZ -> System.out.println("Not Foo!");

    }
  }

    static String formatterPatternSwitchRules(Object o) {
        return switch (o) {
            case

                Integer i ->


                String.format("int %d", i);
                    case Long l    -> String.format("long %d", l);
            case Double d  -> String.format("double %f", d);
            case String s  -> String.format("String %s", s);
            case TOTO  -> String.format("TOTO %s", o);
            case null -> String.format("Null !");
            case null, default -> String.format("Default !");
                    default        -> o.toString();
        };
    }

    static String formatterPatternSwitch(Object o) {
        return switch (o) {
            case Integer i :
                yield  "It is an integer";
            case Double d :
                case String s:
                yield  "It is an integer";
        };
    }

    static String shouldFormatSwitchBlocksWithEmptyLastBlock(Object o) {
        switch (state) {
            case READY:
                return true;
            case DONE:
                return false;
            default:


        }

        log.info("Done !");

    }

  void switchRulesWithComments() {
    switch (a) {
      case b ->
        // comment
        c;
      case Dd d ->
        // comment
        e;
      case f ->
        // comment
        throw new RuntimeException();
    }
  }
}
