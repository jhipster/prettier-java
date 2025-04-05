public class Lambda {

  public void singleArgumentWithParens() {
    call((x) -> {
      System.out.println(x);
      System.out.println(x);
    });
  }

  public void singleArgumentWithoutParens() {
    call(x -> {
      System.out.println(x);
      System.out.println(x);
    });
  }

  public void multiArguments() {
    call((x, y) -> {
      System.out.println(x);
      System.out.println(y);
    });
  }

  public void multiParameters() {
    call((Object x, final String y) -> {
      System.out.println(x);
      System.out.println(y);
    });
  }

  public void emptyArguments() {
    call(() -> {
      System.out.println();
      System.out.println();
    });
  }

  public void onlyOneMethodInBodyWithCurlyBraces() {
    call(x -> {
      System.out.println(x);
    });
  }

  public void onlyOneMethodInBody() {
    call(x -> System.out.println(x));
  }

  public void lambdaWithoutBracesWhichBreak() {
    call(x -> foo.isVeryVeryVeryLongConditionTrue() &&
    foo.isAnotherVeryVeryLongConditionTrue());
    aaaaaaaaaa(bbbbbbbbbb -> "123456789012345678901234567890123456789012345678");
    aaaaaaaaaa(bbbbbbbbbb -> cccccccccc("123456789012345678901234567890123456"));
  }

  public void chainCallWithLambda() {
      Stream
          .of(1, 2)
          .map(n -> {
              // testing method
              return n * 2;
          })
          .collect(Collectors.toList());
  }

  public void lambdaWithLongListOfParameters() {
      final List<Integer> values = Stream
          .of(1, 2)
          .map((
                   aVeryLongListOfParameter,
                   aVeryLongListOfParameter,
                   aVeryLongListOfParameter,
                   aVeryLongListOfParameter,
                   aVeryLongListOfParameter,
                   aVeryLongListOfParameter
               ) -> {
              // testing method
              return n * 2;
          })
          .collect(Collectors.toList());

      final List<Integer> values = Stream
          .of(1, 2)
          .map((
                   aVeryLongListOfParameter,
                   aVeryLongListOfParameter,
                   aParameterTha
               ) -> {
              // testing method
              return n * 2;
          })
          .collect(Collectors.toList());
  }

  public void shortLambdaAssignation() {
      V t = t -> toto();
  }

    public void longLambdaAssignation() {
        V t = (
            aVeryLongListOfParameter,
            aVeryLongListOfParameter,
            aVeryLongListOfParameter,
            aVeryLongListOfParameter,
            aVeryLongListOfParaa
        ) -> {
            // testing method
            return n * 2;
        };
    }

    public void callWithLambdaAndExtraParameter() {
        CompletableFuture.supplyAsync(
            () -> {
                // some processing
                return 2;
            },
            executor
        );
    }

    public void testConstructor() {
        new Value(
            (
                x

            ) -> {
                // testing method
                return n * 2;
            }
        );

        new Value(
            (
                aVeryLongListOfParameter,
                aVeryLongListOfParameter
            ) -> {
                // testing method
                return n * 2;
            }
        );

      new Value(
          (
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter
          ) -> {
              // testing method
              return n * 2;
          }
      );
    }

    private static <T extends Group> Function<Constructor<?>, T> createInstance(
        Group entity
    ) {
        return ctor ->
            Try.of(a, () -> {
                @SuppressWarnings("unchecked")
                var ng = (T) ctor.newInstance(
                    entity.getId(),
                    entity.getSystemGenerated(),
                    entity.getVersionKey()
                );
                return ng;
            }).getOrElseThrow(ex -> new RuntimeException(ex));
    }

    void singleLambdaWithBlockLastArgument() {
        a.of(b, c, d, e -> {
            return f;
        });
    }

    void singleLambdaWithBlockLastArgumentAndLongArguments() {
        a.of(
            aaaaaaaaaaaaaaaaaaaaaaaaaa,
            bbbbbbbbbbbbbbbbbbbbbbbbbb,
            cccccccccccccccccccccccccc,
            dddddddddddddddddddddddddd,
            e -> {
                return f;
            }
        );
    }

    void singleLambdaWithBlockLastArgumentAndLongLambdaArgument() {
        a.of(b, c, d, eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee -> {
            return f;
        });
    }

    void singleLambdaWithBlockLastArgumentAndLongLambdaArguments() {
        a.of(b, (cccccccccccccccccccccccccc, dddddddddddddddddddddddddd, eeeeeeeeeeeeeeeeeeeeeeeeee) -> {
            return f;
        });
    }

    void multipleLambdaArguments() {
        a.of(b, c -> d, e -> {
            return f;
        });
    }

    void argumentAfterLambdaWithBlock() {
        a.of(b, c, d, e -> {
            return f;
        }, g);
    }

    void huggableArguments() {
        aaaaaaaaaaaaaaaaaaaaaaaa((bbbbbbbbbbbbbbbbbbbbbbbb, cccccccccccccccccccccccc, dddddddddddddddddddddddd) -> eeeeeeeeeeeeeeeeeeeeeeee.ffffffffffffffffffffffff());

        a.b(c -> d -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b(c -> d && eeeeeeeeee.ffffffffff() ? g && hhhhhhhhhh.iiiiiiiiii() : j && kkkkkkkkkk.llllllllll());

        a.b(c -> d && eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk) > 0);

        a.b(c, (c0, c1) -> d && eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk) > 0);

        a.b(c -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk) > 0);

        a.b(c, (c0, c1) -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk) > 0);

        a.b(c -> d && eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b(c, (c0, c1) -> d && eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b(c -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b(c -> {
            eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk);
        });

        a.b((c0, c1) -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b(c, (c0, c1) -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a( // comment
        (b, c, d) -> e.f());

        a(( // comment
        b, c, d) -> e.f());

        a((b, // comment
        c, d) -> e.f());

        a((b, c, d // comment
        ) -> e.f());

        a((b, c, d
        // comment
        ) -> e.f());

        a( /* comment */ (b, c, d) -> e.f());

        a(( /* comment */
        b, c, d) -> e.f());

        a((b, /* comment */ c, d) -> e.f());

        a((b, c, d /* comment */
        ) -> e.f());

        a((b, c, d
        /* comment */
        ) -> e.f());

        aaaaaaaaaaaaaaaaaaaaaaaa((bbbbbbbbbbbbbbbbbbbbbbbb, cccccccccccccccccccccccc, dddddddddddddddddddddddd
        // comment
        ) -> eeeeeeeeeeeeeeeeeeeeeeee.ffffffffffffffffffffffff());

        aaaaaaaaaaaaaaaaaaaaaaaa( /* comment */
        (bbbbbbbbbbbbbbbbbbbbbbbb, cccccccccccccccccccccccc, dddddddddddddddddddddddd) -> eeeeeeeeeeeeeeeeeeeeeeee.ffffffffffffffffffffffff());

        aaaaaaaaaaaaaaaaaaaaaaaa( /* comment */ (bbbbbbbbbbbbbbbbbbbbbbbb, cccccccccccccccccccccccc, dddddddddddddddddddddddd) -> eeeeeeeeeeeeeeeeeeeeeeee.ffffffffffffffffffffffff());

        a.b(c, (c0, c1
        // comment
        ) -> d && eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk) > 0);

        a.b(c, (c0, c1
        // comment
        ) -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk) > 0);

        a.b(c, (c0, c1
        // comment
        ) -> d && eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b((c0, c1
        // comment
        ) -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));

        a.b(c, (c0, c1
        // comment
        ) -> eeeeeeeeee.ffffffffff(gggggggggg, hhhhhhhhhh, iiiiiiiiii, jjjjjjjjjj, kkkkkkkkkk));
    }

    void lambdaWithLeadingComments() {
        System.out.println(
            List.of(1, 2, 3).stream().map(
                // a very long comment which explains the beatifullness of multiplication by 2
                // yes this is very important
                v -> v * 2
            ).collect(Collectors.summingInt(v -> v))
        );
    }

    void lambdaWithTrailingComments() {
        System.out.println(
            List.of(1, 2, 3).stream().map(
                v -> v * 2
                // a very long comment which explains the beatifullness of multiplication by 2
                // yes this is very important
            ).collect(Collectors.summingInt(v -> v))
        );
    }
}

