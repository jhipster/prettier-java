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
yarn run format
```

## Unit Testing

All Unit tests in this project are implemented with the [Mocha testing framework](https://mochajs.org/)
and the [Chai](https://www.chaijs.com/) assertion library.
