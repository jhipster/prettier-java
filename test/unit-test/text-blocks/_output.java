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
    A""";

  void json() {
    // language = json
    String someJson = """
      { "glossary": { "title": "example glossary" } }""";

    // language=json
    String config = """
      { "name": "example", "enabled": true, "timeout": 30 }""";

    /* language = JSON */
    String query = """
      {
        "sql": "SELECT * FROM users WHERE active=1 AND deleted=0",
        "limit": 10
      }""";
  }

  void java() {
    // language=Java
    String java = """
      class Class {

        void method() {
          // comment
        }
      }""";
  }

  void html() {
    // language=html
    String html = """
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page Title</title>
        </head>
        <body>
          <h1>My First Heading</h1>
          <p>My first paragraph.</p>
        </body>
      </html>""";
  }

  void unsupported() {
    // language=unsupported
    String unsupported = """
      function f(){let i=0;}
      """;
  }
}
