"use strict";
/* eslint-disable import/no-extraneous-dependencies, no-console */
const javaParserChev = require("../src/index");

const input = `StringBuilder builder = new StringBuilder();`;
javaParserChev.parse(
  `public interface Document {

  /**
   * Puts the value related to the key
   *
   * @param key   element key
   * @param value element value
   * @return Void
   */
  Void put(String key, Object value);

  /**
   * Gets the value for the key
   *
   * @param key element key
   * @return value or null
   */
  Object get(String key);

  /**
   * Gets the stream of child documents
   *
   * @param key         element key
   * @param constructor constructor of child class
   * @return child documents
   */
  <T> Stream<T> children(String key, Function<Map<String, Object>, T> constructor);
}`,
  "typeDeclaration"
);
