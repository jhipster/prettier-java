open module soat.vending.machine.gui {
  requires java.desktopa;
  requires soat.vending.machine.model;
  requires transitive soat.core;
  exports fr.soat.vending.machine.model to another, again, ano;

  exports fr.soat.vending.machine.model.it.should.be.breaking.but.only.a.part
    to another, again, ano;

  exports fr.soat.vending.machine.model
    to
      another,
      again,
      ano,
      waht,
      another,
      again,
      ano,
      averyveryveryveryveryveryveryveryveryveryverylongname;

  opens fr.soat.vending.machine.model to another, again, ano;

  opens fr.soat.vending.machine.model.it.should.be.breaking.but.only.a.part
    to another, again, ano;

  opens fr.soat.vending.machine.model
    to
      another,
      again,
      ano,
      another,
      again,
      ano,
      another,
      again,
      ano,
      another,
      again,
      averyveryveryveryveryveryveryveryveryveryverylongname;

  uses fr.soat.vendinga.machine.services.DrinksService;

  provides model with another, again, ano;

  provides fr.soat.vending.machine.model.it.should.be.breaking.but.only.a.part
    with another, again, ano;

  provides model
    with
      another,
      again,
      ano,
      another,
      again,
      ano,
      another,
      again,
      ano,
      another,
      again,
      averyveryveryveryveryveryveryveryveryveryverylongname;
}
