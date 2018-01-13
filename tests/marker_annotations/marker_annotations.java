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

}
