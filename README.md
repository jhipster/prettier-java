[![Github Actions Build Status][github-actions-image]][gitub-actions-main]

[github-actions-image]: https://github.com/jhipster/prettier-java/workflows/prettier-java/badge.svg
[gitub-actions-main]: https://github.com/jhipster/prettier-java/actions

# Prettier Java

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

## Intro

Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

## How it works

A Prettier plugin must first parse the source code of the target language
into a traversable data structure (Usually an **A**bstract **S**yntax **T**ree)
and then print out that data structure in a "pretty" style.

Prettier-Java uses a [Java-Parser](./packages/java-parser) implemented in JavaScript using the
[Chevrotain Parser Building Toolkit for JavaScript](https://github.com/SAP/chevrotain).
What this means is that unlike many other Prettier plugins,
`prettier-java` has **no additional runtime pre-requisites** (e.g: Python executable).
It could even be used inside a browser.

## Subpackages

This project contains 2 packages:

- [prettier-plugin-java](./packages/prettier-plugin-java) A plugin for
  [Prettier](https://prettier.io/) to format Java code

  [![npm-prettier-plugin-java][npm-prettier-plugin-java-image]][npm-prettier-plugin-java-url]

* [java-parser](./packages/java-parser) A Java Parser using [Chevrotain](https://github.com/SAP/chevrotain) which output a **C**oncrete **S**yntax **T**ree

  [![npm-java-parser][npm-java-parser-image]][npm-java-parser-url]

[npm-prettier-plugin-java-image]: https://img.shields.io/npm/v/prettier-plugin-java.svg?color=blue&label=prettier-plugin-java&logo=prettier-plugin-java
[npm-prettier-plugin-java-url]: https://www.npmjs.com/package/prettier-plugin-java
[npm-java-parser-image]: https://img.shields.io/npm/v/java-parser.svg?color=blue&label=java-parser&logo=java-parser
[npm-java-parser-url]: https://www.npmjs.com/package/java-parser

## Install

### Pre-requirements

- Node version 10+

### Install Prettier and Prettier-Java plugin

```bash
# Local installation
npm install prettier-plugin-java --save-dev

# Or globally
npm install -g prettier prettier-plugin-java
```

or with yarn:

```bash
# Local installation
yarn add prettier-plugin-java --dev

# Or globally
yarn global add prettier prettier-plugin-java
```

Note: If you want to install the prettier-plugin-java globally, you should also install the prettier package globally.

## Usage

To reformat all your Java files, run:

```bash
# If you have installed the package locally
npx prettier --write "**/*.java"

# Or globally
prettier --write "**/*.java"
```

To see an advanced usage: please go to the [Advanced Usage](./docs/advanced_usage.md) section

## Maven plugin

A neat maven plugin for prettier-java was made by developers from HubSpot. \
It is currently available at:

```xml
<plugin>
    <groupId>com.hubspot.maven.plugins</groupId>
    <artifactId>prettier-maven-plugin</artifactId>
    <!-- Find the latest version -->
    <version>0.8</version>
</plugin>
```

If you would like to use this plugin, we recommend you to check their [project](https://github.com/HubSpot/prettier-maven-plugin) as is it well documented.

## Contributing

Contributions are very welcome.
See the [contribution guide](./CONTRIBUTING.md) to get started.
And the [Help Wanted](https://github.com/jhipster/prettier-java/labels/help%20wanted) issues.

## Credits

Special thanks to [@thorbenvh8](https://github.com/thorbenvh8) for creating the original `prettier-java`
plugin and the associated Java Parser implemented in JavaScript.

We would also like to thank the [Chevrotain](https://github.com/SAP/chevrotain/graphs/contributors) and [Prettier](https://github.com/prettier/prettier/graphs/contributors) contributors which made this possible.
