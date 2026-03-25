public class TextBlock {

  void method() {
    String myTextBlock = """
           my text


      sentence\"""

      """;

    String source = """
      public void print(%s object) {
          System.out.println(Objects.toString(object));
      }
      """.formatted(type);

    String html = """
      <html>\r
          <body>\r
              <p>Hello, world</p>\r
          </body>\r
      </html>\r
      """;

    html = """
      <html>\r
          <body>\r
              <p>Hello, world</p>\r
          </body>\r
      </html>\r
      """;

    System.out.println(
      // leading comment
      """
       abaoeu
         euaoeu
      aoeu

       oaeu
            abc""" // trailing comment
    );

    System.out.println(
      """
       abaoeu
         euaoeu
      aoeu

       oaeu
            abc"""
    );
  }

  String escapes = """
    1+1 equals \
    2 maybe
    """;

  String escapes = """
    \"""var msg = hello world!\""";
    """;

  String escapes = """
    \n\t\r\f\b\s\\
    \077
    \u0041""";
}
