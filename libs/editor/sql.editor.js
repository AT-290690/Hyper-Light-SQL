import { EditorState, Compartment } from '@codemirror/state';
import { lineNumbers } from '@codemirror/gutter';
import { history, historyKeymap } from '@codemirror/history';
import { foldGutter } from '@codemirror/fold';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets } from '@codemirror/closebrackets';
import { EditorView, keymap } from '@codemirror/view';
import { tags, HighlightStyle } from '@codemirror/highlight';
import { sql } from '@codemirror/lang-sql';
import { autocompletion } from '@codemirror/autocomplete';

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.variableName, color: 'var(--def)' },
  { tag: tags.definition, color: 'var(--def)' },
  { tag: tags.number, color: 'var(--number)' },
  { tag: tags.string, color: 'var(--string)' },
  { tag: tags.operator, color: 'var(--operator)' },
  { tag: tags.keyword, color: 'var(--keyword)' },
  { tag: tags.atom, color: 'var(--atom)' },
  { tag: tags.null, color: 'var(--atom)' },
  { tag: tags.bool, color: 'var(--atom)' },
  { tag: tags.comment, color: 'var(--comment)' },
  { tag: tags.tagName, color: 'var(--string)' },
  { tag: tags.className, color: 'var(--def)' },
  { tag: tags.propertyName, color: 'var(--def)' },
  { tag: tags.attributeName, color: 'var(--def)' },
  { tag: tags.labelName, color: 'var(--def)' },
  { tag: tags.contentSeparator, color: 'var(--def)' },
  { tag: tags.url, color: 'var(--def)' },
  { tag: tags.literal, color: 'var(--def)' },
  { tag: tags.inserted, color: 'var(--def)' },
  { tag: tags.deleted, color: 'var(--def)' },
  { tag: tags.deleted, color: 'var(--def)' },
  { tag: tags.meta, color: 'var(--def)' },
  { tag: tags.regexp, color: 'var(--operator)' },
  { tag: tags.escape, color: 'var(--operator)' }
]);
const languageConf = new Compartment();

const changeFontSize = size =>
  EditorView.theme({
    '&': {
      fontSize: size
    }
  });
let fontSize = '10px';
const changeTheme = () =>
  EditorView.theme(
    {
      '&': {
        fontFamily: 'var(--font-family)',
        color: 'var(--color-primary)',
        backgroundColor: 'var(--background-primary)',
        border: '1px solid var(--border)',
        paddingTop: '5px'
      },
      '.cm-matchingBracket': {
        color: 'var(--color-fourtly)'
      },
      '.cm-panel': {
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--color-primary)',
        border: '1px solid var(--border)'
      },
      '.cm-textfield': {
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--color-primary)',
        border: '1px solid var(--border)'
      },
      '.cm-tooltip-autocomplete': {
        backgroundColor: 'var(--background-secondary)',
        color: 'var(--color-primary)'
      },
      '.cm-button': {
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--color-primary)',
        border: '1px solid var(--border)',
        backgroundImage: 'none'
      },
      '.cm-tooltip': {
        fontFamily: 'var(--font-family)',
        padding: '3px',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--color-primary)',
        border: '1px solid var(--border)'
      },
      '.cm-content': {
        fontFamily: 'var(--font-family)',
        caretColor: 'var(--color-thirdly)'
      },
      '.cm-focused': {
        borderLeftColor: 'var(--color-thirdly)'
      },
      '.cm-cursor': {
        borderLeftColor: 'var(--color-thirdly)'
      },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: 'var(--background-secondary)'
      },
      '.cm-gutters': {
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--linenumbers)',
        border: 'none'
      }
    },
    { dark: true }
  );

const customDefaultKeymap = defaultKeymap.filter(
  keymap => keymap.key !== 'Escape'
);
export const CodeMirror = (parent = document.body) => {
  const extensions = [
    changeTheme(),
    EditorView.lineWrapping,
    myHighlightStyle,
    languageConf.of(sql()),
    lineNumbers(),
    history(),
    foldGutter(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    keymap.of([...customDefaultKeymap, ...historyKeymap, indentWithTab])
  ];
  const initialState = EditorState.create({
    extensions: [...extensions, changeFontSize(fontSize)]
  });
  const cm = new EditorView({
    state: initialState,
    parent
  });
  return {
    posToOffset: (pos, doc = cm.state.doc) =>
      doc.line(pos.line + 1).from + pos.ch,
    offsetToPos: (offset, doc = cm.state.doc) => {
      const line = doc.lineAt(offset);
      return { line: line.number - 1, ch: offset - line.from };
    },
    getWrapperElement: () => cm.dom,
    getScrollerElement: () => cm.scrollDOM,
    getInputField: () => cm.contentDOM,
    addValue: text => {
      cm.dispatch({
        changes: {
          from: cm.state.doc.length,
          to: cm.state.doc.length,
          insert: text
        }
      });
    },
    setValue: text => {
      cm.dispatch({
        changes: { from: 0, to: cm.state.doc.length, insert: text }
      });
    },
    getValue: () => cm.state.doc.toString(),
    getRange: (a, b) => cm.state.sliceDoc(a, b),
    getLine: n => cm.state.doc.line(n + 1).text,
    getSelection: () =>
      cm.state.sliceDoc(
        cm.state.selection.main.from,
        cm.state.selection.main.to
      ),
    focus: () => cm.focus(),
    hasFocus: () => cm.hasFocus,
    lineCount: () => cm.state.doc.lines,
    getCursor: () => cm.state.selection.main.head,
    setSize: (w, h) => {
      if (w) cm.dom.style.width = w + 'px';
      if (h) cm.dom.style.height = h + 'px';
    },
    replaceRange: (text, from, to) =>
      cm.dispatch({
        changes: { from, to, insert: text }
      }),
    replaceSelection: text => cm.dispatch(cm.state.replaceSelection(text)),
    setCursor: (pos, scroll = false) =>
      cm.dispatch({ selection: { anchor: pos }, scrollIntoView: scroll }),
    setSelection: (anchor, head) =>
      cm.dispatch({ selection: { anchor, head } }),
    changeFontSize: size => {
      fontSize = size;
      const newState = EditorState.create({
        extensions: [...extensions, changeFontSize(size)]
      });
      cm.setState(newState);
    },
    getDoc: () => cm.getDoc(),
    switchInstance: options => {
      const state = {
        extensions: [...extensions, changeFontSize(fontSize)]
      };
      const done = () => {
        cm.setState(EditorState.create(state));
        if (options.callback) {
          options.callback();
        }
      };

      if (options.doc) {
        state.doc = options.doc;
      }
      done();
    }
  };
};
