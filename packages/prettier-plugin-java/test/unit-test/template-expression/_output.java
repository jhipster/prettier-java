class TemplateExpression {

  String info = STR."My name is \{name}";

  String s = STR."\{x} + \{y} = \{x + y}";

  String s = STR."You have a \{getOfferType()} waiting for you!";

  String msg =
    STR."The file \{filePath} \{file.exists() ? "does" : "does not"} exist";

  String time =
    STR."The time is \{
      // The java.time.format package is very useful
      DateTimeFormatter.ofPattern("HH:mm:ss").format(LocalTime.now())
    } right now";

  String data = STR."\{index++}, \{index++}, \{index++}, \{index++}";

  String s = STR."\{fruit[0]}, \{STR."\{fruit[1]}, \{fruit[2]}"}";

  String html =
    STR."""
    <html>
      <head>
        <title>\{title}</title>
      </head>
      <body>
        <p>\{text}</p>
      </body>
    </html>
    """;

  String table =
    STR."""
    Description  Width  Height  Area
    \{zone[0].name}  \{zone[0].width}  \{zone[0].height}     \{zone[0].area()}
    \{zone[1].name}  \{zone[1].width}  \{zone[1].height}     \{zone[1].area()}
    \{zone[2].name}  \{zone[2].width}  \{zone[2].height}     \{zone[2].area()}
    Total \{zone[0].area() + zone[1].area() + zone[2].area()}
    """;

  String table =
    FMT."""
    Description     Width    Height     Area
    %-12s\{zone[0].name}  %7.2f\{zone[0].width}  %7.2f\{
      zone[0].height
    }     %7.2f\{zone[0].area()}
    %-12s\{zone[1].name}  %7.2f\{zone[1].width}  %7.2f\{
      zone[1].height
    }     %7.2f\{zone[1].area()}
    %-12s\{zone[2].name}  %7.2f\{zone[2].width}  %7.2f\{
      zone[2].height
    }     %7.2f\{zone[2].area()}
    \{" ".repeat(28)} Total %7.2f\{
      zone[0].area() + zone[1].area() + zone[2].area()
    }
    """;

  PreparedStatement ps =
    DB."SELECT * FROM Person p WHERE p.last_name = \{name}";
}
