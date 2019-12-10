package test;

@SingleMemberAnnotation2(
  name = "Something much long that breaks",
  date = "01/01/2018"
)
@SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
@NormalAnnotation("value")
@MarkerAnnotation
public class MarkerAnnotations {
  @SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
  )
  @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
  @NormalAnnotation("value")
  @MarkerAnnotation
  SomeService service;

  @SingleMemberAnnotation2(
    name = "Something much long that breaks",
    date = "01/01/2018"
  )
  @SingleMemberAnnotation1(name = "Thorben von Hacht", date = "01/01/2018")
  @NormalAnnotation("value")
  @MarkerAnnotation
  public void postConstruct() {
    System.out.println("post construct");
  }

  @SuppressWarnings({ "rawtypes", "unchecked" })
  @SuppressWarnings2(
    {
      "rawtypes",
      "unchecked",
      "something",
      "something2",
      "something3",
      "something4"
    }
  )
  public void elementValueArrayInitializer() {
    System.out.println("element value array initializer");
  }

  @ArrayInitializersWithKey(
    key = { "abc", "def" },
    key2 = { "ghi", "jkl" },
    key3 = { "mno", "pqr" }
  )
  public void arrayInitializerWithKey() {
    System.out.println("element value array initializer with key");
  }
}
