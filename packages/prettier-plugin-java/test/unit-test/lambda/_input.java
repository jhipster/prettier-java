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
}
