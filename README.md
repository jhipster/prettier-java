[![Prettier Java Banner](https://raw.githubusercontent.com/jhipster/prettier-java/main/logo/prettier-java-banner-light.svg)](https://www.jhipster.tech/prettier-java/)

# Prettier Java Plugin

[![CI Status](https://img.shields.io/github/actions/workflow/status/jhipster/prettier-java/github-ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/jhipster/prettier-java/actions/workflows/github-ci.yml?query=branch%3Amain) [![npm version](https://img.shields.io/npm/v/prettier-plugin-java.svg?style=flat-square)](https://www.npmjs.com/package/prettier-plugin-java) [![weekly downloads from npm](https://img.shields.io/npm/dw/prettier-plugin-java.svg?style=flat-square)](https://www.npmjs.com/package/prettier-plugin-java) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier#badge)

## Intro

Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

This plugin adds support for the Java language to Prettier.

### Input

<!-- prettier-ignore -->
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

### Playground

You can give the plugin a try in our [playground](https://www.jhipster.tech/prettier-java/playground)!

## Getting Started

### Installation

npm:

```shell
npm install --save-dev --save-exact prettier prettier-plugin-java
```

Yarn:

```shell
yarn add --dev --exact prettier prettier-plugin-java
```

### Usage

npm:

```shell
npx prettier --plugin=prettier-plugin-java --write "**/*.java"
```

Yarn:

```shell
yarn exec prettier --plugin=prettier-plugin-java --write "**/*.java"
```

### Integration

- [Editors](docs/advanced_usage.md#ide-integrations)
- [Spotless](https://github.com/diffplug/spotless) lets you run Prettier from [Gradle](https://github.com/diffplug/spotless/tree/main/plugin-gradle#prettier) or [Maven](https://github.com/diffplug/spotless/tree/main/plugin-maven#prettier)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
