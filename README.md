# Prettier Java

![](https://i.giphy.com/media/GNvOUgBvLzVwA/giphy.webp)

Check back soon :)

---

<!--

## Install

```bash
yarn add --dev --exact prettier prettier-plugin-java
```

## Use

```bash
prettier --write "**/*.java"
```

-->

If you're interested in contributing to the development of Prettier for Java, you can follow the [CONTRIBUTING guide from Prettier](https://github.com/prettier/prettier/blob/master/CONTRIBUTING.md), as it all applies to this repository too.

To test it out on a Java file:

* Clone this repository.
* Run `yarn`.
* Create a file called `test.java`.
* Run `yarn prettier test.java` to check the output.
* Run `test.sh ../some_project/**/*.java` it on your whole project and check for issues, check test_files/*.error (and compare with the .java and the prettier output *.prettier)
* Check [PREVIEW.md](PREVIEW.md) for current status of how how certain parts look like (generated automatically from the test cases)

# Testing
* You can call `yarn test`to test against all regular tests
* You can call `yarn test-prettier`to test if prettier can parse its own output