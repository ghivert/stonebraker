const path = require('path')
const SQL = require('../dist/stonebraker')

const query = (...args) => args
const req = SQL.convert({ query })
const samplePath = path.resolve(__dirname, './sample.sql')
const functions = req(samplePath)

const createTableQuery =
  'create table caravel_migrations (version text primary key)'
const migrationsTableExistingQuery = [
  'select exists (select table_name from information_schema.tables',
  "where table_name = 'caravel_migrations')",
].join(' ')
const selectAllQuery = 'select * from caravel_migrations order by version'
const selectQuery = 'select * from caravel_migrations where id = $1'
const selectName =
  'select * from caravel_migrations where id = $1 and name = $2'

describe('Stonebraker', () => {
  test('convert all functions in SQL file', () => {
    expect(functions).toHaveProperty('createMigrationsTable')
    expect(functions).toHaveProperty('isMigrationsTableExisting')
    expect(functions).toHaveProperty('getAllMigrations')
    expect(functions).toHaveProperty('selectById')
  })
  test('return correct SQL queries', () => {
    const create = functions.createMigrationsTable()
    const existing = functions.isMigrationsTableExisting()
    const all = functions.getAllMigrations()
    const select = functions.selectById({ id: 'anything' })
    const selectName_ = functions.selectByIdAndName({ id: 'a', name: 'b' })
    expect(create).toEqual([createTableQuery, []])
    expect(existing).toEqual([migrationsTableExistingQuery, []])
    expect(all).toEqual([selectAllQuery, []])
    expect(select).toEqual([selectQuery, ['anything']])
    expect(selectName_).toEqual([selectName, ['a', 'b']])
  })
})
