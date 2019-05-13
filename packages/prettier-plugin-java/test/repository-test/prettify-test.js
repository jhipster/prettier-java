"use strict";

switch (process.env["TEST_REPOSITORY"]) {
  case "JHIPSTER-1":
    require("./jhipster-1-test");
    break;
  case "JHIPSTER-2":
    require("./jhipster-2-test");
    break;
  case "ALL":
    require("./core-test");
    require("./jhipster-1-test");
    require("./jhipster-2-test");
    break;
  case "CORE":
    require("./core-test");
    break;
  default:
    require("./core-test");
}
