import { editor } from '../main.js';
export const consoleElement = document.getElementById('console');
export const commandElement = document.getElementById('command');
export const tableContainer = document.getElementById('table-container');
export const editorContainer = document.getElementById('editor-container');
export const labelContainer = document.getElementById('labels-container');
export const printErrors = errors => {
  consoleElement.classList.remove('info_line');
  consoleElement.classList.add('error_line');
  consoleElement.value = errors;
};

export const State = {
  params: null,
  executeSQL: (sql = editor.getValue()) => {
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
      const stmt = State.db.prepare(sql);
      State.params && stmt.bind(State.params);
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
    tableContainer.style.display = 'block';
    editor.setSize(window.innerWidth - 15, window.innerHeight / 2 - 80);
  }
};

export const toBinArray = str => {
  var l = str.length,
    arr = new Uint8Array(l);
  for (var i = 0; i < l; i++) arr[i] = str.charCodeAt(i);
  return arr;
};

export const toBinString = arr => {
  var uarr = new Uint8Array(arr);
  var strings = [],
    chunksize = 0xffff;
  // There is a maximum stack size. We cannot call String.fromCharCode with as many arguments as we want
  for (var i = 0; i * chunksize < uarr.length; i++) {
    strings.push(
      String.fromCharCode.apply(
        null,
        uarr.subarray(i * chunksize, (i + 1) * chunksize)
      )
    );
  }
  return strings.join('');
};
