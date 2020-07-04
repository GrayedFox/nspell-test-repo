const nspell = require('nspell')
const dictionaryDe = require('dictionary-de')

// wrap dictionary functions so we can populate languageCodes in order of dictionaries loaded
// (dictionary callbacks return error or dictionary only)
function onload (err, dictionary) {
  const spell = nspell(dictionary)
  spell.correct('zeit')
  spell.add('zeit')
  if (!spell.correct('zeit')) console.log('\x1b[31m%s\x1b[0m', `"zeit" still incorrect!`)
  spell.remove('zeit')
  spell.add('zeit')
  if (spell.correct('zeit')) console.log('\x1b[32m%s\x1b[0m',`"zeit" is now correct (after removing and then adding it again)`)

  spell.correct('kablam')
  spell.add('kablam')
  if (spell.correct('kablam')) console.log('\x1b[32m%s\x1b[0m',`"kablam" is now correct`)
}

dictionaryDe(onload)
