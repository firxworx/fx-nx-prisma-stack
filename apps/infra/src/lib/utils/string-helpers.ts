/**
 * Convert the given input string to its PascalCase equivalent.
 *
 * Among other supported input formats, this function will convert upper-snake-case
 * e.g. UPPER_SNAKE_CASE to PascaleCase e.g. 'UpperSnakeCase'.
 *
 * Acknowledgement to @kalicki2k on SO <https://stackoverflow.com/a/53952925/9171738>
 */
export const toPascalCase = (input: string): string => {
  return `${input}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(new RegExp(/\s+(.)(\w*)/, 'g'), (_$1, $2, $3) => `${$2.toUpperCase() + $3}`)
    .replace(new RegExp(/\w/), (s) => s.toUpperCase())
}
