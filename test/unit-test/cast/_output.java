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
        Aaeaozeaonzeoazneaozenazone
        & Bazoieoainzeonaozenoazne
        & Cjneazeanezoanezoanzeoaneonazeono
      ) obj
    );
    foo(
      (
        Aaeaozeaonzeoazneaozenazone
        & Bazoieoainzeonaozenoazne
        & Cjneazeanezoanezoanzeoaneonazeono
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
}
