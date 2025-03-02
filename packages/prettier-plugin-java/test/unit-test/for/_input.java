public class For {

  public void simpleFor(String[] array) {
    for (int i = 0; i < array.length; i++) {
      System.out.println(array[i]);
    }
  }

  public void emptyFor(String[] array) {
    for (;;) {
      System.out.println(array[i]);
    }
  }

  public void forEach(List<String> list) {
    for (String str : list) {
      System.out.println(str);
    }
  }

  public void continueSimple() {
    for (int i = 0; i < 10; i++) {
      if (i % 2 == 0) {
        continue;
      }
      System.out.println(i);
    }
  }

  public void continueWithIdentifier() {
    for (int i = 0; i < 10; i++) {
      if (i % 2 == 0) {
        continue id;
      }
      System.out.println(i);
    }
  }

  void shouldBreakNested() {
    for (int d = 0; d < e; d++) for (int c = 0; c < d; c++) for (int b = 0; b < c; b++) a();
    for (D dddddddddd : eeeeeeeeee) for (C cccccccccc : dddddddddd) for (B bbbbbbbbbb : cccccccccc) aaaaaaaaaa();
  }
}
