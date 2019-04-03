"use strict";
const unicode = {};
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2)[0];

let categories; // Variable that stores every category we are going to parse
let restIdentCharCategories; // Variable that stores categories used for javaIdentfierPart
const manuallyAddedCharacters = new Set([]); // Variable that stores authorized characters for javaIdentifierPart but that is not in a general category

// The Categories we only want to parse from the file.
// We don't need to store characters from the UnicodeData file that we are not going to use
// Only adding characters that are accepted as first character of a Java Identifier. See specs below.
// https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/Character.html#isJavaIdentifierStart(char)
const firstIdentCharCategories = new Set([
  "Ll",
  "Lm",
  "Lo",
  "Lt",
  "Lu",
  "Nl",
  "Sc",
  "Pc"
]);

// Adding remaining categories that can be used in a java identifier.
// https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/lang/Character.html#isUnicodeIdentifierPart(char)
const restIdentUnicodeCategories = new Set(["Mn", "Cf"]);

// Function that pushes in an object an attribute to store the characters
function pushInUnicode(a, b) {
  if (unicode.hasOwnProperty(a) === false) {
    unicode[a] = [parseInt(b)];
  } else {
    unicode[a].push(parseInt(b));
  }
}

function constructCategories() {
  const ranges = [
    // Below adding the isIdentifierIgnorable characters from Java Specs but not from FORMAT general category
    { start: "0000", end: "0008", base: 16 },
    { start: "000E", end: "001B", base: 16 },
    { start: "007F", end: "009F", base: 16 },

    // Below adding Combining Marks
    { start: "0300", end: "036F", base: 16 },
    { start: "1AB0", end: "1AFF", base: 16 },
    { start: "1DC0", end: "1DFF", base: 16 },
    { start: "20D0", end: "20FF", base: 16 },
    { start: "FE20", end: "FE2F", base: 16 },

    // Below adding Digits
    { start: "48", end: "57", base: 10 }
  ];

  ranges.forEach(range => {
    for (
      let i = parseInt(range.start, range.base);
      i <= parseInt(range.end);
      i++
    ) {
      manuallyAddedCharacters.add(i);
    }
  });

  // Constructing the whole JavaIdentifierPart category.
  restIdentCharCategories = new Set(
    (function*() {
      yield* firstIdentCharCategories;
      yield* restIdentUnicodeCategories;
    })()
  );

  // Merging all the accepted characters.
  categories = new Set(
    (function*() {
      yield* firstIdentCharCategories;
      yield* restIdentCharCategories;
    })()
  );
}

function readUnicodeData() {
  let lines;
  try {
    lines = fs.readFileSync(args, "utf-8").split("\n");
  } catch (err) {
    throw Error("Please specify the path of the UnicodeData.txt file");
  }
  let oldValue; // Algorithm purpose
  lines.forEach(line => {
    const theLine = line.split(";");
    if (!categories.has(theLine[2])) {
      return;
    }
    if (theLine[1].match(/Last>$/)) {
      for (
        let i = parseInt(oldValue, 16) + 1;
        i <= parseInt(theLine[0], 16);
        i++
      ) {
        pushInUnicode(theLine[2], i);
      }
    } else {
      pushInUnicode(theLine[2], parseInt(theLine[0], 16));
    }
    oldValue = theLine[0];
  });
}

// Generating a unicodesets.js file so that we don't have to reparse the file each time the parser is called.
function generateFile() {
  let data = `"use strict"
  const firstIdentChar = new Set([`;
  firstIdentCharCategories.forEach(el => {
    unicode[el].forEach(value => {
      data += `${value},`;
    });
  });
  data += `]);
  `;

  data += `const restIdentChar = new Set([`;
  restIdentCharCategories.forEach(el => {
    unicode[el].forEach(value => {
      data += `${value},`;
    });
  });
  manuallyAddedCharacters.forEach(v => (data += `${v},`));

  data += `]);
  `;
  data += `module.exports = {
    firstIdentChar,
    restIdentChar
  }`;
  fs.writeFileSync(
    path.resolve(__dirname, "../src/unicodesets.js"),
    data,
    err => {
      if (err) {
        throw err;
      }
    }
  );
}

// Calling the generation of the file.
constructCategories();
readUnicodeData();
generateFile();
