public class TextBlock {

  void method() {
    String myTextBlock = """
         my text


    sentence\"""

    """;

    String source =
      """
                public void print(%s object) {
                    System.out.println(Objects.toString(object));
                }
                """.formatted(
          type
        );

    String html =
      """
              <html>\r
                  <body>\r
                      <p>Hello, world</p>\r
                  </body>\r
              </html>\r
              """;
  }
}
