# Latest v0.5.1

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
