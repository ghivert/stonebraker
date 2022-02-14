import { Command, Commands, Metadata, Parts } from './types'
import { removeWhitespaces } from './helpers/strings'
import * as Meta from './metadata'

const convert = ({ keys }: Metadata, command: string[]) => {
  const comm = command.join(' ')
  const joinedCommand = comm.endsWith(';') ? comm.slice(0, -1) : comm
  if (!keys) return joinedCommand
  return keys.reduce((comm, key, index) => {
    const matcher = new RegExp(`\\$${key}`, 'g')
    return comm.replace(matcher, `$${index + 1}`)
  }, joinedCommand)
}

const create = (metadata: string[], cmd: string[]): Command => {
  const meta = Meta.convert(metadata)
  const converted = convert(meta, cmd)
  const command = removeWhitespaces(converted)
  return { metadata: meta, pp: cmd.join('\n'), command }
}

const separateCmds = ({ commands, lines }: Commands, line: string) => {
  const onlyCode = line.trim()
  if (onlyCode.startsWith('--')) {
    return { commands, lines: [...lines, line] }
  } else if (onlyCode.endsWith(';')) {
    return { commands: [...commands, [...lines, line]], lines: [] }
  } else if (onlyCode.length === 0) {
    return { commands, lines }
  } else {
    return { commands, lines: [...lines, line] }
  }
}

const toCommand = (lines: string[]) => {
  const acc: Parts = [[], []]
  const [metadata, command] = lines.reduce(Meta.keep, acc)
  return create(metadata, command)
}

export const extract = (file: string) => {
  const splitted = file.split('\n')
  const acc: Commands = { commands: [], lines: [] }
  const { commands, lines } = splitted.reduce(separateCmds, acc)
  const cmds = lines.length === 0 ? commands : [...commands, lines]
  return cmds.map(toCommand)
}
