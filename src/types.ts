import * as pg from 'pg'

export type Metadata = { name?: string; keys: string[] }
export type Parts = [string[], string[]]
export type Command = { metadata: Metadata; pp: string; command: string }
export type Commands = { commands: string[][]; lines: string[] }
export type Queries = { [name: string]: Query }
export type Query = {
  (args: { [key: string]: any }): Promise<pg.QueryResult<any>>
  toString(): string
  command(): string
}
