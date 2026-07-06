import { catppuccinLatte, catppuccinMocha } from "@catppuccin/codemirror";
import { flavors } from "@catppuccin/palette";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from "@codemirror/commands";
import { java, javaLanguage } from "@codemirror/lang-java";
import {
  bracketMatching,
  foldKeymap,
  LanguageSupport,
  syntaxTree
} from "@codemirror/language";
import { RegExpCursor } from "@codemirror/search";
import {
  Compartment,
  EditorState,
  Prec,
  StateField,
  type Range
} from "@codemirror/state";
import {
  Decoration,
  EditorView,
  keymap,
  lineNumbers,
  type DecorationSet
} from "@codemirror/view";
import { useColorMode } from "@docusaurus/theme-common";
import { styleTags, tags as t } from "@lezer/highlight";
import { useEffect, useMemo, useRef } from "react";
import styles from "./index.module.css";

export default function CodeEditor(
  props: Readonly<{
    name?: string;
    readOnly?: boolean;
    ruler?: number;
    value?: string;
    onChange?: (value: string) => void;
  }>
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const codeMirror = useRef<EditorView | null>(null);
  const { colorMode } = useColorMode();

  const editorTheme = useMemo(() => new Compartment(), []);
  const rulerTheme = useMemo(() => new Compartment(), []);

  const activeTheme = useMemo(
    () => (colorMode === "dark" ? catppuccinMocha : catppuccinLatte),
    [colorMode]
  );

  const activeRuler = useMemo(() => {
    return createRulerTheme(props.ruler);
  }, [props.ruler]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const state = EditorState.create({
      doc: props.value,
      extensions: [
        lineNumbers(),
        closeBrackets(),
        bracketMatching(),
        new LanguageSupport(
          javaLanguage.configure({
            props: [
              styleTags({
                [[
                  "Annotation/Identifier",
                  "Annotation/ScopedIdentifier/...",
                  "MarkerAnnotation/Identifier",
                  "MarkerAnnotation/ScopedIdentifier/..."
                ].join(" ")]: t.annotation,
                CharacterLiteral: t.string
              })
            ]
          }),
          java().support
        ),
        editorTheme.of(activeTheme),
        syntaxHighlightOverridesTheme,
        Prec.highest(syntaxHighlightOverridesField),
        rulerTheme.of(activeRuler),
        history(),
        keymap.of([
          ...defaultKeymap,
          ...closeBracketsKeymap,
          ...historyKeymap,
          ...foldKeymap,
          indentWithTab,
          { key: "Ctrl-l", run: () => false }
        ]),
        EditorState.tabSize.of(4),
        EditorState.readOnly.of(props.readOnly ?? false),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            props.onChange?.(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    codeMirror.current = view;

    return () => view.destroy();
  }, []);

  useEffect(() => {
    if (!codeMirror.current) {
      return;
    }

    const { doc } = codeMirror.current.state;
    if (props.value !== doc.toString()) {
      codeMirror.current.dispatch({
        changes: {
          from: 0,
          to: doc.length,
          insert: props.value
        }
      });
    }
  }, [props.value]);

  useEffect(() => {
    codeMirror.current?.dispatch({
      effects: editorTheme.reconfigure(activeTheme)
    });
  }, [activeTheme, editorTheme]);

  useEffect(() => {
    codeMirror.current?.dispatch({
      effects: rulerTheme.reconfigure(activeRuler)
    });
  }, [activeRuler, editorTheme]);

  return (
    <div className={styles.editor} ref={editorRef}>
      <div className={styles.editorName}>{props.name}</div>
    </div>
  );
}

const syntaxHighlightOverridesTheme = EditorView.baseTheme({
  "&light .theme-blue": {
    color: flavors.latte.colors.blue.hex
  },
  "&dark .theme-blue": {
    color: flavors.mocha.colors.blue.hex
  },
  "&light .theme-red": {
    color: flavors.latte.colors.red.hex
  },
  "&dark .theme-red": {
    color: flavors.mocha.colors.red.hex
  },
  "&light .theme-yellow": {
    color: flavors.latte.colors.yellow.hex
  },
  "&dark .theme-yellow": {
    color: flavors.mocha.colors.yellow.hex
  }
});

const blueDecoration = Decoration.mark({ class: "theme-blue" });
const redDecoration = Decoration.mark({ class: "theme-red" });
const yellowDecoration = Decoration.mark({ class: "theme-yellow" });

const definitionDecorationsByParentName: Record<
  string,
  Decoration | undefined
> = {
  ClassDeclaration: yellowDecoration,
  ConstructorDeclaration: blueDecoration,
  EnumConstant: blueDecoration,
  EnumDeclaration: yellowDecoration,
  InterfaceDeclaration: yellowDecoration,
  MethodDeclaration: blueDecoration,
  TypeParameter: yellowDecoration
};

const syntaxHighlightOverridesField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(decorations, { docChanged, changes, state }) {
    if (!docChanged && decorations.size) {
      return decorations.map(changes);
    }

    const decorationRanges: Range<Decoration>[] = [];

    syntaxTree(state).iterate({
      enter({ name, node: { parent }, from, to }) {
        let decoration: Decoration | undefined;
        if (name === "Definition" && parent) {
          decoration = definitionDecorationsByParentName[parent.name];
        }
        if (decoration && from < to) {
          decorationRanges.push(decoration.range(from, to));
        }
      }
    });

    const cursor = new RegExpCursor(
      state.doc,
      /\\([bstnfr"'\\]|\r?\n|\r|[0-3]?[0-7]{1,2}|u[a-fA-F0-9]{4})/.source
    );

    for (const { from, to } of cursor) {
      decorationRanges.push(redDecoration.range(from, to));
    }

    return Decoration.set(decorationRanges, true);
  },

  provide(field) {
    return EditorView.decorations.from(field);
  }
});

function createRulerTheme(printWidth?: number) {
  if (!printWidth) {
    return EditorView.theme({});
  }

  return EditorView.theme({
    ".cm-content::before": {
      content: '""',
      position: "absolute",
      top: "0",
      bottom: "0",
      left: `${printWidth}ch`,
      width: "1px",
      backgroundColor: "color-mix(in oklab, currentColor 10%, transparent)",
      pointerEvents: "none",
      zIndex: "1",
      marginLeft: "6px"
    }
  });
}
