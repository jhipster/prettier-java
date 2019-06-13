public class PrettierTest {
  var x = 0;

  public void myFunction(int arg1) {
    try {
      // Empty Statement
    } /*catch*/catch (EmptyStackException e) {
      throw new RuntimeException(e);
    } /*multi-catch*/catch (
      /*1*/FirstException | /*2*/SecondException |/*3*/ ThirdException e2
    ) {
      throw/*throw an exception*/ new/*don't forget new when throwing exceptions*/ RuntimeException(
        e2
      );
    } /*is always executed no matter what*/finally {
      System.out.println("That's all folks !");
    }
  }

  private void myFunction(/* axis x */
    int arg1,
    /* axis y */int arg2,
    /* axis z */int arg3
  ) {
    if (arg1 == 0 && arg2 == 0 && arg == 3) throw new RuntimeException(
      "X Y Z cannot be all 0"
    );

    int /*variable name is of value var */var = arg1 + arg2 + arg3;
    if/*true*/ (var == 0) {
      System.out.println("The value is 0");
    } else/*false*/ {
      int[] arr = {
        /*One*/1,
        /*Two */2,
        /*zero*/0,
        /*One again*/1,
        -1/*Minus One*/,
        0,
        2
      };

      loop: // Label statement
      //foreach
      for (int num /* num is every number in arr*/: arr) {
        /*switch*/switch (num) { //switch
          case 1:
            System.out.println("One ");
            System.out.println("One ");

            System.out.println("One ");
            /*just a break*/break;
          case 2:
            System.out.println("Two ");
            break;
          case 0:
            System.out.println("Zero ");

            continue/*labeled continued*/ loop;
          default/*def*/:
            /*labeled break*/break loop;
        }
      }
    }
  }

  private synchronized void myFunction(int arg1, int arg2/*overloading*/) {
    for (int i = 0; i < /*=*/arg1; i++) do/*dodododo*/ { //do whiles
      //asserting
      assert/*true*/ true == true;
      continue;
      break/*dead code*/;
      return/*dead code*/;
    } /*at least one iteration !*/while (false);
    synchronized/*declares synchronizd statement*/ (this) {
      while/*infinite loop*/ (true) /*stop the program*/throw new RuntimeException();
    }
  }
}

//Additionnal enumeration
enum Cards {
  //The Heart and the Spade
  HEART/*the heart*/,
  SPADES/*and the spade*/;
}
