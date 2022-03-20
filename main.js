import { CodeMirror } from './libs/editor/sql.editor.bundle.js';
import { execute } from './commands/exec.js';
import {
  tableContainer,
  editorContainer,
  commandElement,
  State
} from './common/common.js';
export const editor = CodeMirror(editorContainer, {});

editor.changeFontSize('12px');
editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
initSqlJs({
  locateFile: () => './libs/sql/sql-wasm.wasm'
}).then(SQL => (State.db = new SQL.Database()));

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
    State.executeSQL();
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

setTimeout(() => {
  document.body.removeChild(document.getElementById('splash-screen'));
}, 1000);
