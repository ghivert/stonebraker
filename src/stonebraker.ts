import * as fs from 'fs'
import * as pg from 'pg'
import { camelize } from './helpers/strings'
import { Command, Queries, Query } from './types'
import * as Cmds from './commands'
export { Queries } from './types'

const toQueries = (client: pg.Client, commands: Command[]) => {
  const acc: Queries = {}
  return commands.reduce((functions, command_) => {
    const { metadata, command, pp } = command_
    const { name, keys } = metadata
    if (!name) return functions
    const func: Query = (args: { [key: string]: any }) => {
      const argsValue = keys.map((key) => args[camelize(key)])
      return client.query(command, argsValue)
    }
    func.toString = () => pp
    func.command = () => command
    return { ...functions, [name]: func }
  }, acc)
}

export const convert = (client: pg.Client) => (filePath: string) => {
  const file = fs.readFileSync(filePath, 'utf8')
  const commands = Cmds.extract(file)
  const functions = toQueries(client, commands)
  return functions
}
