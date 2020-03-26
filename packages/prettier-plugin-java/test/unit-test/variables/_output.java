public class Variables {
  public static int STATIC_VARIABLE = 123;
  private static final Logger LOGGER = LoggerFactory.getLogger(
    ComplexFilterTest.class
  );

  int packageVariable = 234;
  private float privateVariable = 0.9f;

  private Integer nullVariable = null;
  private Integer createVariable = new Integer();

  private List<String> genericVariable1 = new ArrayList<>();
  private final Map<String, Button> buttonMap = new HashMap<>();
  private Bean<String> genericVariable2 = new Bean<String>("abc");
  private Bean<String> genericVariable2 = new Bean<String>(
    "abc",
    "def",
    "ghi",
    "jkl"
  );
  private Map<Integer, String> genericVariable4 = new HashMap<Integer, String>();
  private Map<Integer, String, Integer, String> genericVariable5 = new HashMap<Integer, String, Integer>();

  private Object[] arrayVariable1 = new Object[3];
  private Object[][] arrayVariable2 = new Object[3][3];
  private Object[] arrayVariable3 = new Object[] {};
  private Object[] arrayVariable4 = new Object[] { "abc", "def", "ghi" };
  private Object[] arrayVariable5 = new Object[] {
    "abc",
    "def",
    "ghi",
    "jkl",
    "mno",
  };
  private Object[] arrayVariable6 = { "abc", "def", "ghi" };

  private Range creator1 = this.dateRangeField.new Range(from, to);
  private Range creator2 = this.dateRangeField.new <Integer>Range(from, to);
  private Range<Date> creator3 =
    this.dateRangeField.new <Integer>Range<>(from, to);
  private Range<Date> creator3 = new <Integer>Range<>(from, to);

  private int hexLiteral = 0x0000;
  private int octLiteral = 001;

  private Interface anonymousClassVariable = new Interface() {

    @Override
    void doSomething() {
      System.out.println("do something");
    }
  };

  public void variableMethod(final int finalVariable) {
    int localVariable = 456;
    int castVariable = (int) (4 / 2);
  }

  public void localVariables() {
    final List<Filter> filterList = new ArrayList<>();
  }

  public void multipleVariableDeclaration() {
    String str = new String();
    Map<String, String> map = new HashMap<>();
  }

  public boolean localVariableDeclarationWhichBreak() {
    @Nullable
    final BackupStatus lastStatus = BackupStatus.fromDbValue(
      backupRepository.getLastStatus()
    );

    final BackupStatus lastStatus = BackupStatus.fromDbValue(
      backupRepository.getLastStatus()
    );

    @Nullable
    BackupStatus lastStatus = BackupStatus.fromDbValue(
      backupRepository.getLastStatus()
    );

    BackupStatus lastStatus = BackupStatus.fromDbValue(
      backupRepository.getLastStatus()
    );
  }

  public boolean localVariableDeclarationWhichDoNotBreak() {
    @Nullable
    final BackupStatus lastStatus = value;

    final BackupStatus lastStatus = value;

    @Nullable
    BackupStatus lastStatus = value;

    BackupStatus lastStatus = value;
  }

  public void breakVariables() {
    Obj newObject = new Object()
      .something()
      .more()
      .and()
      .that()
      .as()
      .well()
      .but()
      .not()
      .something();

    Object.test.creation thisObject = classWithName
      .invocationOne()
      .invocationTwo();

    Object.test.creation thisObject1 = classWithName.invocationOne(
      argument1,
      argument2,
      argument3
    );

    Object.test.creation thisObject2 = classWithName
      .invocationOne(argument1, argument2, argument3)
      .invocationTwo();

    Object.test.creation thisObject3 = classWithName
      .invocationOne()
      .invocationTwo(argument1, argument2, argument3);

    Object.test.creation thisObject4 = classWithName
      .invocationOne(argument1, argument2, argument3)
      .invocationTwo(argument1, argument2);

    Object.test.creation thisObject5 = classWithName
      .invocationOne(
        argument1WithAVeryVeryVeryVeryLongName,
        argument2,
        argument3
      )
      .attributeOne.attributeTwo.invocationTwo(argument1, argument2)
      .attributeThree.invocationThree();

    Object.test.creation thisObject6 = classWithName
      .invocationOne(argument1, argument2, argument3)
      .attributeOne.attributeTwo.invocationTwo(argument1, argument2)
      .attributeThree.invocationThree();
  }

  public void breakMultipleMethods() {
    boolean willDrop =
      predictDropResponse.getSendResult().isIgnorableFailure() ||
      predictDropResponse.getSendResult().isFatalError();
    boolean willDrop =
      predictDropResponse.getSendResult().isIgnorableFailure ||
      predictDropResponse.getSendResult().isFatalError;
    boolean willDrop =
      predictDropResponsegetSendResultisIgnorableFailure ||
      predictDropResponsegetSendResultisFatalError;
    boolean willDrop =
      predictDropResponse.getSendResult().isIgnorableFailure() ||
      predictDropResponsegetSendResultisFatalError;
  }

  public methodWithVariableInitializationWithComments() {
    Map<String, String> map =
      // there is a random comment on this line up here
      // and then there is a separate comment on this line down here
      new HashMap<>(
        someRandomMethodThatReturnsTheInitialMapThatWeWantToMutate()
      );
  }
}
