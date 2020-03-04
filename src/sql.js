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
  const comm = command.join('')
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

const newCommand = ({ metadata, command }) => {
  const meta = convertMetadata(metadata)
  return {
    metadata: meta,
    pp: toPP(command),
    command: convertCommand(meta, command),
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

const escapeQuotes = command => {
  return command.replace(/'/g, "\\'").replace(/"/g, '\\"')
}

const generateFunction = ({ client, keys, command, queries }) => {
  return args => {
    const arguments = keys.map(key => args[key])
    const query = escapeQuotes(command)
    return client.query(query, arguments)
  }
}

const createFunction = (client, keys, command) => {
  const queries = `${keys || []}`
  const body = generateFunction({ client, keys: keys || [], command, queries })
  return body
}

const turnToFunction = (client, commands) => {
  return commands.reduce((functions, command_) => {
    const { metadata, command } = command_
    const { name, keys } = metadata
    const func = createFunction(client, keys, command)
    return { ...functions, [name]: func }
  }, {})
}

const convert = client => filePath => {
  const absolute = path.resolve(__dirname, filePath)
  const file = fs.readFileSync(absolute, 'utf8')
  const rawCommands = extractCommands(file)
  const commands = rawCommands.map(toCommand)
  const functions = turnToFunction(client, commands)
  console.log(Object.values(functions).map(t => t({ id: 'test' })))
  return functions
}

module.exports = {
  convert,
}

convert({ query: (...args) => console.log(args) })('./test.sql')
