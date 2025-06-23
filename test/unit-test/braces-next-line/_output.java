import java.io.*;
import java.sql.SQLException;
import java.util.function.Consumer;

public class BracesNextLineTest
{
  private String field;

  public BracesNextLineTest(String value)
  {
    this.field = value;
  }

  public void simpleMethod()
  {
    System.out.println("Simple method");
  }

  public String methodWithReturn()
  {
    return field;
  }

  static
  {
    System.out.println("Static initializer");
  }

  {
    System.out.println("Instance initializer");
  }

  public void testIfElse(int value)
  {
    if (value > 0)
    {
      System.out.println("Positive");
    }

    if (value > 10)
    {
      System.out.println("Greater than 10");
    }
    else
    {
      System.out.println("10 or less");
    }

    if (value < 0)
    {
      System.out.println("Negative");
    }
    else if (value == 0)
    {
      System.out.println("Zero");
    }
    else
    {
      System.out.println("Positive");
    }

    // Multiple else ifs
    if (value < -10)
    {
      System.out.println("Very negative");
    }
    else if (value < 0)
    {
      System.out.println("Negative");
    }
    else if (value == 0)
    {
      System.out.println("Zero");
    }
    else if (value > 10)
    {
      System.out.println("Very positive");
    }
    else
    {
      System.out.println("Positive");
    }

    // Else if without final else
    if (value < 0)
    {
      System.out.println("Negative");
    }
    else if (value == 0)
    {
      System.out.println("Zero");
    }

    // Nested else if
    if (value != 0)
    {
      if (value < 0)
      {
        System.out.println("Negative non-zero");
      }
      else if (value > 0)
      {
        System.out.println("Positive non-zero");
      }
    }

    // Without braces
    if (value < 0) System.out.println("Negative");
    else if (value == 0) System.out.println("Zero");
    else System.out.println("Positive");

    // Mixed braces
    if (value < 0)
    {
      System.out.println("Negative");
    }
    else if (value == 0) System.out.println("Zero");
    else
    {
      System.out.println("Positive");
    }
  }

  public void testLoops()
  {
    for (int i = 0; i < 10; i++)
    {
      System.out.println(i);
    }

    String[] items =
    {
      "a",
      "b",
      "c",
    };
    for (String item : items)
    {
      System.out.println(item);
    }

    int count = 0;
    while (count < 5)
    {
      count++;
    }

    do
    {
      count--;
    }
    while (count > 0);
  }

  public void testTryCatch()
  {
    try
    {
      riskyOperation();
    }
    catch (Exception e)
    {
      handleError(e);
    }

    try
    {
      riskyOperation();
    }
    catch (IOException e)
    {
      handleIOError(e);
    }
    catch (SQLException e)
    {
      handleSQLError(e);
    }
    finally
    {
      cleanup();
    }

    try (FileInputStream fis = new FileInputStream("file.txt"))
    {
      readFile(fis);
    }
    catch (IOException e)
    {
      handleError(e);
    }
  }

  public void testSwitch(int day)
  {
    switch (day)
    {
      case 1:
        System.out.println("Monday");
        break;
      case 2:
        System.out.println("Tuesday");
        break;
      default:
        System.out.println("Other day");
    }

    String dayName = switch (day)
    {
      case 1 -> "Monday";
      case 2 -> "Tuesday";
      default -> "Other";
    };
  }

  public class NestedClass
  {
    public void nestedMethod()
    {
      System.out.println("Nested");
    }
  }

  public void testAnonymousClass()
  {
    Runnable r = new Runnable()
    {
      @Override
      public void run()
      {
        System.out.println("Running");
      }
    };
  }

  public void testLambdas()
  {
    Runnable r1 = () -> System.out.println("Simple lambda");

    Runnable r2 = () ->
    {
      System.out.println("Line 1");
      System.out.println("Line 2");
    };

    Consumer<String> consumer = (String s) ->
    {
      System.out.println("Consuming: " + s);
      processString(s);
    };
  }

  public void testArrayInitializers()
  {
    int[] numbers =
    {
      1,
      2,
      3,
      4,
      5,
    };

    String[][] matrix =
    {
      {
        "a",
        "b",
      },
      {
        "c",
        "d",
      },
    };
  }
}

public interface NextLineInterface
{
  void interfaceMethod();

  default void defaultMethod()
  {
    System.out.println("Default");
  }
}

public interface ExtendedInterface extends NextLineInterface
{
  void extendedMethod();
}

public enum DayOfWeek
{
  MONDAY("Monday"),
  TUESDAY("Tuesday"),
  WEDNESDAY("Wednesday");

  private final String displayName;

  DayOfWeek(String displayName)
  {
    this.displayName = displayName;
  }

  public String getDisplayName()
  {
    return displayName;
  }
}

public class ExtendedClass
  extends BracesNextLineTest
  implements NextLineInterface
{
  public ExtendedClass()
  {
    super("extended");
  }

  @Override
  public void interfaceMethod()
  {
    System.out.println("Implemented");
  }
}

class SynchronizedExample
{
  private final Object lock = new Object();

  public void synchronizedMethod()
  {
    synchronized (lock)
    {
      System.out.println("Synchronized");
    }
  }
}

class HelperMethods
{
  void riskyOperation() throws Exception
  {
  }

  void handleError(Exception e)
  {
  }

  void handleIOError(IOException e)
  {
  }

  void handleSQLError(SQLException e)
  {
  }

  void cleanup()
  {
  }

  void readFile(FileInputStream fis)
  {
  }

  void processString(String s)
  {
  }
}

// Test empty blocks for all constructs
class EmptyBlocksTest
{
  // Empty class declaration
  static class EmptyClass
  {
  }

  // Empty interface declaration
  interface EmptyInterface
  {
  }

  // Empty enum
  enum EmptyEnum
  {
  }

  // Empty method
  void emptyMethod()
  {
  }

  // Empty constructor
  EmptyBlocksTest()
  {
  }

  // Empty static initializer
  static
  {
  }

  // Empty instance initializer
  {
  }

  // Empty blocks in statements
  void testEmptyStatementBlocks()
  {
    // Empty if
    if (true)
    {
    }

    // Empty else
    if (false)
    {
      System.out.println("not empty");
    }
    else
    {
    }

    // Empty while
    while (false)
    {
    }

    // Empty do-while
    do
    {
    }
    while (false);

    // Empty for
    for (int i = 0; i < 0; i++)
    {
    }

    // Empty enhanced for
    for (String s : new String[0])
    {
    }

    // Empty try
    try
    {
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }

    // Empty catch
    try
    {
      throw new Exception();
    }
    catch (Exception e)
    {
    }

    // Empty finally
    try
    {
      System.out.println("try");
    }
    finally
    {
    }

    // Empty try-catch-finally
    try
    {
    }
    catch (Exception e)
    {
    }
    finally
    {
    }

    // Empty synchronized
    synchronized (this)
    {
    }

    // Empty switch
    switch (1)
    {
    }

    // Empty anonymous class
    Runnable r = new Runnable()
    {
      public void run()
      {
      }
    };

    // Empty lambda block
    Runnable lambda = () ->
    {
    };
  }
}
