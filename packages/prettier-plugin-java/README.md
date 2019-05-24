[![npm](https://img.shields.io/npm/v/prettier-plugin-java.svg)](https://www.npmjs.com/package/prettier-plugin-java)

# prettier-plugin-java

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

## Installation

### Prerequirements

Since the plugin is meant to be used by Prettier, you need to install it:

`npm install prettier --save-dev`

or

`yarn add prettier --dev`

### Install plugin

`npm install prettier-plugin-java --save-dev`

or

`yarn add prettier-plugin-java --dev`

## Usage

```javascript
const prettier = require("prettier");
const javaText = `
public class HelloWorldExample{
  public static void main(String args[]){
    System.out.println("Hello World !");
  }
}
`;

const formattedText = prettier.format(javaText, {
  parser: "java",
  tabWidth: 2
});
```

## Example of formatted code

### Input

```java
public class HelloWorld {

  public static void main(String[] args) {
    System.out.println("Hello World!");
  }

  @Override
  public String toString() {
    return "Hello World";
  }

  public int sum(
    int argument1,
    int argument2,
    int argument3,
    int argument4,
    int argument5
  ) {
    return argument1 + argument2 + argument3 + argument4 + argument5;
  }
}
```

### Output

```java
public class HelloWorld {

  public static void main(String[] args) {
    System.out.println("Hello World!");
  }

  @Override
  public String toString() {
    return "Hello World";
  }

  public int sum(
    int argument1,
    int argument2,
    int argument3,
    int argument4,
    int argument5
  ) {
    return argument1 + argument2 + argument3 + argument4 + argument5;
  }
}
```
