const camelize = text => {
  const regex = /^([A-Z])|[\s-_]+(\w)/g
  return text.replace(regex, (match, p1, p2) => {
    if (p2) {
      return p2.toUpperCase()
    } else {
      return p1.toLowerCase()
    }
  })
}

module.exports = camelize
