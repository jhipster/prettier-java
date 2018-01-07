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

}