class T {
    T() {
        super(x -> {
            // testing method
            return n * 2;
        });
    }

    T() {
        super((x,y) -> {
            // testing method
            return n * 2;
        });
    }

    T() {
        super((aVeryLongListOfParameter,
                  aVeryLongListOfParameter,
                  aVeryLongListOfParameter,
                  aVeryLongListOfParameter,
                  aVeryLongListOfParameter,
                  aVeryLongListOfParameter) -> {
            // testing method
            return n * 2;
        });
    }

    T() {
        super((
                  aVeryLongListOfParameter,
                  aVeryLongListOfParameter,
                  aParameterThatS
              ) -> {
            // testing method
            return n * 2;
        });
    }

    T() {
        super(a, () -> {
            return b;
        });
    }
}

enum Enum {
    VALUE(x -> {
        // testing method
        return n * 2;
    }),
    VALUE((x,y) -> {
        // testing method
        return n * 2;
    }),
    VALUE((aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aVeryLongListOfParameter) -> {
        // testing method
        return n * 2;
    }),
    VALUE((
              aVeryLongListOfParameter,
              aVeryLongListOfParameter,
              aParameterThatS
          ) -> {
        // testing method
        return n * 2;
    }),
    VALUE(x -> {
        // testing method
        return n * 2;
    }, other)
}
