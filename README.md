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

- Redesign & Rewrite **in progress**.

## Road map to Alpha

- Parser Package:

  - [x] POC: optimized backtracking to handle Java Grammar non LL(k) nature.
  - [x] Milestone 1 - Success parsing "Java Design Patterns" repo.
  - [x] Milestone 2 - Success parsing "spring-boot" repo.
  - [x] Investigate performance optimizations.

- prettier-java package

  - [ ] POC: Prettier "Re-writer" based on a Chevrotain CST instead of an AST.
  - [ ] Milestone 1 - Success cyclic rewriting "Java Design Patterns" repo.
  - [ ] Milestone 2 - Success parsing "spring-boot" repo.

---

## Contributing

Contributions are very welcome.
See the [contribution guide](./CONTRIBUTING.md) to get started.

## Credits

Special thanks to @thorbenvh8 for creating the original prettier-java
plugin and the associated Java Parser implemented JavaScript.
