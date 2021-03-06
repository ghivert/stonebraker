const fs = require('fs')
const path = require('path')
const camelize = require('./helpers/camelize')

const handleKeyword = (keyword, content) => {
  switch (keyword) {
    case 'keys': {
      const keys = content.split(',')
      return keys.map(key => key.trim())
    }
    case 'name': {
      return camelize(content)
    }
    default: {
      console.error(`Keyword ${keyword} unrecognized.`)
      throw new Error()
    }
  }
}

const convertMetadata = metadata => {
  return metadata.reduce((acc, val) => {
    const [keyword, value] = val.split(':')
    return { ...acc, [keyword]: handleKeyword(keyword, value.trim()) }
  }, {})
}

const toPP = command => {
  return command.join('\n')
}

const joinCommand = command => {
  const comm = command.join(' ')
  if (comm.endsWith(';')) {
    return comm.slice(0, -1)
  } else {
    return comm
  }
}

const convertCommand = ({ keys }, command) => {
  const joinedCommand = joinCommand(command)
  if (keys) {
    return keys.reduce((comm, key, index) => {
      const matcher = new RegExp(`\\$${key}`, 'g')
      return comm.replace(matcher, `$${index + 1}`)
    }, joinedCommand)
  } else {
    return joinedCommand
  }
}

const toCorrectQuery = command => {
  return command
    .replace(/\s\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
}

const newCommand = ({ metadata, command }) => {
  const meta = convertMetadata(metadata)
  return {
    metadata: meta,
    pp: toPP(command),
    command: toCorrectQuery(convertCommand(meta, command)),
  }
}

const keepMetadata = ([metadata, command], line) => {
  if (line.trim().startsWith('--')) {
    if (command.length === 0) {
      const allMetadata = [...metadata, line.slice(2).trim()]
      return [allMetadata, command]
    } else {
      return [metadata, command]
    }
  } else {
    const allCommand = [...command, line]
    return [metadata, allCommand]
  }
}

const toCommand = lines => {
  const accumulator = [[], []]
  const [metadata, command] = lines.reduce(keepMetadata, accumulator)
  return newCommand({ metadata, command })
}

const groupByCommand = ({ commands, lines }, line) => {
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

const extractCommands = file => {
  const splitted = file.split('\n')
  const accumulator = { commands: [], lines: [] }
  const { commands, lines } = splitted.reduce(groupByCommand, accumulator)
  if (lines.length === 0) {
    return commands
  } else {
    return [...commands, lines]
  }
}

const generateFunction = ({ client, keys, command }) => {
  return args => {
    const argsValue = keys.map(key => args[camelize(key)])
    return client.query(command, argsValue)
  }
}

const createFunction = (client, keys, command) => {
  const body = generateFunction({ client, keys: keys || [], command })
  return body
}

const turnToFunction = (client, commands) => {
  return commands.reduce((functions, command_) => {
    const { metadata, command, pp } = command_
    const { name, keys } = metadata
    const func = createFunction(client, keys, command)
    func.toString = () => pp
    func.command = () => command
    return { ...functions, [name]: func }
  }, {})
}

const convert = client => filePath => {
  const absolute = path.resolve(__dirname, filePath)
  const file = fs.readFileSync(absolute, 'utf8')
  const rawCommands = extractCommands(file)
  const commands = rawCommands.map(toCommand)
  const functions = turnToFunction(client, commands)
  return functions
}

module.exports = {
  convert,
}
