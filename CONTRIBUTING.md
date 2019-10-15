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

## Linking the java-parser to the printer

If you want to use the master java-parser for the prettier-plugin-java (printer), you will need to link it by running these commands in the root folder:

```bash
cd packages/java-parser
yarn link
cd ../prettier-plugin-java
yarn link java-parser
```

To unlink the java-parser, run

```bash
yarn unlink java-parser
```

inside packages/prettier-plugin-java.

## Testing your changes

### java-parser

In this section, We suppose you are in the packages/java-parser folder

When working on the parser, you can test the java-parser inside scripts/single-sample-runner.js. This is a simple way to check the impact of your changes on the built CST.
You can then print the CST with this code:

```javascript
console.log(JSON.stringify(resultingCST, 2));
```

You can also run the parser tests with the following command:

```bash
yarn test
```

It will basically clone some java repositories and try to parse every java file.

### prettier-java-plugin

In this section, we suppose you are in the packages/prettier-plugin-java folder.

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

If you would like to run all the prettier-java-plugin tests, simple use the following command:

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
