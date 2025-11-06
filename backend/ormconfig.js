const path = require('path');

const sqlJsWasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
const databaseFile = process.env.DB_FILE || 'travel-management.sqlite';

module.exports = {
  type: 'sqljs',
  location: databaseFile,
  autoSave: true,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  migrations: ['migrations/*.ts'],
  logging: false,
  sqlJsConfig: {
    locateFile: (fileName) => path.join(path.dirname(sqlJsWasmPath), fileName),
  },
};
