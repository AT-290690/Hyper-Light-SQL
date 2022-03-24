import {
  consoleElement,
  printErrors,
  State,
  toBinString,
  toBinArray,
  tableContainer,
  copyTable,
  downloadCSVFile,
  htmlToCSV
} from '../common/common.js';
import { editor } from '../main.js';

export const execute = CONSOLE => {
  const stdInput = CONSOLE.value.split(' ');
  const CMD = stdInput[0].trim().toUpperCase();
  const stdArgs = stdInput.slice(1);

  switch (CMD) {
    case 'SETUP':
      {
        State.db.run(editor.getValue());
        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
      }
      break;
    case 'OPEN':
      State.db = new State.SQL.Database();
      CONSOLE.value = '';
      break;
    case 'CLOSE':
      State.db.close();
      CONSOLE.value = '';
      break;
    case 'CLEAR':
      {
        editor.setValue('');
        CONSOLE.value = '';
        consoleElement.value = '';
        tableContainer.style.display = 'none';
        editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
      }
      break;
    case 'COPY':
      copyTable();
      break;
    case 'X':
    case 'RUN':
      consoleElement.value = '';
      State.executeSQL(editor.getValue());
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
      break;
    case 'INFO':
      State.executeSQL(`PRAGMA table_info(${stdArgs[0]})`);
      break;
    case 'TABLES':
      State.executeSQL(`SELECT name FROM sqlite_schema
      WHERE type='table'
      ORDER BY name;`);
      break;
    case 'IMPORT':
      State.db = new State.SQL.Database(
        toBinArray(
          LZUTF8.decompress(stdArgs[0], {
            inputEncoding: 'Base64',
            outputEncoding: 'String'
          })
        )
      );
      CONSOLE.value = '';
      break;
    case 'SET':
      {
        (State.params = JSON.parse(stdArgs.join(' ')))
          ? State.executeSQL()
          : (CONSOLE.value = '');
      }
      break;
    case 'PARAMS':
      CONSOLE.value = `SET ${State.params ? JSON.stringify(State.params) : ''}`;
      break;
    case 'EXPORT':
      CONSOLE.value = LZUTF8.compress(toBinString(State.db.export()), {
        outputEncoding: 'Base64'
      });
      break;
    case 'CSV':
      downloadCSVFile(
        htmlToCSV(tableContainer.firstChild).join('\n'),
        stdArgs[0]
      );
      CONSOLE.value = '';
      break;
    case 'STASH':
      window.localStorage.setItem(
        'HyperLightDB',
        LZUTF8.compress(toBinString(State.db.export()), {
          outputEncoding: 'Base64'
        })
      );
      CONSOLE.value = '';
      break;
    case 'RESET':
      const db = window.localStorage.getItem('HyperLightDB');
      State.db.close();
      State.db = new State.SQL.Database(
        db &&
          toBinArray(
            LZUTF8.decompress(db, {
              inputEncoding: 'Base64',
              outputEncoding: 'String'
            })
          )
      );
      CONSOLE.value = '';
      tableContainer.style.display = 'none';

      editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
      break;
    case 'DROP':
      State.executeSQL(`DROP TABLE IF EXISTS ${stdArgs}`);
      CONSOLE.value = '';
      break;
    case 'WHYPE':
      State.db.close();
      State.db = new State.SQL.Database();
      CONSOLE.value = '';
      tableContainer.style.display = 'none';

      editor.setSize(window.innerWidth - 15, window.innerHeight - 80);
      break;
    case 'FORGET':
      window.localStorage.removeItem('HyperLightDB');
      CONSOLE.value = '';
      break;
    case 'EMPLOYEES_SCHEMA':
      editor.setValue(`DROP TABLE IF EXISTS employees;
        CREATE TABLE employees( id          integer,  name    text,
                                  designation text,     manager integer,
                                  hired_on    date,     salary  integer,
                                  commission  float,    dept    integer);`);
      CONSOLE.value = '';
      consoleElement.value = '';
      break;
    case 'EMPLOYEES_DATA':
      editor.setValue(`INSERT INTO employees VALUES (1,'JOHNSON','ADMIN',6,'1990-12-17',18000,NULL,4);
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
    case 'FROM_FOLDER': {
      const upload = document.createElement('input');
      document.body.appendChild(upload);
      upload.setAttribute('webkitdirectory', true);
      upload.setAttribute('multiple', true);
      upload.type = 'file';
      upload.name = 'load-folder';

      upload.addEventListener(
        'change',
        e => {
          const files = e.currentTarget.files;
          for (let i = 0; i < files.length; i++) {
            let filePath = files[i].webkitRelativePath.split('/');
            filePath.shift();
            filePath = filePath.join('/');
            const filename = filePath.split('.');
            const type = filename.pop();
            if (type !== 'csv' && type !== 'sch') continue;
            const reader = new FileReader();
            reader.onload = async e => {
              if (type === 'csv') {
                const [columns, ...rows] = window
                  .atob(e.target.result.split('base64,')[1])
                  .split('\n');
                const columntNames = columns
                  .split(',')
                  .map(c => `'${c}'`)
                  .join(',');
                const insert = rows.reduce(
                  (acc, values) =>
                    (acc += `INSERT INTO "${
                      filename[1]
                    }" (${columntNames}) VALUES (${values.split(',').map(x => {
                      if (x === '') return 'NULL';
                      if (!isNaN(x)) return x;
                      switch (x.toLowerCase()) {
                        case 'null':
                        case 'false':
                        case 'true':
                          return x;
                        default:
                          return `'${x}'`;
                      }
                    })});`),
                  ''
                );
                State.db.run(insert);
              } else if (type === 'sch') {
                State.db.run(window.atob(e.target.result.split('base64,')[1]));
              }
              if (i === files.length - 1) {
                CONSOLE.value = '';
                document.body.removeChild(upload);
              }
            };
            reader.readAsDataURL(files[i]);
          }
        },
        false
      );

      upload.click();
    }
    case 'FROM_FILE':
      {
        const upload = document.createElement('input');
        document.body.appendChild(upload);
        upload.style.display = 'none';
        upload.type = 'file';
        upload.name = 'load-file';

        upload.addEventListener(
          'change',
          e => {
            const file = e.currentTarget.files[0];
            const reader = new FileReader();
            reader.onload = async e => {
              const [columns, ...rows] = window
                .atob(e.target.result.split('base64,')[1])
                .split('\n');
              const columntNames = columns
                .split(',')
                .map(c => `'${c}'`)
                .join(',');
              const insert = rows.reduce(
                (acc, values) =>
                  (acc += `INSERT INTO "${
                    stdArgs[0]
                  }" (${columntNames}) VALUES (${values.split(',').map(x => {
                    if (x === '') return 'NULL';
                    if (!isNaN(x)) return x;
                    switch (x.toLowerCase()) {
                      case 'null':
                      case 'false':
                      case 'true':
                        return x;
                      default:
                        return `'${x}'`;
                    }
                  })});`),
                ''
              );
              State.db.run(insert);
              execute({ value: `TABLE ${stdArgs[0]}` });
              CONSOLE.value = '';
              document.body.removeChild(upload);
            };
            reader.readAsDataURL(file);
          },
          false
        );

        upload.click();
      }
      break;
    case 'HELP':
      editor.setValue(`-- HELP: list these commands
-- SETUP: runs a setup query from the editor and then clears the editor
-- CLOSE: close the db
-- CLEAR: clears the editor
-- COPY: copies the query output
-- RUN: executes the current query
-- PARAMS: view current params
-- SET: set params [params] example: { "$id": 3, "$name": 'John' } (quotes are important)
-- SELECT: replace content with select query for a [tablename]
-- TABLE: outputs [tablename] as table
-- INFO: display schema of [tablename] as table
-- TABLES: show a list of tables
-- IMPORT: imports [base64DB]
-- EXPORT: exports current db as base64 string
-- FROM_FILE: insert into [tablename] data from [file]
-- FROM_FOLDER: insert data from [folder] where csv files get inserted in tables which names are the filenames
-- CSV: download current table as csv file with [name]
-- STASH: stash all tables in localStorage
-- RESET: load db from stash state
-- DROP: drop tables [table1 table2 table3]
-- WHYPE: reset to empty db
-- FORGET: clear stash
-- EMPLOYEES: prepare a mock table of employees

${editor.getValue()}`);
      CONSOLE.value = '';
      break;
    default:
      printErrors(CMD + ' does not exist!');
      break;
  }
};
