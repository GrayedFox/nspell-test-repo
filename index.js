const nspell = require('nspell')

const dictionaryDe = require('dictionary-de')
const dictionaryEn = require('dictionary-en')
const dictionaryNl = require('dictionary-nl')
const LANGUAGES_LENGTH = 3

const userDicts = []
const languageCodes = [] // 'de-de', 'en-en', 'nl-nl' populated in order
const customWords = ['kablam', 'geluk', 'brot']

// Custom Words:
// - kablam is misspelt in all three languages
// - geluk is misspelt in English and German but is a valid Dutch word
// - brot is misspelt in all three languages; in German it is a noun and should thus be "Brot"

// A User needs dictionaries,langauges, and optionally some custom words
class User {
  constructor (dictionaries, languages, ownWords) {
    this.dicts = dictionaries // array of dictionaries [{ aff: '', dic: '' }]
    this.langs = languages // array of in use langauge codes ['de-de', 'en-au', 'nl-nl']
    this.ownWords = ownWords // array of custom words: ['kablam', 'brot', 'geluk']
    this.addWord = this.addWord.bind(this)
    this.removeWord = this.removeWord.bind(this)
    this.spellers = this._createSpellers() // nspell instances by language { 'de-de': nspell }
  }

  // add word to user.ownWords and update existing spell checker instances
  addWord (word) {
    const misspeltLangs = []
    this.langs.forEach(language => {
      const speller = this.spellers[language]
      const misspelt = !speller.correct(word)
      console.log(`\n"${word}" correct in "${language}": ${speller.correct(word)}`)
      if (misspelt) {
        console.log(`adding ${word} to ${language}`)
        speller.add(word)
        // we should enter this if, since after adding a word it should now be marked as correct in
        // that language
        if (misspelt !== speller.correct(word)) {
          console.log('\x1b[31m%s\x1b[0m', `${word} still incorrect!`)
        } else {
          console.log('\x1b[32m%s\x1b[0m',`${word} is now correct`)
        }
        misspeltLangs.push(language)
      }
    })
    if (misspeltLangs.length > 0) { this.ownWords[word] = misspeltLangs }
  }

  // remove word from user.ownWords and update existing spell checker instances
  removeWord (word) {
    this.ownWords[word].forEach(language => {
      if (this.spellers[language]) this.spellers[language].remove(word)
    })
    delete this.ownWords[word]
  }

  // create nspell instances - should only ever be called during class instantiation
  _createSpellers () {
    this.spellers = {}

    // create nspell instances based on dictionaries
    for (let i = 0; i < this.dicts.length; i++) {
      this.spellers[this.langs[i]] = nspell(this.dicts[i])
    }

    if (this.ownWords.length > 0) {
      this.ownWords.forEach((word) => { this.addWord(word) })
    }

    return this.spellers
  }
}

// wrap dictionary functions so we can populate languageCodes in order of dictionaries loaded
// (dictionary callbacks return error or dictionary only)
function loadDict (dictionary, languageCode) {
  dictionary((err, dict) => {
    userDicts.push(dict)
    languageCodes.push(languageCode)
    if (userDicts.length === LANGUAGES_LENGTH) {
      console.log('instantiating user, please wait...')
      const user = new User(userDicts, languageCodes, customWords)
      // first remove brot from user.ownWords so we can add it back to custom words
      user.removeWord(customWords[2])
      // add brot to user.ownWords -- now it is properly added and marked as correct
      console.log('\n ADD WORD via user.addWord')
      user.addWord(customWords[2])
    }
  })
}

function main () {
  loadDict(dictionaryDe, 'de-de')
  loadDict(dictionaryEn, 'en-en')
  loadDict(dictionaryNl, 'nl-nl')
}

main()
