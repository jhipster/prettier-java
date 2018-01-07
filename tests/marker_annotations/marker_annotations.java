@Bean
public class MarkerAnnotations {

  @Resource
  SomeService service;

  @PostConstruct
  public void postConstruct() {
    System.out.println("post construct");
  }

}
