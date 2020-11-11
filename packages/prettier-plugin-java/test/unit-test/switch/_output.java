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
    switch (answer) {
      case "YES":
        return "YES";
      default:
        return "NO";
    }
  }

  // Switch rules
  static void howManyAgain(int k) {
    switch (k) {
      case 1 -> System.out.println("one");
      case 2 -> {
        System.out.println("two");
      }
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
}
