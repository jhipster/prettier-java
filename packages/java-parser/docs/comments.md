# Handling comments

## Objective

Attach each comment to a CST node or token as either leading or trailing comment.

### Attach comment to the highest node possible

A comment could often be attached at several nodes or token. For instance, in the following code snippet:

```java
// comment
public void t() {}
```

`// comment` could be attached to:

- the `methodDeclaration` node
- the `methodModifier` node
- the `public` token

We have made the decision to attach the comment to the highest node possible (the most enclosive one). It makes the more sense to us, and it ease handling comments in the prettier-plugin.

### Trailing comments

A comment should be considered as a trailing comment in very specific cases:

- If it is on the same line as the node/token it followed, and not on the same line as the node/token it preceded. For instance, `//comment` is considered as a trailing comment in the following code snippet:

  ```java
  int i = 1; // comment
  int j = 2;
  ```

- If it is at the end of the file

### Consecutives comments

If there are consecutive comments, each comment will be considered separately. For instance:

```java
int i = 1;
// comment1
// comment2
int j = 2;
```

`// comment1` and `// comment2` will be both attached as leading comments to the second `localVariableDeclarationStatement` node.

When in:

```java
int i = 1; // comment1
// comment2
int j = 2;
```

`// comment1` will be attached as a trailing comment to the first `localVariableDeclarationStatement` node and `// comment2` will be attached as a leading comment to the second one.
