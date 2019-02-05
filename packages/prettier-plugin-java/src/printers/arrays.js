"use strict";
/* eslint-disable no-unused-vars */
class ArraysPrettierVisitor {
  arrayInitializer(ctx) {
    return "arrayInitializer";
  }

  variableInitializerList(ctx) {
    return "variableInitializerList";
  }
}

module.exports = {
  ArraysPrettierVisitor
};
