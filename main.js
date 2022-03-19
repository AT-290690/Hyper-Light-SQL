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
  db: openDatabase(
    'hyperDB',
    '1.0',
    'this is a client side database',
    2 * 1024 * 1024
  ),
  lastSelection: ''
};

editor.changeFontSize('12px');
editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
const createTable = () => {
  tableContainer.style.display = 'block';
  editor.setSize(window.innerWidth - 15, window.innerHeight / 2 - 80);
};

const run = () => {
  editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
  tableContainer.style.display = 'none';
  tableContainer.innerHTML = '';
  consoleElement.value = '';
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');

  var table = document.createElement('table');
  var tr = table.insertRow(-1); // TABLE ROW.

  State.db.transaction(tx => {
    tx.executeSql(
      editor.getValue(),
      [],
      (tx, results) => {
        if (!results.rows.length)
          return editor.setSize(
            window.innerWidth - 15,
            window.innerHeight - 80
          );

        const col = Object.keys(results.rows[0]);
        col.forEach(key => {
          var th = document.createElement('th'); // TABLE HEADER.
          th.innerHTML = key;
          tr.appendChild(th);
        });

        for (let i = 0; i < results.rows.length; i++) {
          tr = table.insertRow(-1);
          for (let j = 0; j < col.length; j++) {
            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = results.rows.item(i)[col[j]];
          }
        }
        tableContainer.appendChild(table);
        createTable();
      },
      (tx, error) => {
        if (error) printErrors(error.message);
      }
    );
  }, null);
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
  } else if (e.key.toLowerCase() === 'q' && e.ctrlKey) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
    const selection = editor.getSelection();
    // const cursor = editor.getCursor();
    if (selection && !selection.includes('print')) {
      State.lastSelection = selection;
      const updatedSelection = `print (${selection})`;
      editor.replaceSelection(updatedSelection);
      // editor.setSelection(
      //   cursor - State.lastSelection.length,
      //   cursor - State.lastSelection.length + updatedSelection.length
      // );
    } else if (selection && State.lastSelection) {
      editor.replaceSelection(State.lastSelection);
      State.lastSelection = '';
    }
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
  editor.setValue(`
  SELECT * FROM "users";`);
}, 1000);
