# Latest v0.7.1

## Fixes

### Re-Writer

- Fix stable formatting for fields and methods with annotations ([#369](https://github.com/jhipster/prettier-java/pull/369))

## Miscellaneous

- Update prettier dependency to [1.19.1](https://github.com/prettier/prettier/blob/master/CHANGELOG.md#1191) ([#370](https://github.com/jhipster/prettier-java/pull/370))

# v0.7.0

## Enhancements

### Re-Writer

- Add support for trailing commas option ([#354](https://github.com/jhipster/prettier-java/pull/354))

  For enumerations:
  ```java
  // Input
  public enum Enum {
    ONE, TWO, THREE
  }

  // Output
  public enum Enum {
    ONE,
    TWO,
    THREE,
  }
  ```

  For arrays:
  ```java
  // Input
  public class T {
    void t() {
      int[] ints = { 1, 2, 3, };
      int[] ints = { aVeryLongArrayValue, anotherVeryLongArrayValue, andYetAnotherVeryLongArrayValue };
    }
  }

  // Output
  public class T {
    void t() {
      int[] ints = { 1, 2, 3 };
      int[] ints = {
        aVeryLongArrayValue,
        anotherVeryLongArrayValue,
        andYetAnotherVeryLongArrayValue,
      };
    }
  }
  ```
- By default, remove trailing comma in arrays ([#354](https://github.com/jhipster/prettier-java/pull/354))

  ```java
  // Input
  public class T {
    void t() {
      int[] ints = { 1, 2, 3, };
    }
  }

  // Output
  public class T {
    void t() {
      int[] ints = { 1, 2, 3 };
    }
  }
  ```

- Allow blank lines in enumerations' constant list ([#350](https://github.com/jhipster/prettier-java/pull/350))

  ```java
  // Input
  public enum OtherEnum {
    ONE, TWO,

    THREE,



    FOUR,
    /* Five */
    FIVE,

    /* Six */
    SIX


  }

  // Output
  public enum OtherEnum {
    ONE,
    TWO,

    THREE,

    FOUR,
    /* Five */
    FIVE,

    /* Six */
    SIX
  }
  ```

- Always add a blank line between an enumeration's constants and declarations ([#351](https://github.com/jhipster/prettier-java/pull/351))

  ```java
  // This input
  public enum EnumWithExtraCommaAndEnumBodyDeclarations {
    THIS_IS_GOOD("abc"),
    THIS_IS_FINE("abc");
    public static final String thisWillBeDeleted = "DELETED";
  }

  // will be formatted to this output
  public enum EnumWithExtraCommaAndEnumBodyDeclarations {
    THIS_IS_GOOD("abc"),
    THIS_IS_FINE("abc");

    public static final String thisWillBeDeleted = "DELETED";
  }
  ```

## Fixes

### Re-Writer

- Fix blank lines with empty statements ([#360](https://github.com/jhipster/prettier-java/pull/360))

  ```java
  // Input
  public class Test {
    public TestField testField;;

    @Override
    public void someMethod() {}
  }

  // Output (v0.6.0)
  public class Test {
    public TestField testField;
    @Override
    public void someMethod() {}
  }

  // Output (v0.7.0)
  public class Test {
    public TestField testField;

    @Override
    public void someMethod() {}
  }
  ```

- Fix line wrapping in switch statements ([#359](https://github.com/jhipster/prettier-java/pull/359))

  ```java
  // Input
  public String shouldWrapEvenForSmallSwitchCases() {
    switch (answer) { case "YES": return "YES"; default: return "NO"; }
  }
  // Output (v0.6.0)
  public String shouldWrapEvenForSmallSwitchCases() {
    switch (answer) { case "YES": return "YES"; default: return "NO"; }
  }

  // Output (v0.7.0)
  public String shouldWrapEvenForSmallSwitchCases() {
    switch (answer) {
      case "YES":
        return "YES";
      default:
        return "NO";
    }
  }
  ```

- Fix stable reformating of comments in binary expression ([#353](https://github.com/jhipster/prettier-java/pull/353))

  ```java
  // Input
  public boolean binaryOperationWithComments() {
    boolean a = one || two >> 1 // one
      // two
      // three
      || // five
      // four
      three;

    boolean b = one || two >> 1 // one
      // two
      // three
      ||
      three;

    boolean c = one || two >> 1 // one
      // two
      // three
      || three;

    return a || b || c;
  }

  // Output (v0.6.0)
  public boolean binaryOperationWithComments() {
    boolean a =
      one ||
      two >> 1 // two // one
      // three
      || // five
      // four
      three;

    boolean b =
      one ||
      two >> 1 // two // one
      // three
      ||
      three;

    boolean c =
      one ||
      two >> 1 // two // one
      // three
      ||
      three;

    return a || b || c;
  }

  // Output (v0.7.0)
  public boolean binaryOperationWithComments() {
    boolean a =
      one ||
      two >> 1 || // one
      // five
      // two
      // three
      // four
      three;

    boolean b =
      one ||
      two >> 1 || // one
      // two
      // three
      three;

    boolean c =
      one ||
      two >> 1 || // one
      // two
      // three
      three;

    return a || b || c;
  }
  ```
- Fix comments indentation when they are at the end of a block: indent the comments based on the block they are in ([#345](https://github.com/jhipster/prettier-java/pull/345))

  ```java
  // Input
  public class T {
    int i;
    // comment
  }

  // Output (v0.6.0)
  public class T {
    int i;
  // comment
  }

  // Output (v0.7.0)
  public class T {
    int i;
    // comment
  }
  ```

- Fix respect of blank lines with comments ([#348](https://github.com/jhipster/prettier-java/pull/348))

  ```java
  // Input
  void t() {
    int i;
    // comment
    int j;
  }

  // Output (v0.6.0)
  void t() {
    int i;

    // comment
    int j;
  }

  // Output (v0.7.0)
  void t() {
    int i;
    // comment
    int j;
  }
  ```

# v0.6.0

## Enhancements

### Parser

- Optimize parser performance by reducing the global maxLookahead to 1 ([#321](https://github.com/jhipster/prettier-java/pull/321))

### Re-Writer

- Support `// formater-off` and `// formater-on` comments to disable formating on some parts of the code ([#323](https://github.com/jhipster/prettier-java/pull/323))

  ```java
  // Input
  // @formatter:off
  public class PrettierIgnoreClass {
    public void myMethod(int param1, int param2, int param3, int param4, int param5, int param6, int param7, int param8, int param9, int param10) {

    }
  }
  // @formatter:on
  public class PrettierIgnoreClass {
    public void myMethod(int param1, int param2, int param3, int param4, int param5, int param6, int param7, int param8, int param9, int param10) {

    }
  }
  ```
  ```java
  // Output
  // @formatter:off
  public class PrettierIgnoreClass {
    public void myMethod(int param1, int param2, int param3, int param4, int param5, int param6, int param7, int param8, int param9, int param10) {

    }
  }

  // @formatter:on
  public class PrettierIgnoreClass {

    public void myMethod(
      int param1,
      int param2,
      int param3,
      int param4,
      int param5,
      int param6,
      int param7,
      int param8,
      int param9,
      int param10
    ) {}
  }
  ```

- Print enums' values on their own line ([#319](https://github.com/jhipster/prettier-java/pull/319))

  ```java
  // Input
  public enum Enum {
    SOME_ENUM, ANOTHER_ENUM, LAST_ENUM
  }

  // Output
  public enum Enum {
    SOME_ENUM,
    ANOTHER_ENUM,
    LAST_ENUM
  }
  ```

- Remove extra comma in enums ([#319](https://github.com/jhipster/prettier-java/pull/319))

  ```java
  // Input
  public enum EnumWithExtraComma {
    SOME_ENUM, ANOTHER_ENUM, LAST_ENUM,
  }

  // Output
  public enum Enum {
    SOME_ENUM,
    ANOTHER_ENUM,
    LAST_ENUM
  }
  ```

- Respect case when sorting imports ([#330](https://github.com/jhipster/prettier-java/pull/330))

  ```java
  // Input
  import java.util.ArrayList;
  import java.util.function.Consumer;
  import java.util.functioN.Consumer;
  import java.util.function.ConsumerTwo;
  import java.util.List;
  import java.util.concurrent.Semaphore;
  import java.util.concurrent.*;
  import java.util.Map;

  // Output
  import java.util.ArrayList;
  import java.util.List;
  import java.util.Map;
  import java.util.concurrent.*;
  import java.util.concurrent.Semaphore;
  import java.util.functioN.Consumer;
  import java.util.function.Consumer;
  import java.util.function.ConsumerTwo;
  ```

- Improve formatting of lambda expressions when they break ([#333](https://github.com/jhipster/prettier-java/pull/333))

  ```java
  // Input && v0.5.1
  public void lambdaWithoutBracesWhichBreak() {
    call(x -> foo.isVeryVeryVeryLongConditionTrue() &&
    foo.isAnotherVeryVeryLongConditionTrue());
  }

  // Output
  public void lambdaWithoutBracesWhichBreak() {
    call(
      x ->
        foo.isVeryVeryVeryLongConditionTrue() &&
        foo.isAnotherVeryVeryLongConditionTrue()
    );
  }
  ```

- Don't indent binary operators ([#329](https://github.com/jhipster/prettier-java/pull/329))
  ```java
  // Input && v0.5.1
  @Annotation(
    "This operation with two very long string should break" +
      "in a very nice way"
  )
  public void method() {}

  // Output
  @Annotation(
    "This operation with two very long string should break" +
    "in a very nice way"
  )
  public void method() {}
  ```

- Improve ternary expression line wrapping ([#318](https://github.com/jhipster/prettier-java/pull/318))
  ```java
  // Input && v0.5.1
  return (columnIndex == null) ? ImmutableMap.<R, V>of()
    : new Column(columnIndex);

  // Output
  return (columnIndex == null)
    ? ImmutableMap.<R, V>of()
    : new Column(columnIndex);
  ```

- Improve formatting of variable initialization with methods ([#332](https://github.com/jhipster/prettier-java/pull/332))

  ```java
  // Input && v0.5.1
  boolean willDrop = predictDropResponse.getSendResult().isIgnorableFailure() || predictDropResponse.getSendResult().isFatalError();

  // Output
  boolean willDrop =
    predictDropResponse.getSendResult().isIgnorableFailure() ||
    predictDropResponse.getSendResult().isFatalError();
  ```

## Fixes

### Parser

- Fix brackets considered as a cast with byte shifting or comparison
  (e.g. `(left) << right` or `(left) < right`). The parser is now able to parse completely the ElasticSearch Repository ([#325](https://github.com/jhipster/prettier-java/pull/325))

### Re-Writer

- Fix stable reformating of variable declaration with comments ([#336](https://github.com/jhipster/prettier-java/pull/336))

  ```java
  // Input && v0.5.1
  Map<String, String> map =
    // there is a random comment on this line up here
    // and then there is a separate comment on this line down here
    new HashMap<>(someMethodThatReturnsAMap());

  // Output
  Map<String, String> map =
    // there is a random comment on this line up here
    // and then there is a separate comment on this line down here
    new HashMap<>(someMethodThatReturnsAMap());

  ```

## Miscellaneous

- Check stable reformating for repositories in tests ([#335](https://github.com/jhipster/prettier-java/pull/335))
- Add template for submitting an issue ([#340](https://github.com/jhipster/prettier-java/pull/340))


# v0.5.1

## Fixes

- Fix parsing and printing of variable arity parameters with dims ([#310](https://github.com/jhipster/prettier-java/pull/310))
- Fix package size ([#317](https://github.com/jhipster/prettier-java/pull/317))

# v0.5.0

## Enhancements

### Parser

- Optimize parser initialisation ([#295](https://github.com/jhipster/prettier-java/pull/295))

### Re-Writer

- Sort class, method and field modifiers ([#302](https://github.com/jhipster/prettier-java/pull/302)). See this [doc](https://github.com/jhipster/prettier-java/blob/0767022f20e99dffdaf957192d84b161422dafbf/packages/prettier-plugin-java/docs/modifiers.md) for more information

  ```java
  // Input
  final private static @Annotation String S = "abc";

  // Output
  @Annotation
  private static final String S = "abc";
  ```

## Fixes

### Parser

- Fix lexer gap: align use of `transitive` keyword with the specs ([#297](https://github.com/jhipster/prettier-java/pull/297))

### Re-Writer

- Fix enforcement of printWidth for nodes with leading comments ([#278](https://github.com/jhipster/prettier-java/pull/278))
- Fix switch statements indentation with comments ([#278](https://github.com/jhipster/prettier-java/pull/278))
- Fix unstable formating when wrapping in return statements ([#294](https://github.com/jhipster/prettier-java/pull/294))
- Fix variable arity parameters formating ([#304](https://github.com/jhipster/prettier-java/pull/304))

## Miscellaneous

- Drop testing on Node 8 and add testing on Node 13

# v0.4.0

## Enhancements

- Upgrade Chevrotain to 6.5.0 ([#268](https://github.com/jhipster/prettier-java/pull/268))

- Split enum to one constant per line if too long ([#266](https://github.com/jhipster/prettier-java/pull/266))

```java
public enum EnumWhichBreak {

  ONE_VALUE, TWO_VALUE, THREE_VALUE, FOUR_VALUE, FIVE_VALUE, SIX_VALUE, SEVEN_VALUE, EIGHT_VALUE, NINE_VALUE,
  TEN_VALUE

}
```

would be transformed in:

```java
public enum EnumWhichBreak {
  ONE_VALUE,
  TWO_VALUE,
  THREE_VALUE,
  FOUR_VALUE,
  FIVE_VALUE,
  SIX_VALUE,
  SEVEN_VALUE,
  EIGHT_VALUE,
  NINE_VALUE,
  TEN_VALUE
}
```

When

```java
public enum EnumWhichNotBreak {
  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM
}
```

would be kept as it is:

```java
public enum EnumWhichNotBreak {
  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM
}
```

- Remove extra semicolons in enums when possible ([#266](https://github.com/jhipster/prettier-java/pull/266))

```java
public enum EnumWhichNotBreak {
  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM;
}
```

would be transformed in:

```java
public enum EnumWhichNotBreak {
  SOME_ENUM, ANOTHER_ENUM, LAST_ENUM
}
```

when the following is kept as it is:

```java
public enum Enum {
  THIS_IS_GOOD("abc"), THIS_IS_FINE("abc");
  public static final String thisWillBeDeleted = "DELETED";

  private final String value;

  public Enum(String value) {
    this.value = value;
  }

  public String toString() {
    return "STRING";
  }
```

- Organise imports according to Google style ([#273](https://github.com/jhipster/prettier-java/pull/273) and [#281](https://github.com/jhipster/prettier-java/pull/281))

```java
package my.own.pkg;

import something.Different;
import java.utils.*;;;
import abc.def.Something;
import abc.def.Another;;;
import abc.def;
import static abc.def;
import  static something.Different;
import static  java.utils.*;;;
import static abc.def.Something;
import static abc.def.Another;;;
import one.last;;;

public class PackageAndImports {}
```

is transformed in:

```java
package my.own.pkg;

import static abc.def;
import static abc.def.Another;
import static abc.def.Something;
import static java.utils.*;
import static something.Different;

import abc.def;
import abc.def.Another;
import abc.def.Something;
import java.utils.*;
import one.last;
import something.Different;

public class PackageAndImports {}
```

- Better display of local variable declarations ([#283](https://github.com/jhipster/prettier-java/pull/283))

```java
public boolean localVariableDeclarationWhichBreak() {
  @Nullable final BackupStatus lastStatus = BackupStatus.fromDbValue(backupRepository.getLastStatus());

  final BackupStatus lastStatus = BackupStatus.fromDbValue(backupRepository.getLastStatus());

  @Nullable BackupStatus lastStatus = BackupStatus.fromDbValue(backupRepository.getLastStatus());

  BackupStatus lastStatus = BackupStatus.fromDbValue(backupRepository.getLastStatus());
}

public boolean localVariableDeclarationWhichDoNotBreak() {
  @Nullable final BackupStatus lastStatus = value;

  final BackupStatus lastStatus = value;

  @Nullable BackupStatus lastStatus = value;

  BackupStatus lastStatus = value;
}
```

is transformed in:

```java
public boolean localVariableDeclarationWhichBreak() {
  @Nullable
  final BackupStatus lastStatus = BackupStatus.fromDbValue(
    backupRepository.getLastStatus()
  );

  final BackupStatus lastStatus = BackupStatus.fromDbValue(
    backupRepository.getLastStatus()
  );

  @Nullable
  BackupStatus lastStatus = BackupStatus.fromDbValue(
    backupRepository.getLastStatus()
  );

  BackupStatus lastStatus = BackupStatus.fromDbValue(
    backupRepository.getLastStatus()
  );
}

public boolean localVariableDeclarationWhichDoNotBreak() {
  @Nullable
  final BackupStatus lastStatus = value;

  final BackupStatus lastStatus = value;

  @Nullable
  BackupStatus lastStatus = value;

  BackupStatus lastStatus = value;
}
```

- Improve binary operations indentation ([#255](https://github.com/jhipster/prettier-java/pull/255)):

```java
Obj newObject = new Object().something().more().and().that().as().well().but().not().something();

Object.test.creation thisObject = classWithName.invocationOne().invocationTwo();

Object.test.creation thisObject1 = classWithName.invocationOne(argument1, argument2, argument3);

Object.test.creation thisObject2 = classWithName.invocationOne(argument1, argument2, argument3).invocationTwo();

Object.test.creation thisObject3 = classWithName.invocationOne().invocationTwo(argument1, argument2, argument3);

Object.test.creation thisObject4 = classWithName.invocationOne(argument1, argument2, argument3).invocationTwo(argument1, argument2);

Object.test.creation thisObject5 = classWithName.invocationOne(argument1WithAVeryVeryVeryVeryLongName, argument2, argument3).attributeOne.attributeTwo
    .invocationTwo(argument1, argument2).attributeThree.invocationThree();

Object.test.creation thisObject6 = classWithName.invocationOne(argument1, argument2,
    argument3).attributeOne.attributeTwo.invocationTwo(argument1, argument2).attributeThree.invocationThree();
```

is transformed in:

```java
Obj newObject = new Object()
  .something()
  .more()
  .and()
  .that()
  .as()
  .well()
  .but()
  .not()
  .something();

Object.test.creation thisObject = classWithName
  .invocationOne()
  .invocationTwo();

Object.test.creation thisObject1 = classWithName.invocationOne(
  argument1,
  argument2,
  argument3
);

Object.test.creation thisObject2 = classWithName
  .invocationOne(argument1, argument2, argument3)
  .invocationTwo();

Object.test.creation thisObject3 = classWithName
  .invocationOne()
  .invocationTwo(argument1, argument2, argument3);

Object.test.creation thisObject4 = classWithName
  .invocationOne(argument1, argument2, argument3)
  .invocationTwo(argument1, argument2);

Object.test.creation thisObject5 = classWithName
  .invocationOne(
    argument1WithAVeryVeryVeryVeryLongName,
    argument2,
    argument3
  )
  .attributeOne.attributeTwo.invocationTwo(argument1, argument2)
  .attributeThree.invocationThree();

Object.test.creation thisObject6 = classWithName
  .invocationOne(argument1, argument2, argument3)
  .attributeOne.attributeTwo.invocationTwo(argument1, argument2)
  .attributeThree.invocationThree();
```

- Improve return statement rendering ([#255](https://github.com/jhipster/prettier-java/pull/255))

```java
Object returnSomethingWhichDoNotBreak() {
  return oneVariable + secondVariable;
}

Object returnSomethingWhichBreak() {
  return oneVariable + secondVariable + thirdVariable + fourthVariable + fifthVariable + sixthVariable + seventhVariable;
}

Object returnSomethingWhichBreakAndAlreadyInParenthesis() {
  return (
      oneVariable +
          secondVariable +
          thirdVariable +
          fourthVariable +
          fifthVariable +
          sixthVariable +
          seventhVariable
  );
}
```

is transformed in:

```java
Object returnSomethingWhichDoNotBreak() {
  return oneVariable + secondVariable;
}

Object returnSomethingWhichBreak() {
  return (
    oneVariable +
    secondVariable +
    thirdVariable +
    fourthVariable +
    fifthVariable +
    sixthVariable +
    seventhVariable
  );
}

Object returnSomethingWhichBreakAndAlreadyInParenthesis() {
  return (
    oneVariable +
    secondVariable +
    thirdVariable +
    fourthVariable +
    fifthVariable +
    sixthVariable +
    seventhVariable
  );
}
```

## Fixed

- Add missing `lodash` dependency ([#265](https://github.com/jhipster/prettier-java/pull/265))
- Fix blocks comments formatting ([#280](https://github.com/jhipster/prettier-java/pull/280))
