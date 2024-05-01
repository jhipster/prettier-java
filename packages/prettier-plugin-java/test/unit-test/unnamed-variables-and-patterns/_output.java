class T {

  static int count(Iterable<Order> orders) {
    int total = 0;
    for (Order _ : orders) total++; // Unnamed variable
    return total;
  }

  void simpleForLoop() {
    for (int i = 0, _ = sideEffect(); i < 10; i++) {}
  }

  void assignment() {
    while (q.size() >= 3) {
      var x = q.remove();
      var y = q.remove();
      var _ = q.remove(); // Unnamed variable
    }
  }

  void multipleAssignment() {
    while (q.size() >= 3) {
      var x = q.remove();
      var _ = q.remove(); // Unnamed variable
      var _ = q.remove(); // Unnamed variable
    }
  }

  void catchClause() {
    try {
      int i = Integer.parseInt(s);
    } catch (NumberFormatException _) { // Unnamed variable
      System.out.println("Bad number: " + s);
    }
  }

  void multipleCatchClauses() {
    try {} catch (Exception _) {} catch (Throwable _) {} // Unnamed variable // Unnamed variable
  }

  void tryWithResources() {
    try (var _ = ScopedContext.acquire()) { // Unnamed variable
    }
  }

  void lambda() {
    stream.collect(Collectors.toMap(String::toUpperCase, _ -> "NODATA")); // Unnamed variable
  }

  void switchTypePattern() {
    switch (ball) {
      case RedBall _ -> process(ball); // Unnamed pattern variable
      case BlueBall _ -> process(ball); // Unnamed pattern variable
      case GreenBall _ -> stopProcessing(); // Unnamed pattern variable
    }
  }

  void switchRecordPattern() {
    switch (box) {
      case Box(RedBall _) -> processBox(box); // Unnamed pattern variable
      case Box(BlueBall _) -> processBox(box); // Unnamed pattern variable
      case Box(GreenBall _) -> stopProcessing(); // Unnamed pattern variable
      case Box(var _) -> pickAnotherBox(); // Unnamed pattern variable
    }
  }

  void multipleSwitchPatterns() {
    switch (box) {
      case Box(RedBall _), Box(BlueBall _) -> processBox(box);
      case Box(GreenBall _) -> stopProcessing();
      case Box(var _) -> pickAnotherBox();
    }
  }

  void multipleSwitchPatternsWithGuard() {
    switch (box) {
      case Box(RedBall _), Box(BlueBall _) when x == 42 -> processBox(b);
    }
  }

  void instanceofExpressions() {
    if (r instanceof ColoredPoint(Point(int x, int y), _)) {}
    if (r instanceof ColoredPoint(_, Color c)) {}
    if (r instanceof ColoredPoint(Point(int x, _), _)) {}
  }

  void switchLabelWithMatchAllPattern() {
    switch (box) {
      case Box(RedBall _), Box(BlueBall _) -> processBox(box);
      case Box(GreenBall _) -> stopProcessing();
      case Box(_) -> pickAnotherBox();
    }
  }

  int wrappingMultipleSwitchPatterns() {
    return switch ("") {
      case LongTypeName longVariableName, LongTypeName longVariableName -> 0;
      case
        LongTypeName longVariableName,
        LongTypeName longVariableName,
        LongTypeName longVariableName -> 0;
      case MyRecord(A a), MyRecord(B b) -> 0;
      case MyRecord(A a), MyRecord(B b) when true -> 0;
      case
        MyRecord(LongTypeName longVariableName, LongTypeName longVariableName),
        MyRecord(
          LongTypeName longVariableName,
          LongTypeName longVariableName
        ) -> 0;
      case
        MyRecord(LongTypeName longVariableName, LongTypeName longVariableName),
        MyRecord(LongTypeName longVariableName, LongTypeName longVariableName)
      when (
        this.longVariableName > longVariableName &&
        this.longVariableName > longVariableName
      ) -> longMethodName(
        longVariableName,
        longVariableName,
        longVariableName,
        longVariableName
      );
    };
  }
}
