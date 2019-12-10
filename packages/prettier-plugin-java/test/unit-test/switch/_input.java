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

}
