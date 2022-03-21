import { CodeMirror } from './libs/editor/sql.editor.bundle.js';
import { execute } from './commands/exec.js';
import {
  tableContainer,
  editorContainer,
  commandElement,
  State,
  toBinArray,
  copyButton,
  copyTable,
  exeButton,
  consoleElement,
  printErrors
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
copyButton.addEventListener('click', copyTable);
exeButton.addEventListener('click', () => {
  if (commandElement.style.display === 'block') {
    commandElement.style.display = 'none';
  } else {
    commandElement.style.display = 'block';
    commandElement.focus();
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
consoleElement.addEventListener('dragleave', ev => {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  ev.target.style.border = 'none';
});

const parseValue = value => {
  return value.split(',').map(v => `'${v}'`);
};
consoleElement.addEventListener('drop', ev => {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        const file = ev.dataTransfer.items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = () => {
          const [columns, ...rows] = reader.result.split('\n');
          const columnNames = columns
            .split(',')
            .map(c => `'${c}'`)
            .join(',');
          const fileName = file.name.split('.csv')[0];
          try {
            editor.setValue(
              `DROP TABLE IF EXISTS "${fileName}";
CREATE TABLE "${fileName}" (${columnNames});
              ${rows.reduce(
                (acc, values) =>
                  (acc += `\nINSERT INTO "${fileName}" (${columnNames}) \nVALUES (${parseValue(
                    values
                  )});`),
                ''
              )}
              `
            );

            // State.db.run(insert);
          } catch (err) {
            printErrors(err);
          }
        };
        reader.readAsText(file);
      }
    }
  }
  ev.target.style.border = 'none';
});
consoleElement.addEventListener('dragenter', ev => {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  ev.target.style.border = 'dashed 2px #7f83ff';
});
