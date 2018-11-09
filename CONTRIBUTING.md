# Contributing to Prettier

To get up and running, install the dependencies and run the full build:

```bash
yarn
yarn ci
```

You can also inspect the other available dev flows scripts:

```bash
yarn run
```

## Formatting

The prettier-java source code is (unsurprisingly) formatted using prettier.
Make sure to properly format the source code before committing by running:

```bash
yarn run
```

## Unit Testing

All Unit tests in this project are implemented with the [Mocha testing framework](https://mochajs.org/)
and the [Chai](https://www.chaijs.com/) assertion library.

### Parser

The [java-parser](./packages/java-parser) package is tested using simple [mocha](https://mochajs.org/) tests.
each test verifies that for a given text input the produced AST is correct.

### Re-writer

The [prettier-java](./packages/prettier-java) package prettifies source code by **re-writing** the AST
produced by the parser. It is tested by verifying pairs of expected input and output strings.

TODO: cyclic AST tests & docs

## Integration Testing
