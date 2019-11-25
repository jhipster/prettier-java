import com.other.interfaces.OfferedI;
import com.other.interfaces.RequiredI;

/**
 * This is the comment describing the interface
 */
public /*a*/interface /*b*/MyInterface
  /*a*/extends /*b*//*a*/OfferedI/*b*//*a*/, /*b*//*a*/RequiredI /*b*/{
  // comment
  /**
   * Javadoc
   * @param p1 parameter 1
   * @param p2 parameter 2
   * @throws Exception Exception comment
   * @throws RuntimeException RuntimeException comment
   */
  public void myMethodInterface(
    Param1 /*a*/p1/*b*//*a*/,
    /*b*//*a*/Param2 /*b*//*a*/p2/*b*/,
    Param3 p3
  )
    /*a*/throws /*b*/Exception/*a*/, /*b*/RuntimeException /*a*/;/*b*/
}
