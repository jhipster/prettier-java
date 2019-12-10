public @interface AnnotationTypeDeclaration {
    public String value() default "";
    @RandomAnnotation Integer[][] annotatedArray = (Integer[][]) new Object[4][2];
    @RandomBreakingAnnotation(one = "One", two = "Two", three = "Three", four = "Four", five = "Five")
    Integer[][] annotatedArray = (Integer[][]) new Object[4][2];  
    @RandomAnnotationWithObject({"One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"})
    V[][] annotatedArray = (V[][]) new Object[rowList.size()][columnList.size()];
}