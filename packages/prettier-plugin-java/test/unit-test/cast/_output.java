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
}
