public class Args {

  public static void main(String[] args) {
  }

  public void none() {}

  public void one(String one) {}

  public void three(String one, Integer two, String three) {}

  public void longListOfParametersThatShouldBreak(String one, Integer two, String three, Integer four, String five, Integer six) {}

  void lastParameterDotDotDot(String str1, String... str2) {
  }

	void variableArityParameters(Object @Nullable... errorMessageArgs) {}

	void variableArityParameters(Object[] @Nullable... errorMessageArgs) {}

	void variableArityParameters(byte[] @Nullable... errorMessageArgs) {}

	void variableArityParameters(byte @Nullable... errorMessageArgs) {}

  void variableArityParameters(final String... strings) {}

	void variableArityParameters(byte... bytes) {}

	void variableArityParameters(final String[]... strings) {}

	void variableArityParameters(byte[]... bytes) {}

}
