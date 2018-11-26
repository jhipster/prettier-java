<p align="center">
    :construction: Work in Progress! :construction:
</p>

[![Build Status](https://travis-ci.org/jhipster/prettier-java.svg?branch=master)](https://travis-ci.org/jhipster/prettier-java)

# Prettier Java

![Prettier Banner](https://raw.githubusercontent.com/prettier/prettier-logo/master/images/prettier-banner-light.png)

## How it works

A Prettier plugin must first parse the source code of the target language
into an **A**bstract **S**yntax **T**ree and then print out the AST in a "pretty" style.

Prettier-Java uses a [Java-Parser](./packages/java-parser) implemented in JavaScript using the
[Chevrotain Parser Building Toolkit for JavaScript](https://github.com/SAP/chevrotain).
What this means is that unlike many other prettier plugins, prettier-java has **no additional runtime pre-requisites**,
It could even be used inside a browser.

## Status

- Re-architecture and re-write in progress, (see [#108](https://github.com/jhipster/prettier-java/issues/108))
- pre-alpha version (initial architecture) released

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
