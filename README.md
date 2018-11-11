[![Build Status](https://travis-ci.org/jhipster/prettier-java.svg?branch=master)](https://travis-ci.org/jhipster/prettier-java)

# Prettier Java

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

## How it works

A Prettier plugin must first parse the source code of the target language
into an **A**bstract **S**yntax **T**ree and then print out the AST in a "pretty" style.

Prettier-Java uses a [Java-Parser](./packages/java-parser) implemented in JavaScript with the
[Chevrotain parsing library](https://github.com/SAP/chevrotain).
What this means is that unlike many other prettier plugins, prettier-java has **no additional runtime pre-requisites**,
It could even be used inside a browser.

## Status

- pre-alpha version released
- Please file any bugs

## ToDos

- Finish Devops task related to project transfer
- Fix parsing bugs
- Make everything more prettier ;)
- Increase performance (It's already fast though)

---

## Install

```bash
yarn add --dev --exact prettier prettier-plugin-java
```

## Use

```bash
prettier --write "**/*.java"
```

## Contributing

Contributions are very welcome.
See the [contribution guide](./CONTRIBUTING.md) to get started.
