"use strict";
const unicode = {};
const fs = require("fs");
const path = require("path");
const args = process.argv.slice(2)[0];

let categories; // Variable that stores every category we are going to parse
let restIdentCharCategories; // Variable that stores categories used for javaIdentfierPart
// Variable that stores authorized characters for javaIdentifierPart but that is not in a general category
const manuallyAddedCharacters = {
  unicode: [],
  ranges: []
};

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
function pushInUnicode(cat, elt) {
  if (!unicode.hasOwnProperty(cat)) {
    unicode[cat] = {
      unicode: [],
      ranges: []
    };
  }

  if (Array.isArray(elt)) {
    unicode[cat].ranges.push(elt);
  } else {
    unicode[cat].unicode.push(elt);
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
    manuallyAddedCharacters.ranges.push([
      parseInt(range.start, range.base),
      parseInt(range.end, range.base)
    ]);
  });

  // Constructing the whole JavaIdentifierPart category.
  restIdentCharCategories = new Set(restIdentUnicodeCategories);

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
      pushInUnicode(theLine[2], [
        parseInt(oldValue, 16) + 1,
        parseInt(theLine[0], 16)
      ]);
    } else {
      pushInUnicode(theLine[2], parseInt(theLine[0], 16));
    }
    oldValue = theLine[0];
  });
}

// Generating a unicodesets.js file so that we don't have to reparse the file each time the parser is called.
function generateFile() {
  let data = `
  /*File generated with unicode.js*/
  "use strict"
  const f = (o, s, e) => {
  [...Array(e - s + 1).keys()].map(i => o.add(i + s));
  };
  const fic = new Set([`;
  firstIdentCharCategories.forEach(el => {
    unicode[el].unicode.forEach(value => {
      data += `${value},`;
    });
  });
  data += `]);
  `;

  firstIdentCharCategories.forEach(el => {
    unicode[el].ranges.forEach(array => {
      data += `f(fic,${array[0]},${array[1]});\n`;
    });
  });

  data += `const ricd = new Set([`;
  restIdentCharCategories.forEach(el => {
    unicode[el].unicode.forEach(value => {
      data += `${value},`;
    });
  });
  manuallyAddedCharacters.unicode.forEach(v => (data += `${v},`));

  data += `]);
  `;

  restIdentCharCategories.forEach(el => {
    unicode[el].ranges.forEach(array => {
      data += `f(ricd,${array[0]},${array[1]});\n`;
    });
  });

  manuallyAddedCharacters.ranges.forEach(array => {
    data += `f(ricd,${array[0]},${array[1]});\n`;
  });

  data += `const ric = new Set(function*() { yield* fic; yield* ricd; }());`;

  data += `module.exports = {
    firstIdentChar: fic,
    restIdentChar: ric
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
