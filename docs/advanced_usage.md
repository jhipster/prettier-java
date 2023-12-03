# Advanced Usage

## Configuration

You can customize some options to meet your needs. To do so, create a `.prettierrc.yml` file at the root of your project with:

```yaml
# Prettier configuration
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
2. Install Husky, Lint-staged, Prettier, the Prettier Java plugin locally `npm install --save-dev husky lint-staged prettier prettier-plugin-java`
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

There are no IDE extensions to use directly Prettier Java for the moment. There are however some alternatives in VSCode or Intellij.

### Prettier plugin

The easiest way to use Prettier-Java in you IDE is to install it locally (`npm install prettier prettier-plugin-java --save-dev`) and install the Prettier extension related to your IDE.

Please refer to the [Prettier Editor integration documentation](https://prettier.io/docs/en/editors.html) for more information.

### FileWatcher plugin

You can also use File Watcher to reformat your code on save. We will describe the procedure to to this in the VSCode and IntelliJ based IDEs.

#### VSCode

In VSCode, install the File Watcher extension, and add to your settings, if you have installed the prettier and prettier-plugin-java packages locally:

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

If you have installed the prettier and prettier-plugin-java packages globally, replace `npx prettier --write ${file}` command by `prettier --write ${file}`.

#### IntelliJ based IDEs:

Open your Preferences. Then, go to the `Tools/File Watchers` section and create a Watcher. To configure it, fill the form with these values:

- Name: `Prettier Java`
- File Type: `Java`
- Program: `npx prettier` if you have installed the prettier and prettier-plugin-java packages locally. Replace by `prettier` otherwise.
- Arguments: `--write $FilePathRelativeToProjectRoot$`
- Output path to refresh: `$FilePathRelativeToProjectRoot$`
- Trigger the watcher on external changes: `checked`

Please refer to the [Prettier "Using File Watchers" documentation](https://prettier.io/docs/en/webstorm.html#running-prettier-on-save-using-file-watcher) for more information.
