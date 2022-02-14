export const camelize = (text: string) => {
  const regex = /^([A-Z])|[\s-_]+(\w)/g
  return text.replace(regex, (_match, p1, p2) => {
    return p2 ? p2.toUpperCase() : p1.toLowerCase()
  })
}

export const removeWhitespaces = (command: string) => {
  return command
    .replace(/\s\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
}
