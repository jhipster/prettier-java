/*a*/open /*b*//*a*/module /*b*/soat/*a*/./*b*/vending.machine.gui {
  /*a*/requires /*a*/java.desktopa/*a*/;/*b*/
  requires soat.vending.machine.model;
  requires /*a*/transitive /*b*/soat.core;
  /*a*/exports /*b*/fr.soat.vending.machine.model
    /*a*/to /*b*/another/*a*/, /*b*/again/*c*/, /*d*/ano/*a*/;/*b*/

  // opens
    /*a*/opens /*b*/fr.soat.vending.machine.model /*a*/to
      /*b*/another/*a*/,
      /*b*/again/*c*/,
      /*d*/ano/*a*/;/*b*/

  // uses
  /*a*/uses /*b*/fr.soat.vendinga/*a*/./*b*/machine.services.DrinksService/*a*/;/*b*/
}