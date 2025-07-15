import { useHistory, useLocation } from "@docusaurus/router";
import CodeEditor from "@site/src/components/CodeEditor";
import Layout from "@theme/Layout";
import LZString from "lz-string";
import prettierPluginJava from "prettier-plugin-java";
import prettier from "prettier/standalone";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";

interface State {
  printWidth?: number;
  tabWidth?: number;
  useTabs?: boolean;
  arrowParens?: ArrowParens;
  trailingComma?: TrailingComma;
  experimentalOperatorPosition?: ExperimentalOperatorPosition;
  requirePragma?: boolean;
  code?: string;
}

enum ArrowParens {
  Always = "always",
  Avoid = "avoid"
}

enum TrailingComma {
  All = "all",
  Es5 = "es5",
  None = "none"
}

enum ExperimentalOperatorPosition {
  Start = "start",
  End = "end"
}

const codeSample = `public interface MyInterface {
  String foo();
  int[] bar();
}

public abstract class Foo implements MyInterface {
  @Override public String foo() {
            // TODO: return an actual value here
        return "hello";
      }
  @Override public int[] bar() {
    return new int[] {  1,

      2, 3,
    };
  }

  public final static boolean baz(final String foo, final int bar, final boolean baz) {
    return baz;
  }
}`;

export default function Playground() {
  return (
    <Layout noFooter title="Playground">
      <main>
        <Inner />
      </main>
    </Layout>
  );
}

function Inner() {
  const history = useHistory();
  const location = useLocation();

  const initialState = readState(location.hash.slice(1));

  const [printWidth, setPrintWidth] = useState(initialState.printWidth ?? 80);
  const [tabWidth, setTabWidth] = useState(initialState.tabWidth ?? 2);
  const [useTabs, setUseTabs] = useState(initialState.useTabs ?? false);
  const [arrowParens, setArrowParens] = useState(
    initialState.arrowParens ?? ArrowParens.Always
  );
  const [trailingComma, setTrailingComma] = useState(
    initialState.trailingComma ?? TrailingComma.All
  );
  const [experimentalOperatorPosition, setExperimentalOperatorPosition] =
    useState(
      initialState.experimentalOperatorPosition ??
        ExperimentalOperatorPosition.End
    );
  const [requirePragma, setRequirePragma] = useState(
    initialState.requirePragma ?? false
  );
  const [code, setCode] = useState(initialState.code ?? codeSample);
  const [formattedCode, setFormattedCode] = useState("");

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      const hash = writeState({
        printWidth,
        tabWidth,
        useTabs,
        arrowParens,
        trailingComma,
        experimentalOperatorPosition,
        requirePragma,
        code
      });
      history.replace({ ...location, hash });
    }

    prettier
      .format(code, {
        parser: "java",
        plugins: [prettierPluginJava],
        printWidth,
        tabWidth,
        useTabs,
        arrowParens,
        trailingComma,
        experimentalOperatorPosition,
        requirePragma
      })
      .then(setFormattedCode)
      .catch(error => setFormattedCode(error.message));
  }, [
    printWidth,
    tabWidth,
    useTabs,
    arrowParens,
    trailingComma,
    experimentalOperatorPosition,
    requirePragma,
    code
  ]);

  return (
    <div className={styles.playground}>
      <div className={styles.options}>
        <details open>
          <summary>Global</summary>
          <label title="The line length that the printer will wrap on.">
            --print-width{" "}
            <input
              type="number"
              min={0}
              value={printWidth}
              onChange={event => setPrintWidth(event.target.valueAsNumber)}
            />
          </label>
          <label title="The number of spaces per indentation-level.">
            --tab-width{" "}
            <input
              type="number"
              min={0}
              value={tabWidth}
              onChange={event => setTabWidth(event.target.valueAsNumber)}
            />
          </label>
          <label title="Indent lines with tabs instead of spaces.">
            <input
              type="checkbox"
              checked={useTabs}
              onChange={event => setUseTabs(event.target.checked)}
            />{" "}
            --use-tabs
          </label>
        </details>
        <details open>
          <summary>Java</summary>
          <label title="Include parentheses around a sole arrow function parameter.">
            --arrow-parens{" "}
            <select
              value={arrowParens}
              onChange={event =>
                setArrowParens(event.target.value as ArrowParens)
              }
            >
              {Object.values(ArrowParens).map(option => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label title="Print trailing commas wherever possible when multi-line.">
            --trailing-comma{" "}
            <select
              value={trailingComma}
              onChange={event =>
                setTrailingComma(event.target.value as TrailingComma)
              }
            >
              {Object.values(TrailingComma).map(option => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label title="Where to print operators when binary expressions wrap lines.">
            --experimental-operator-position{" "}
            <select
              value={experimentalOperatorPosition}
              onChange={event =>
                setExperimentalOperatorPosition(
                  event.target.value as ExperimentalOperatorPosition
                )
              }
            >
              {Object.values(ExperimentalOperatorPosition).map(option => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </details>
        <details open>
          <summary>Special</summary>
          <label title="Require either '@prettier' or '@format' to be present in the file's first docblock comment in order for it to be formatted.">
            <input
              type="checkbox"
              checked={requirePragma}
              onChange={event => setRequirePragma(event.target.checked)}
            />{" "}
            --require-pragma
          </label>
        </details>
      </div>
      <div className={styles.editors}>
        <CodeEditor rulers={[printWidth]} value={code} onChange={setCode} />
        {isFirstRun.current ? null : (
          <CodeEditor readOnly rulers={[printWidth]} value={formattedCode} />
        )}
      </div>
    </div>
  );
}

function readState(hash: string): State {
  try {
    return JSON.parse(LZString.decompressFromEncodedURIComponent(hash)) ?? {};
  } catch {
    return {};
  }
}

function writeState(state: State) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(state));
}
