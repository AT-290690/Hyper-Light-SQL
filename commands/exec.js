import {
  consoleElement,
  printErrors,
  State,
  commandElement
} from '../common/common.js';
import { editor } from '../main.js';

export const execute = CONSOLE => {
  const CMD = CONSOLE.value.split(' ')[0].trim().toUpperCase();
  switch (CMD) {
    case 'CREATE':
      {
        State.db.run(editor.getValue());

        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
        commandElement.style.display = 'none';
        editor.focus();
      }
      break;
    case 'CLEAR':
      {
        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
      }
      break;
    case 'COPY':
      const stmt = State.db.prepare(editor.getValue());
      let rows = [];
      const max = {};
      let cols;
      while (stmt.step()) {
        const content = stmt.getAsObject();
        if (!cols) cols = Object.keys(content);
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
        return string + '\n';
      });
      cols = cols.map(
        key => ' '.repeat(2) + key + ' '.repeat(max[key] - key.length)
      );
      navigator.clipboard.writeText(cols.join('') + '\n\n' + rows.join('\n'));
      commandElement.style.display = 'none';
      editor.focus();
      break;
    case 'SAVE':
      CONSOLE.value = '';
      consoleElement.value = '';
      State.executeSQL(editor.getValue());
      commandElement.style.display = 'none';
      editor.focus();
      break;
    case 'HELP':
      // CONSOLE.value = 'ENCODE: encode \nDECODE: \nCLEAR:  \nRESET:';
      break;
    default:
      printErrors(CMD + ' does not exist!');
      break;
  }
};
