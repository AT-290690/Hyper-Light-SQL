import { consoleElement, printErrors } from '../common/common.js';
import { editor, State } from '../main.js';

export const execute = CONSOLE => {
  const CMD = CONSOLE.value.split(' ')[0].trim().toUpperCase();
  switch (CMD) {
    case 'CLEAR':
      {
        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
      }
      break;
    case 'RESET':
      {
        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
      }
      break;
    case 'SAVE':
      CONSOLE.value = '';
      consoleElement.value = '';
      break;
    case 'HELP':
      // CONSOLE.value = 'ENCODE: encode \nDECODE: \nCLEAR:  \nRESET:';
      break;
    default:
      printErrors(CMD + ' does not exist!');
      break;
  }
};
