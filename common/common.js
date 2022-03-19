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
