import { CodeMirror } from './libs/editor/sql.editor.bundle.js';
import { execute } from './commands/exec.js';
import {
  tableContainer,
  editorContainer,
  commandElement,
  State,
  toBinArray,
  consoleElement
} from './common/common.js';
export const editor = CodeMirror(editorContainer, {});

editor.changeFontSize('12px');
editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
initSqlJs({
  locateFile: () => './libs/sql/sql-wasm.wasm'
}).then(SQL => (State.SQL = SQL));

window.addEventListener('resize', () =>
  tableContainer.innerHTML
    ? editor.setSize(window.innerWidth - 15, window.innerHeight / 2 - 80)
    : editor.setSize(window.innerWidth - 15, window.innerHeight - 80)
);

document.addEventListener('keydown', e => {
  const activeElement = document.activeElement;
  if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    State.executeSQL(editor.getSelection().trim() || editor.getValue());
  } else if (e.key === 'Enter') {
    if (activeElement === commandElement) {
      execute(commandElement);
    }
  } else if (e.key === 'Escape' && (e.ctrlKey || e.metaKey)) {
    State.activeWindow = editorContainer;
    if (commandElement.style.display === 'none') {
      commandElement.style.display = 'block';
      commandElement.focus();
    } else {
      commandElement.style.display = 'none';
      editor.focus();
    }
  }
});

consoleElement.addEventListener('dblclick', () => {
  if (commandElement.style.display === 'none') {
    commandElement.style.display = 'block';
    commandElement.focus();
  } else {
    commandElement.style.display = 'none';
  }
});

setTimeout(() => {
  document.body.removeChild(document.getElementById('splash-screen'));
  const db = window.localStorage.getItem('HyperLightDB');
  State.db = new State.SQL.Database(
    db &&
      toBinArray(
        LZUTF8.decompress(db, {
          inputEncoding: 'Base64',
          outputEncoding: 'String'
        })
      )
  );
}, 1000);
