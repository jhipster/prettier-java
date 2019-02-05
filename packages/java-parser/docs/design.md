# Parser Design

## Objective

Create an **easy to maintain** and **"good" performance** Java Parser
implemented in JavaScript.

## Guidelines

### The Parser implementation should align closely to the specifications

This does not mean that the parser should implement the [Java specifications][java11_spec]
correctly, that is something that **any** Java Parser must do.

Instead this means that the **style and organization** of the Parser should align
closely with the style and organization of the specifications.
For example:

- Same production names.
- Same production contents.

- Pros
  - The close alignment makes it much easier to be certain
    that our implementation actually matches the specifications.
  - The close alignment makes it much easier to upgrade to future versions
    of the specifications.
- Cons

  - Optimizing for the spec alignment would normally cause a performance hit.

#### Issues with implementing such an alignment

The main problem is that the Java Grammar is **not** an LL(K) grammar
while the parsing library we are using (Chevrotain) mainly support LL(K)
grammars. This means that some grammar constructs cannot be directly translated:

- [**Left Recursion**](https://en.wikipedia.org/wiki/Left_recursion)
  - There is no mitigation for this, left recursion will cause an infinite loop
    in an top down recursive decent parser.
- **Infinite Lookahead** needed to decide between alternatives.
  - This is normally resolved by refactoring out the common prefix.
    But that would also cause a mis-alignment with the spec's style.
  - Instead this can be mitigated by [**backtracking**](https://en.wikipedia.org/wiki/Backtracking)
    But this comes at a performance cost.
    - More optimized backtracking can be manually implemented for mitigating
      the performance penalty at the cost of more code and complexity to maintain.

## Backtracking usage guidelines

TBD

[java11_spec]: https://docs.oracle.com/javase/specs/jls/se11/html/jls-19.html
