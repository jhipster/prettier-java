# Contributing to Prettier Java

To get up and running, install the dependencies and run the full build:

```bash
yarn
yarn ci
```

You can also inspect the other available dev flows scripts:

```bash
yarn run
```

## Testing your changes

If you would like to check the impact of your changes on a sample code, edit the scripts/single-printer-run/\_input.java file and run

```bash
node scripts/update-test-output.js -single
```

The prettified code will be output in scripts/single-printer-run/\_output.java.

It is also possible to prettify an entire repository by running the following command:

```bash
node scripts/update-test-ouput.js -repository relative/path/to/the/repository
```

It will then be output inside test-samples/repository-name.

To check the stability of the reformating, you can run several times Prettier with the `-times` flag (e.g. 5 times):

```bash
node scripts/update-test-output.js -single -times 5
```

If you run:

```bash
node scripts/update-test-ouput.js
```

It will simply update all the tests located in test/unit-test folder.

If you would like to run all the tests, simple use the following command:

```bash
yarn test
```

## Formatting

The prettier-java source code is (unsurprisingly) formatted using prettier.
Make sure to properly format the source code before committing by running:

```bash
yarn run format:fix
```

## Unit Testing

All Unit tests in this project are implemented with the [Mocha testing framework](https://mochajs.org/)
and the [Chai](https://www.chaijs.com/) assertion library.
