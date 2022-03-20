import { editor } from '../main.js';
export const consoleElement = document.getElementById('console');
export const commandElement = document.getElementById('command');
export const tableContainer = document.getElementById('table-container');
export const editorContainer = document.getElementById('editor-container');
export const labelContainer = document.getElementById('labels-container');
export const copyButton = document.getElementById('copy-table');

export const printErrors = errors => {
  consoleElement.classList.remove('info_line');
  consoleElement.classList.add('error_line');
  consoleElement.value = errors;
};
export const copyTable = () => {
  const stmt = State.db.prepare(
    editor.getSelection().trim() || editor.getValue() || State.lastQuery
  );
  State.params && stmt.bind(State.params);
  let rows = [];
  const max = {};
  let cols;
  while (stmt.step()) {
    const content = stmt.getAsObject();
    if (!cols) cols = stmt.getColumnNames();
    cols.forEach(
      key =>
        (max[key] = Math.max(
          max[key] ?? 0,
          String(content[key]).length,
          key.length
        ))
    );
    rows.push(content);
  }
  rows = rows.map(content => {
    let string = '';
    cols.forEach(key => {
      const str = String(content[key]);
      string += ' '.repeat(2) + str + ' '.repeat(max[key] - str.length);
    });
    return string;
  });
  cols = cols.map(
    key => ' '.repeat(2) + key + ' '.repeat(max[key] - key.length)
  );
  navigator.clipboard.writeText(
    `/*\n${cols.join('')}\n\n${rows.join('\n')}\n*/`
  );
  stmt.free();
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');
  consoleElement.value = 'Copied table to clipboard!';
  setTimeout(() => (consoleElement.value = ''), 3000);
};
export const State = {
  params: null,
  lastQuery: '',
  executeSQL: (sql = editor.getValue()) => {
    sql.trim() && (State.lastQuery = sql);
    editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
    tableContainer.style.display = 'none';
    copyButton.style.display = 'none';
    tableContainer.innerHTML = '';
    consoleElement.value = '';
    consoleElement.classList.add('info_line');
    consoleElement.classList.remove('error_line');

    const table = document.createElement('table');
    let tr = table.insertRow(-1);
    const rows = [];

    try {
      const stmt = State.db.prepare(sql);
      State.params && stmt.bind(State.params);
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
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
    tableContainer.style.display = 'block';
    copyButton.style.display = 'block';
    editor.setSize(window.innerWidth - 15, window.innerHeight / 2 - 80);
  }
};

export const toBinArray = str => {
  const l = str.length,
    arr = new Uint8Array(l);
  for (let i = 0; i < l; i++) arr[i] = str.charCodeAt(i);
  return arr;
};

export const toBinString = arr => {
  const uarr = new Uint8Array(arr);
  const strings = [],
    chunksize = 0xffff;
  // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
  for (let i = 0; i * chunksize < uarr.length; i++) {
    strings.push(
      String.fromCharCode.apply(
        null,
        uarr.subarray(i * chunksize, (i + 1) * chunksize)
      )
    );
  }
  return strings.join('');
};
