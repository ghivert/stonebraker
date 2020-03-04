const path = require('path')
const SQL = require('../src')

const query = (...args) => {
  return args
}

const req = SQL.convert({ query })

const samplePath = path.resolve(__dirname, './sample.sql')

const createTableQuery =
  'create table caravel_migrations (version text primary key)'
const migrationsTableExistingQuery = [
  'select exists (select table_name from information_schema.tables',
  "where table_name = \\'caravel_migrations\\')",
].join(' ')
const selectAllQuery = 'select * from caravel_migrations order by version'
const selectQuery = 'select * from caravel_migrations where id = $1'

describe('Stonebraker', () => {
  test('convert all functions in SQL file', () => {
    const functions = req(samplePath)
    expect(functions).toHaveProperty('createMigrationsTable')
    expect(functions).toHaveProperty('isMigrationsTableExisting')
    expect(functions).toHaveProperty('getAllMigrations')
    expect(functions).toHaveProperty('selectById')
  })
  test('return correct SQL queries', () => {
    const functions = req(samplePath)
    const create = functions.createMigrationsTable()
    const existing = functions.isMigrationsTableExisting()
    const all = functions.getAllMigrations()
    const select = functions.selectById({ id: 'anything' })
    expect(create).toEqual([createTableQuery, []])
    expect(existing).toEqual([migrationsTableExistingQuery, []])
    expect(all).toEqual([selectAllQuery, []])
    expect(select).toEqual([selectQuery, ['anything']])
  })
})
