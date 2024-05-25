# Advanced Usage

## Configuration

You can customize some options to meet your needs. To do so, add overrides to the `.prettierrc.yml` file that you created at the root of your project:

```yaml
# Prettier configuration
plugins:
  - prettier-plugin-java
overrides:
  - files:
      - "*.java"
    options:
      printWidth: 140
      tabWidth: 4
      useTabs: false
      trailingComma: false
```

Please refer to the [Prettier configuration documentation](https://prettier.io/docs/en/configuration.html) for more information.

## Pre-commit hooks:

To share your Git Hooks, we would suggest to follow this procedure:

1. Create a `package.json` file. For instance:
   ```bash
   echo "{}" > package.json
   ```
2. Install _Husky_, _Lint-staged_, _Prettier_, the _Prettier-Java_ plugin locally `npm install --save-dev husky lint-staged prettier prettier-plugin-java`
3. Add the following to your `package.json`:
   ```json
   "husky": {
     "hooks": {
       "pre-commit": "lint-staged"
     }
   },
   "lint-staged": {
     "*.{,java}": [
       "prettier --write",
       "git add"
     ]
   }
   ```

Please refer to the [Prettier Pre-commit Hook documentation](https://prettier.io/docs/en/precommit.html) for more information.

## IDE Integrations

There are currently no IDE extensions that directly invoke _Prettier-Java_. However, for _VSCode_ and _IntelliJ_, this can be configured manually.

### Prettier plugin

The easiest way to use _Prettier-Java_ in your IDE is to install it locally in your project (`npm install --save-dev --save-exact prettier prettier-plugin-java`) and install the _Prettier_ extension related to your IDE.

**_NOTE:_** it is not possible to invoke _Prettier-Java_ in your IDE without creating a `package.json` file unless you use an alternative to `npx` like [prettier-pnp](https://github.com/auvred/prettier-pnp) due to the way plugins are loaded. Further, _Prettier_ [recommends that the exact version of prettier be set and locked](https://prettier.io/docs/en/install) on a per-project basis, as formatting preferences change from version to version.

Please refer to the [Prettier Editor integration documentation](https://prettier.io/docs/en/editors.html) for more information.

### FileWatcher plugin

You can also use _File Watcher_ to reformat your code on save. We will describe the procedure to to this in the VSCode and IntelliJ based IDEs.

#### VSCode

In VSCode, install the _File Watcher_ extension, and add to your settings, if you have installed the `prettier` and `prettier-plugin-java` packages locally:

```json
"filewatcher.commands": [
  {
    "match": "\\.java",
    "isAsync": true,
    "cmd": "npx prettier --write ${file}",
    "event": "onFileChange"
  }
]
```

If you have installed the `prettier` and `prettier-plugin-java` packages globally, replace `npx prettier --write ${file}` command by `prettier --write ${file}`.

#### IntelliJ based IDEs:

Install the _Prettier_, _Prettier-Java_, and your `.prettierrc.yaml` file as previously described.

Open your Preferences. Then, go to the `Tools/File Watchers` section and create a Watcher. To configure it, fill the form with these values:

- **Name**: `Prettier Java`
- **File Type**: `Java`
- **Scope**: Project Files
- **Program**: `npx`
- **Arguments**: `prettier --write $FilePath$`
- **Output path to refresh**: `$FilePath$`
- **Auto-save edited files to trigger the watcher**: `unchecked`
- **Trigger the watcher on external changes**: `checked`

Please refer to the [Prettier "Using File Watchers" documentation](https://prettier.io/docs/en/webstorm.html#running-prettier-on-save-using-file-watcher) for more information.
