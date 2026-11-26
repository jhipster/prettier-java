public class Cast {

  void should_cast_with_single_element() {
    var myElem = (int) othrElement;
    var myElem = (A) othrElement;
    var myElem = (A) (othrElement, value) -> othrElement + value;
    var myElem =
      (Aaeaozeaonzeoazneaozenazonelkadndpndpazdpazdpazdpazdpazeazpeaazdpazdpazpdazdpa) othrElement;
  }

  void should_cast_with_additional_bounds() {
    foo((A & B) obj);
    foo((A & B & C) obj);
    foo(
      (
        Aaeaozeaonzeoazneaozenazone &
        Bazoieoainzeonaozenoazne &
        Cjneazeanezoanezoanzeoaneonazeono
      ) obj
    );
    foo(
      (
        Aaeaozeaonzeoazneaozenazone &
        Bazoieoainzeonaozenoazne &
        Cjneazeanezoanezoanzeoaneonazeono
      ) (othrElement, value) -> othrElement + value
    );
  }

  void many_nested_casts() {
    (
      (Map) (
        (Map) (
          (Map) (
            (Map) (
              (Map) (
                (Map) (
                  (Map) (
                    (Map) (
                      (Map) (
                        (Map) (
                          (Map) (
                            (Map) (
                              (Map) (
                                (Map) ((Map) ((Map) map).get(1)).get(1)
                              ).get(1)
                            ).get(1)
                          ).get(1)
                        ).get(1)
                      ).get(1)
                    ).get(1)
                  ).get(1)
                ).get(1)
              ).get(1)
            ).get(1)
          ).get(1)
        ).get(1)
      ).get(1)
    ).get(1);
  }

  void intersectionCastExpression() {
    Object o1 = (A & B) (C) o;
    Object o2 = (A & B) ~0;
    Object o3 = (A & B) switch (x) {
      default -> null;
    };
    Object o4 = (A & B) !x;
    Object o5 = (A & B) + x;
    Object o6 = (A & B) - x;
  }

  void castUpdateExpression() {
    int a = (int) x++;
    int b = (int) x--;
  }

  void genericCastInAssignments() {
    Map<String, Map<String, Object>> deepCopy =
      (Map<String, Map<String, Object>>) Helpers.deepCopyOf(map);
    Map<String, Object> shortLhs = (Map<String, Object>) Helpers.deepCopyOf(
      arg1,
      arg2,
      arg3,
      arg4
    );
    Map<String, Map<String, Object>> longLhs =
      (Map<String, Map<String, Object>>) Helpers.deepCopyOf(
        arg1,
        arg2,
        arg3,
        arg4
      );
    Map<String, Map<String, Object>> toVar =
      (Map<String, Map<String, Object>>) someOtherVariable;
    Map<String, Map<String, Object>> toChain =
      (Map<String, Map<String, Object>>) Helpers.foo().bar().baz();
    Map<String, Map<String, Object>> toSwitch =
      (Map<String, Map<String, Object>>) switch (x) {
        default -> null;
      };
    BiFunction<String, Integer, Boolean> toLambda =
      (BiFunction<String, Integer, Boolean>) (a, b) -> {
        return a.length() == b;
      };
    Map<String, Object> chainedCastFirst =
      (Map<String, Object>) (Object) Helpers.deepCopyOf(map);
    Map<String, Object> chainedCastSecond =
      (Object) (Map<String, Object>) Helpers.deepCopyOf(map);
    MyVeryLongInterfaceNameFooBar intersectionCast =
      (Foo & Bar & Baz) Helpers.deepCopyOf(map);
    var veryLongGenericCast =
      (ExtremelyLongGenericClassName<
        ExtremelyLongTypeArgOne,
        ExtremelyLongTypeArgTwo
      >) obj;
    var veryLongIntersectionCast =
      (
        Aaeaozeaonzeoazneaozenazone &
        Bazoieoainzeonaozenoazne &
        Cjneazeanezoanezoanzeoaneonazeono
      ) obj;
    this.deepCopyOfVeryLongFieldName =
      (Map<String, Map<String, Object>>) Helpers.deepCopyOf(map);
    try (
      Resource<String, Map<String, Object>> r =
        (Resource<String, Map<String, Object>>) Helpers.open(x)
    ) {
    }
    var castWithLeadingComment =
      // comment
      (ExtremelyLongGenericClassName<
        ExtremelyLongTypeArgOne,
        ExtremelyLongTypeArgTwo
      >) obj;
    Map<String, Map<String, Object>> castWithBlockComment =
      (Map</* c */ String, Map<String, Object>>) Helpers.deepCopyOf(map);
    Map<String, Map<String, Object>> castWithLineComment = (Map<
      // keep
      String,
      Map<String, Object>
    >) Helpers.deepCopyOf(map);
  }
}
