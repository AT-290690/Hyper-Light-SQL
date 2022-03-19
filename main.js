import { CodeMirror } from './libs/editor/sql.editor.bundle.js';
import { execute } from './commands/exec.js';
import {
  tableContainer,
  editorContainer,
  commandElement,
  consoleElement,
  printErrors
} from './common/common.js';
export const editor = CodeMirror(editorContainer, {});
export const State = {
  lastSelection: ''
};

editor.changeFontSize('12px');
editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
const createTable = () => {
  tableContainer.style.display = 'block';
  editor.setSize(window.innerWidth - 15, window.innerHeight / 2 - 80);
};

initSqlJs({
  locateFile: () => './libs/sql/sql-wasm.wasm'
}).then(SQL => (State.db = new SQL.Database()));

const run = () => {
  editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
  tableContainer.style.display = 'none';
  tableContainer.innerHTML = '';
  consoleElement.value = '';
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');

  const table = document.createElement('table');
  let tr = table.insertRow(-1);
  const rows = [];

  try {
    const stmt = State.db.prepare(editor.getValue());
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
  } catch (err) {
    printErrors(err);
  }

  if (!rows.length)
    return editor.setSize(window.innerWidth - 15, window.innerHeight - 80);

  const cols = Object.keys(rows[0]);
  cols.forEach(key => {
    const th = document.createElement('th');
    th.innerHTML = key;
    tr.appendChild(th);
  });

  for (let i = 0; i < rows.length; i++) {
    tr = table.insertRow(-1);
    for (let j = 0; j < cols.length; j++) {
      const tabCell = tr.insertCell(-1);
      tabCell.innerHTML = rows[i][cols[j]];
    }
  }
  tableContainer.appendChild(table);
  createTable();
};
window.addEventListener('resize', () => {
  if (tableContainer.innerHTML) {
    tableContainer.style.display = 'none';
    tableContainer.innerHTML = '';
  }

  editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
});

document.addEventListener('keydown', e => {
  const activeElement = document.activeElement;
  if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    run();
  } else if (e.key === 'Enter') {
    if (activeElement === commandElement) {
      execute(commandElement);
    }
  } else if (e.key === 'Escape') {
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
