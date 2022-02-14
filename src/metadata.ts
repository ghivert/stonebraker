import { Metadata, Parts } from './types'
import { camelize } from './helpers/strings'

// prettier-ignore
const handleKeyword = (keyword: string, content: string) => {
  switch (keyword) {
    case 'keys': return content.split(',').map((k) => camelize(k.trim()))
    case 'name': return camelize(content)
    default: return console.warn(`Keyword ${keyword} not implemented.`)
  }
}

export const convert = (metadata: string[]): Metadata => {
  const acc: Metadata = { keys: [] }
  return metadata.reduce((acc, val) => {
    const [keyword, value] = val.split(':')
    const result = handleKeyword(keyword, value.trim())
    if (!result) return acc
    return { ...acc, [keyword]: result }
  }, acc)
}

export const keep = ([metadata, command]: Parts, line: string): Parts => {
  if (line.trim().startsWith('--')) {
    if (command.length !== 0) return [metadata, command]
    const allMetadata = [...metadata, line.slice(2).trim()]
    return [allMetadata, command]
  } else {
    const allCommand = [...command, line]
    return [metadata, allCommand]
  }
}
