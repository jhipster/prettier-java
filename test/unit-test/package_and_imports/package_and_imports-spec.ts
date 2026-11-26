import path from "node:path";
import { fileURLToPath } from "node:url";
import { expectSnippetToBeFormatted, testSample } from "../../test-utils.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("prettier-java", () => {
  testSample(path.resolve(__dirname, "./classWithHeaderCommentAndImports"));
  testSample(path.resolve(__dirname, "./classWithMixedCaseImports"));
  testSample(path.resolve(__dirname, "./classWithMixedImports"));
  testSample(path.resolve(__dirname, "./classWithNoImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./classWithOnlyNonStaticImports"));
  testSample(path.resolve(__dirname, "./moduleWithMixedImports"));
  testSample(path.resolve(__dirname, "./moduleWithNoImports"));
  testSample(path.resolve(__dirname, "./moduleWithOnlyStaticImports"));
  testSample(path.resolve(__dirname, "./moduleWithOnlyNonStaticImports"));
  testSample(path.resolve(__dirname, "./packageWithAnnotationsAndImports"));

  describe("import header comments", () => {
    it("keeps file header comment before sorted imports without package", async () => {
      const snippet = `/*
 * Copyright header
 */

import java.util.List;
import com.example.Foo;

public class Example {}
`;
      const expectedOutput = `/*
 * Copyright header
 */

import com.example.Foo;
import java.util.List;

public class Example {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });

    it("keeps @format pragma before sorted imports with requirePragma", async () => {
      const snippet = `/**
 * @format
 */

import java.util.List;
import com.example.Foo;

public class Example {}
`;
      const expectedOutput = `/**
 * @format
 */

import com.example.Foo;
import java.util.List;

public class Example {}
`;
      await expectSnippetToBeFormatted({
        snippet,
        expectedOutput,
        prettierOptions: { requirePragma: true }
      });
    });

    it("preserves header comment without a following blank line", async () => {
      const snippet = `package org.mypackage;

/*-
 * Header
 */
import java.lang.Util;
import com.me.Util;

public class Example {}
`;
      const expectedOutput = `package org.mypackage;

/*-
 * Header
 */
import com.me.Util;
import java.lang.Util;

public class Example {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });

    it("keeps multiple header comments before sorted import groups", async () => {
      const snippet = `package org.mypackage;

// Header 1

/* Header 2 */

import java.util.Map;
import static com.me.Util.foo;
import module java.base;

public class Example {}
`;
      const expectedOutput = `package org.mypackage;

// Header 1

/* Header 2 */

import module java.base;

import static com.me.Util.foo;

import java.util.Map;

public class Example {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });

    it("keeps prettier-ignore attached to its import declaration", async () => {
      const snippet = `package org.mypackage;

/* License */

// prettier-ignore
import   java.util.Map;
import com.me.Util;

public class Example {}
`;
      const expectedOutput = `package org.mypackage;

/* License */

import com.me.Util;
// prettier-ignore
import   java.util.Map;

public class Example {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });

    it("keeps inline leading block comment attached to its import declaration", async () => {
      const snippet = `package org.mypackage;

/* License */
/* inline */ import java.util.Map;
import com.me.Util;

public class Example {}
`;
      const expectedOutput = `package org.mypackage;

/* License */
import com.me.Util;
/* inline */ import java.util.Map;

public class Example {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });

    it("does not split same-line comment chains spanning onto the first import or prettier-ignore", async () => {
      await expectSnippetToBeFormatted({
        snippet: `package a;

/* c1 */ /* c2
*/ import java.util.Map;
import com.me.Util;

class A {}
`,
        expectedOutput: `package a;

import com.me.Util;
/* c1 */ /* c2
 */ import java.util.Map;

class A {}
`
      });

      await expectSnippetToBeFormatted({
        snippet: `package a;

/* license */

/* c1 */ /* c2
*/ /* prettier-ignore */
import   java.util.Map;
import com.me.Util;

class A {}
`,
        expectedOutput: `package a;

/* license */

import com.me.Util;
/* c1 */ /* c2
 */ /* prettier-ignore */
import   java.util.Map;

class A {}
`
      });
    });

    it("keeps trailing comment on the first import attached to that import", async () => {
      const snippet = `package org.mypackage;

/* License */

import java.util.Map; // keep with Map
import com.me.Util;

public class Example {}
`;
      const expectedOutput = `package org.mypackage;

/* License */

import com.me.Util;
import java.util.Map; // keep with Map

public class Example {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });

    it("keeps header comment before sorted imports in module declaration", async () => {
      const snippet = `/*
 * License header
 */

import java.util.List;
import com.example.Service;

module com.example.app {}
`;
      const expectedOutput = `/*
 * License header
 */

import com.example.Service;
import java.util.List;

module com.example.app {}
`;
      await expectSnippetToBeFormatted({ snippet, expectedOutput });
    });
  });
});
