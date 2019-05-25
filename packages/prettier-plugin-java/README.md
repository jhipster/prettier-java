[![npm](https://img.shields.io/npm/v/prettier-plugin-java.svg)](https://www.npmjs.com/package/prettier-plugin-java)

# prettier-plugin-java

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

Prettier is an opinionated code formatter which forces a certain coding style. It makes the code consistent through an entire project.

This plugin allows the support of Java on Prettier.

The plugin implementation is pretty straightforward as it uses [java-parser](../java-parser) (thanks to Chevrotain) visitor to traverse the **C**oncrete **S**yntax **T**ree and apply the format processing on each node (it uses Prettier API).

## Installation

### Pre-requirements

Since the plugin is meant to be used with Prettier, you need to install it:

`npm install --save-dev --save-exact prettier`

or

`yarn add prettier --dev --exact`

### Install plugin

`npm install prettier-plugin-java --save-dev`

or

`yarn add prettier-plugin-java --dev`

### CLI

If you installed Prettier globally and want to format java code via the CLI, run the following command:

`npm install -g prettier-plugin-java`

The plugin will be automatically loaded, check [here](https://prettier.io/docs/en/plugins.html#using-plugins) for more.

## Usage

### CLI

```bash
prettier --write MyJavaFile.java
```

If the plugin is not cannot be automatically loaded:

```bash
# Example where the plugin is locate in node_modules
prettier --write MyJavaFile.java --plugin=./node_modules/prettier-plugin-java
```

### API

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
public static void main(String[] args) {System.out.println("Hello World!");;;;;}

@Override
public String toString() {
  return "Hello World";
}
  public int sum(int argument1,int argument2,int argument3,int argument4,int argument5
  ) {
    return argument1+argument2+ argument3 +argument4  + argument5;
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
