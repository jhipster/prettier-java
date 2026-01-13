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

  void json() {
    // language=json
    String config = """
      { "name": "example", "enabled": true, "timeout": 30 }
      """;

    /* language = JSON */
    String query = """
      {
        "sql": "SELECT * FROM users WHERE active=1 AND deleted=0",
        "limit": 10
      }
      """;
  }
}
