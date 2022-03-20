import {
  consoleElement,
  printErrors,
  State,
  commandElement
} from '../common/common.js';
import { editor } from '../main.js';

export const execute = CONSOLE => {
  const stdInput = CONSOLE.value.split(' ');
  const CMD = stdInput[0].trim().toUpperCase();
  const stdArgs = stdInput.slice(1);

  switch (CMD) {
    case 'CREATE':
      {
        State.db.run(editor.getValue());
        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
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
      const stmt = State.db.prepare(
        editor.getSelection().trim() || editor.getValue()
      );
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
        return string;
      });
      cols = cols.map(
        key => ' '.repeat(2) + key + ' '.repeat(max[key] - key.length)
      );
      navigator.clipboard.writeText(cols.join('') + '\n\n' + rows.join('\n'));
      commandElement.style.display = 'none';
      break;
    case 'SAVE':
      CONSOLE.value = '';
      consoleElement.value = '';
      State.executeSQL(editor.getValue());
      commandElement.style.display = 'none';
      editor.focus();
      break;
    case 'SELECT':
      {
        const sql = `SELECT * FROM ${stdArgs[0]}`;
        State.executeSQL(sql);
        editor.setValue(sql);
        CONSOLE.value = '';
      }
      break;
    case 'TABLE':
      State.executeSQL(`SELECT * FROM ${stdArgs[0]}`);
      CONSOLE.value = '';
      break;
    case 'EMPLOYEES':
      editor.setValue(`DROP TABLE IF EXISTS employees;
      CREATE TABLE employees( id          integer,  name    text,
                                designation text,     manager integer,
                                hired_on    date,     salary  integer,
                                commission  float,    dept    integer);
      
        INSERT INTO employees VALUES (1,'JOHNSON','ADMIN',6,'1990-12-17',18000,NULL,4);
        INSERT INTO employees VALUES (2,'HARDING','MANAGER',9,'1998-02-02',52000,300,3);
        INSERT INTO employees VALUES (3,'TAFT','SALES I',2,'1996-01-02',25000,500,3);
        INSERT INTO employees VALUES (4,'HOOVER','SALES I',2,'1990-04-02',27000,NULL,3);
        INSERT INTO employees VALUES (5,'LINCOLN','TECH',6,'1994-06-23',22500,1400,4);
        INSERT INTO employees VALUES (6,'GARFIELD','MANAGER',9,'1993-05-01',54000,NULL,4);
        INSERT INTO employees VALUES (7,'POLK','TECH',6,'1997-09-22',25000,NULL,4);
        INSERT INTO employees VALUES (8,'GRANT','ENGINEER',10,'1997-03-30',32000,NULL,2);
        INSERT INTO employees VALUES (9,'JACKSON','CEO',NULL,'1990-01-01',75000,NULL,4);
        INSERT INTO employees VALUES (10,'FILLMORE','MANAGER',9,'1994-08-09',56000,NULL,2);
        INSERT INTO employees VALUES (11,'ADAMS','ENGINEER',10,'1996-03-15',34000,NULL,2);
        INSERT INTO employees VALUES (12,'WASHINGTON','ADMIN',6,'1998-04-16',18000,NULL,4);
        INSERT INTO employees VALUES (13,'MONROE','ENGINEER',10,'2000-12-03',30000,NULL,2);
        INSERT INTO employees VALUES (14,'ROOSEVELT','CPA',9,'1995-10-12',35000,NULL,1);`);
      CONSOLE.value = '';
      consoleElement.value = '';

      break;

    case 'HELP':
      CONSOLE.value =
        'CREATE, CLEAR, COPY, SAVE, SELECT, TABLE, EMPLOYEES, HELP';
      break;
    default:
      printErrors(CMD + ' does not exist!');
      break;
  }
};
